import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { RefreshCw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { DataTableFacetedFilter, type FacetedFilterOption } from "@/components/data-table/data-table-faceted-filter"
import { getErrorMessage } from "@/lib/api-error"
import { cn } from "@/lib/utils"
import {
  buildBuckets,
  buildYearRuns,
  clampRange,
  endOfMonthKey,
  getGranularity,
  isMultiYear,
  startOfMonthKey,
  todayKey,
  type Bucket,
  type Granularity,
} from "@/pages/reports/payment-schedule/date-buckets"
import { paymentScheduleApi } from "@/pages/reports/payment-schedule/api/payment-schedule"
import type { ObjectPaymentSchedule, PaymentScheduleEntry } from "@/pages/reports/payment-schedule/types"

const CHART_HEIGHT = 220
const BAR_GAP_PX = 2
// Заказчик подтвердил: 1C всегда отдаёт суммы по графику оплат в USD, отдельного фильтра/
// переключателя валюты в разделе нет.
const CURRENCY = "USD"

type FlatEntry = PaymentScheduleEntry & { object_id: string; object_title: string }

type FeedItem = {
  date: string
  sum: number
  kontragent: string
  contract: string
  object_title: string
}

type FeedGroup = {
  date: string
  total: number
  items: FeedItem[]
}

function flattenItems(items: ObjectPaymentSchedule[]): FlatEntry[] {
  return items.flatMap((item) =>
    item.entries.map((e) => ({ ...e, object_id: item.object_id, object_title: item.object_title }))
  )
}

function sumInRange(entries: FlatEntry[], kind: "plan" | "fact", fromKey: string, toKey: string): number {
  let total = 0
  for (const e of entries) {
    for (const p of e[kind]) {
      const dayKey = p.date.slice(0, 10)
      if (dayKey >= fromKey && dayKey <= toKey) total += p.sum
    }
  }
  return total
}

function getObjectOptions(entries: FlatEntry[]): FacetedFilterOption[] {
  const map = new Map<string, string>()
  for (const e of entries) map.set(e.object_id, e.object_title)
  return Array.from(map.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "ru"))
}

function buildFeed(entries: FlatEntry[], fromKey: string, toKey: string): FeedItem[] {
  const items: FeedItem[] = []
  for (const e of entries) {
    for (const f of e.fact) {
      const dayKey = f.date.slice(0, 10)
      if (dayKey < fromKey || dayKey > toKey) continue
      items.push({ date: dayKey, sum: f.sum, kontragent: e.kontragent, contract: e.contract, object_title: e.object_title })
    }
  }
  items.sort((a, b) => a.date.localeCompare(b.date))
  return items
}

function groupFeedByDate(items: FeedItem[]): FeedGroup[] {
  const map = new Map<string, FeedItem[]>()
  for (const it of items) {
    if (!map.has(it.date)) map.set(it.date, [])
    map.get(it.date)!.push(it)
  }
  return Array.from(map.entries()).map(([date, groupItems]) => ({
    date,
    items: groupItems,
    total: groupItems.reduce((s, i) => s + i.sum, 0),
  }))
}

function formatAmount(value: number): string {
  return value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDateLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split("-")
  return `${d}.${m}.${y}`
}

function formatRangeLabel(fromKey: string, toKey: string): string {
  return `${formatDateLabel(fromKey)} — ${formatDateLabel(toKey)}`
}

/** Фиксированная ширина столбца по макету — свечи не растягиваются на всю колонку, когда
 * бакетов мало (например, 3-4 месяца на всю ширину графика). */
function barWidthPx(granularity: Granularity, bucketCount: number): number {
  if (granularity === "month") return 26
  if (granularity === "week") return 20
  return bucketCount <= 16 ? 18 : 9
}

const TICK_STEPS = [5e3, 1e4, 2e4, 2.5e4, 5e4, 1e5, 2e5, 2.5e5, 5e5, 1e6, 2e6, 2.5e6, 5e6, 1e7]

function formatCompact(value: number): string {
  if (value >= 1e6) return `${(value / 1e6).toString().replace(".", ",")} млн`
  return `${value / 1000} тыс`
}

/** Шаг сетки — "круглое" число, дающее не больше ~4 горизонтальных линий, как в макете,
 * а не произвольные доли от максимума. */
function computeTicks(maxVal: number): { bottom: number; label: string }[] {
  const step = TICK_STEPS.find((x) => maxVal / x <= 4) ?? 2e7
  const ticks: { bottom: number; label: string }[] = []
  for (let t = step; t <= maxVal; t += step) {
    ticks.push({ bottom: (t / maxVal) * CHART_HEIGHT, label: formatCompact(t) })
  }
  return ticks
}

function getDefaultBucketKey(
  bars: { key: string; startKey: string; endKey: string }[],
  today: string
): string | null {
  const current = bars.find((b) => b.startKey <= today && today <= b.endKey)
  if (current) return current.key
  const past = bars.filter((b) => b.startKey <= today)
  if (past.length > 0) return past[past.length - 1].key
  return bars[0]?.key ?? null
}

export function PaymentSchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const today = todayKey()
  const dateFrom = searchParams.get("date_from") || startOfMonthKey(today)
  const rawDateTo = searchParams.get("date_to") || endOfMonthKey(today)
  const { to: dateTo, clamped } = clampRange(dateFrom, rawDateTo)

  const selectedObjects = searchParams.getAll("object")

  const setDateFrom = (value: string) => {
    if (!value) return
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("date_from", value)
      return next
    }, { replace: true })
  }

  const setDateTo = (value: string) => {
    if (!value) return
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("date_to", value)
      return next
    }, { replace: true })
  }

  const setObjects = (values: string[]) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete("object")
      for (const value of values) next.append("object", value)
      return next
    }, { replace: true })
  }

  const query = useQuery({
    queryKey: ["payment-schedule", dateFrom, dateTo],
    queryFn: () => paymentScheduleApi.list({ date_from: dateFrom, date_to: dateTo }),
  })

  const items = query.data?.items ?? []
  const failedObjects = query.data?.failed_objects ?? []

  // Отчёт пересчитывается на каждый рендер без useMemo — объём данных (кассы/контрагенты по
  // паре десятков объектов) слишком мал, чтобы это было заметно, а React Compiler не даёт
  // мемоизировать значение, зависящее от несохраняемого между рендерами массива/объекта.
  const allEntries = flattenItems(items)

  const objectOptions = getObjectOptions(allEntries)
  const objectFilteredEntries = selectedObjects.length > 0
    ? allEntries.filter((e) => selectedObjects.includes(e.object_id))
    : allEntries

  const entries = objectFilteredEntries

  const granularity = getGranularity(dateFrom, dateTo)
  const buckets = buildBuckets(dateFrom, dateTo, granularity)
  const multiYear = isMultiYear(buckets)
  const yearRuns = buildYearRuns(buckets)

  const bars = buckets.map((b) => ({
    ...b,
    plan: sumInRange(entries, "plan", b.startKey, b.endKey),
    fact: sumInRange(entries, "fact", b.startKey, b.endKey),
  }))
  const maxVal = Math.max(1, ...bars.map((b) => Math.max(b.plan, b.fact)))

  const feedItems = buildFeed(entries, dateFrom, dateTo)
  const feedGroups = groupFeedByDate(feedItems)
  const feedRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Нет отдельного состояния "сброшен ли выбор": .find просто не находит прежний ключ, если
  // диапазон дат изменился и такого бакета больше нет — тогда selectedBucket естественно null,
  // без эффекта, который сбрасывал бы его вручную.
  const [selectedBucketKey, setSelectedBucketKey] = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState<string | null>(null)

  const totalPlan = sumInRange(entries, "plan", dateFrom, dateTo)
  const totalFact = sumInRange(entries, "fact", dateFrom, dateTo)
  const totalDiff = totalPlan - totalFact
  const totalPct = totalPlan > 0 ? Math.round((totalFact / totalPlan) * 100) : (totalFact > 0 ? 100 : 0)

  // Как в макете — всегда выбрана какая-то свеча (сегодняшняя, иначе последняя прошедшая),
  // а не абстрактный "весь период"; выбор сбрасывается на дефолт сам, когда диапазон дат
  // меняется и клика по прежнему ключу среди новых бакетов уже нет.
  const effectiveBucketKey = bars.some((b) => b.key === selectedBucketKey)
    ? selectedBucketKey
    : getDefaultBucketKey(bars, today)
  const selectedBucket = bars.find((b) => b.key === effectiveBucketKey) ?? null
  const selTitle = selectedBucket
    ? (granularity === "day" ? formatDateLabel(selectedBucket.startKey) : `${selectedBucket.label} ${selectedBucket.sub}`)
    : "Весь период"
  const selPlan = selectedBucket ? selectedBucket.plan : totalPlan
  const selFact = selectedBucket ? selectedBucket.fact : totalFact
  const selDiff = selPlan - selFact
  const selPct = selPlan > 0 ? Math.round((selFact / selPlan) * 100) : (selFact > 0 ? 100 : 0)

  const lastToastedAt = useRef(0)
  useEffect(() => {
    if (query.isFetching) return
    if (!query.data) return
    if (lastToastedAt.current === query.dataUpdatedAt) return
    lastToastedAt.current = query.dataUpdatedAt
    toast.success("Данные по графику оплат получены")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.dataUpdatedAt, query.isFetching])

  const handleRefresh = async () => {
    try {
      await query.refetch({ throwOnError: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleBarClick = (bucket: Bucket & { plan: number; fact: number }) => {
    setSelectedBucketKey(bucket.key)
    const group = feedGroups.find((g) => g.date >= bucket.startKey && g.date <= bucket.endKey)
    if (!group) {
      setShakeKey(bucket.key)
      setTimeout(() => setShakeKey((k) => (k === bucket.key ? null : k)), 400)
      toast.message("Нет оплат за этот период", {
        description: "В выбранном промежутке не найдено ни одной оплаты",
      })
      return
    }
    feedRefs.current[group.date]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const isFutureBucket = (bucket: Bucket) => bucket.startKey > today

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">График оплаты</h2>
          <p className="text-muted-foreground">План и факт поступлений за {formatRangeLabel(dateFrom, dateTo)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[160px]"
            />
            <div className="h-px w-3 bg-border shrink-0" />
            <Input
              type="date"
              value={rawDateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[160px]"
            />
          </div>

          {objectOptions.length > 1 && (
            <DataTableFacetedFilter
              title="Объект"
              options={objectOptions}
              selected={selectedObjects}
              onChange={setObjects}
            />
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={query.isFetching}
            aria-label="Обновить"
          >
            {query.isRefetching ? <Spinner size={16} /> : <RefreshCw className="size-4" />}
          </Button>
        </div>
        {clamped && (
          <p className="text-xs text-amber-600">
            Период ограничен 12 месяцами — показано по {formatDateLabel(dateTo)}
          </p>
        )}
      </div>

      {failedObjects.length > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-200/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-100">
          <TriangleAlert className="size-4 shrink-0" />
          Не удалось получить данные по объектам: {failedObjects.map((f) => f.object_title).join(", ")}
        </div>
      )}

      {query.isPending ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Spinner size={20} />
        </div>
      ) : query.isError ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Не удалось загрузить график оплат, попробуйте позже
        </div>
      ) : allEntries.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Нет доступных объектов с данными по графику оплат
        </div>
      ) : (
        <div className="rounded-md border bg-card grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="p-5 flex flex-col gap-4 min-w-0">
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1">
                <div className="text-base font-semibold">План и факт поступлений</div>
                <div className="text-sm text-muted-foreground">Валюта: {CURRENCY}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 rounded-md border">
              <div className="p-3.5 flex flex-col gap-1 border-r">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-xs bg-zinc-400 inline-block" />
                  План
                </div>
                <div className="font-mono text-xl font-medium tabular-nums">{formatAmount(totalPlan)}</div>
              </div>
              <div className="p-3.5 flex flex-col gap-1 border-r">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-xs bg-blue-600 inline-block" />
                  Факт
                </div>
                <div className="font-mono text-xl font-medium tabular-nums">{formatAmount(totalFact)}</div>
              </div>
              <div className="p-3.5 flex flex-col gap-1 border-r">
                <div className="text-xs text-muted-foreground">Разница</div>
                <div className="font-mono text-xl font-medium tabular-nums">{formatAmount(totalDiff)}</div>
              </div>
              <div className="p-3.5 flex flex-col gap-1">
                <div className="text-xs text-muted-foreground">Выполнение</div>
                <div className="font-mono text-xl font-medium tabular-nums">{totalPct}%</div>
              </div>
            </div>

            <div className="flex items-baseline gap-4 text-sm flex-wrap min-h-5">
              <b className="font-semibold">{selTitle}</b>
              <span className="text-muted-foreground">
                План <b className="font-mono font-medium text-foreground">{formatAmount(selPlan)}</b>
              </span>
              <span className="text-muted-foreground">
                Факт <b className="font-mono font-medium text-blue-600">{formatAmount(selFact)}</b>
              </span>
              <span className="text-muted-foreground">
                Разница <b className="font-mono font-medium text-foreground">{formatAmount(selDiff)}</b>
              </span>
              <span className="text-muted-foreground">{selPct}%</span>
            </div>

            {multiYear && (
              <div className="flex pl-12 -mb-3">
                {yearRuns.map((run, i) => (
                  <div
                    key={`${run.year}-${i}`}
                    style={{ flex: run.span }}
                    className={cn("min-w-0 h-5 relative", i > 0 && "border-l")}
                  >
                    <span className="absolute left-1.5 top-0.5 font-mono text-xs font-semibold">{run.year}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="relative h-[220px] border-b">
              {computeTicks(maxVal).map((t) => (
                <div
                  key={t.bottom}
                  className="absolute left-0 right-0 border-t border-dashed border-border/70 pointer-events-none"
                  style={{ bottom: `${t.bottom}px` }}
                >
                  <span className="absolute left-0 -top-[15px] font-mono text-[11px] text-muted-foreground">
                    {t.label}
                  </span>
                </div>
              ))}
              <div className="absolute left-12 right-0 top-0 bottom-0 flex">
                {bars.map((b) => (
                  <div
                    key={b.key}
                    onClick={() => handleBarClick(b)}
                    title={`${b.label} ${b.sub}  ·  План ${formatAmount(b.plan)}  ·  Факт ${formatAmount(b.fact)}`}
                    className={cn(
                      "flex-1 min-w-0 flex items-end justify-center cursor-pointer rounded-t transition-colors",
                      "hover:bg-accent/60",
                      shakeKey === b.key && "animate-shake",
                      effectiveBucketKey === b.key && "bg-blue-50 dark:bg-blue-950/30 shadow-[inset_0_-2px_0_0_#2563eb]"
                    )}
                    style={{ gap: BAR_GAP_PX }}
                  >
                    {b.plan > 0 && (
                      <div
                        className={cn(
                          "box-border rounded-t-[3px]",
                          isFutureBucket(b) ? "border border-dashed border-zinc-400 bg-transparent" : "bg-zinc-400"
                        )}
                        style={{ width: barWidthPx(granularity, bars.length), height: Math.round((b.plan / maxVal) * CHART_HEIGHT) }}
                      />
                    )}
                    {b.fact > 0 && (
                      <div
                        className="bg-blue-600 rounded-t-[3px]"
                        style={{ width: barWidthPx(granularity, bars.length), height: Math.round((b.fact / maxVal) * CHART_HEIGHT) }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex pl-12 -mt-2.5">
              {bars.map((b) => {
                const isFuture = isFutureBucket(b)
                const isCurrent = b.startKey <= today && today <= b.endKey
                return (
                  <div key={b.key} className="flex-1 min-w-0 flex flex-col items-center gap-px">
                    <span
                      className={cn(
                        "font-mono text-[11px] font-medium whitespace-nowrap",
                        isCurrent ? "text-blue-600" : isFuture ? "text-muted-foreground" : "text-foreground/80"
                      )}
                    >
                      {b.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{b.sub}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex gap-1.5 items-center">
                <span className="size-2.5 rounded-xs bg-zinc-400 inline-block" /> План
              </span>
              <span className="flex gap-1.5 items-center">
                <span className="size-2.5 rounded-xs bg-blue-600 inline-block" /> Факт
              </span>
              <span className="flex gap-1.5 items-center">
                <span className="size-2.5 rounded-xs border border-dashed border-zinc-400 box-border inline-block" /> План в будущих датах
              </span>
              <span className="flex-1" />
              <span>Кликните столбец — лента справа прокрутится к оплатам</span>
            </div>
          </div>

          <div className="border-t lg:border-t-0 lg:border-l flex flex-col bg-muted/30">
            <div className="p-5 pb-3.5 flex flex-col gap-1.5 border-b">
              <div className="flex justify-between items-baseline gap-2.5">
                <div className="text-base font-semibold">Оплаты</div>
                <div className="font-mono text-sm font-bold text-blue-600">{formatAmount(totalFact)}</div>
              </div>
              <div className="text-xs text-muted-foreground">{feedItems.length} за период</div>
              <div className="text-xs text-muted-foreground">
                Выбрано: <span className="text-foreground font-medium">{selTitle}</span>{" "}
                — <span className="font-mono text-blue-600">{formatAmount(selFact)}</span>
              </div>
            </div>
            <div className="flex-1 relative min-h-[240px]">
              <div className="absolute inset-0 overflow-auto p-3.5 flex flex-col gap-1">
                {feedGroups.length === 0 && (
                  <div className="py-6 px-2 text-center text-sm text-muted-foreground">Нет оплат за выбранный период</div>
                )}
                {feedGroups.map((g) => {
                  const isHighlighted = !!selectedBucket && g.date >= selectedBucket.startKey && g.date <= selectedBucket.endKey
                  return (
                    <div
                      key={g.date}
                      ref={(el) => { feedRefs.current[g.date] = el }}
                      className="flex flex-col gap-1"
                    >
                      <div
                        className={cn(
                          "pt-2.5 px-0.5 flex justify-between text-xs font-medium",
                          isHighlighted ? "text-blue-600" : "text-muted-foreground"
                        )}
                      >
                        <span>{formatDateLabel(g.date)}</span>
                        <span className="font-mono">{formatAmount(g.total)}</span>
                      </div>
                      {g.items.map((it, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "grid grid-cols-[minmax(0,1fr)_auto] gap-x-2.5 gap-y-0.5 p-2 rounded-md border transition-colors",
                            isHighlighted
                              ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900"
                              : "bg-background"
                          )}
                        >
                          <span className="text-sm font-medium truncate">{it.kontragent}</span>
                          <span className="font-mono text-sm text-right">{formatAmount(it.sum)}</span>
                          <span className="col-span-2 text-xs text-muted-foreground truncate">
                            {it.contract} · {it.object_title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
