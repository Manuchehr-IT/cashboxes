import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { RefreshCw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getErrorMessage } from "@/lib/api-error"
import { cn } from "@/lib/utils"
import { cashboxesApi } from "@/pages/reports/cashboxes/api/cashboxes"
import type { ListCashboxesParams, ObjectCashboxes } from "@/pages/reports/cashboxes/types"

const MIN_DATE = "2000-01-01"
const MAX_DATE = "2100-12-31"
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  if (value < MIN_DATE || value > MAX_DATE) return false
  return !Number.isNaN(new Date(value).getTime())
}

/** null — период применим как есть; строка — почему период сейчас не применяется. */
function getDateValidationMessage(dateFrom: string, dateTo: string): string | null {
  if (dateFrom && !isValidDate(dateFrom)) return "Дата «С» должна быть в диапазоне 2000–2100"
  if (dateTo && !isValidDate(dateTo)) return "Дата «По» должна быть в диапазоне 2000–2100"
  if ((dateFrom && !dateTo) || (!dateFrom && dateTo)) return "Укажите обе даты, чтобы применить период"
  if (dateFrom && dateTo && dateFrom > dateTo) return "Дата «С» не может быть позже даты «По»"
  return null
}

function formatAmount(value: number): string {
  return value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Дательный падеж «касса» после «по»: по 1 кассе, но по 2/5/21 кассам. */
function cashboxesDative(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  const isSingular = mod10 === 1 && mod100 !== 11
  return isSingular ? "кассе" : "кассам"
}

function countCashboxes(items: ObjectCashboxes[]): number {
  return items.reduce((sum, group) => sum + group.cashboxes.length, 0)
}

function getCurrencies(items: ObjectCashboxes[]): string[] {
  const set = new Set<string>()
  for (const group of items) {
    for (const c of group.cashboxes) set.add(c.currency)
  }
  return Array.from(set).sort()
}

function sumTotals(items: ObjectCashboxes[], currency: string) {
  return items.reduce(
    (acc, group) => {
      for (const c of group.cashboxes) {
        if (c.currency !== currency) continue
        acc.ost1 += c.ost1
        acc.sump += c.sump
        acc.sumr += c.sumr
        acc.ost2 += c.ost2
      }
      return acc
    },
    { ost1: 0, sump: 0, sumr: 0, ost2: 0 }
  )
}

function StatTile({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-2.5 min-w-[128px]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-lg font-semibold mt-0.5",
          tone === "positive" && "text-green-600",
          tone === "negative" && "text-red-600"
        )}
      >
        {value}
      </p>
    </div>
  )
}

export function CashboxesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCurrency, setSelectedCurrency] = useState("")

  const dateFrom = searchParams.get("date_from") ?? ""
  const dateTo = searchParams.get("date_to") ?? ""

  const setDateFrom = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set("date_from", value)
      else next.delete("date_from")
      return next
    }, { replace: true })
  }

  const setDateTo = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set("date_to", value)
      else next.delete("date_to")
      return next
    }, { replace: true })
  }

  const resetDates = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete("date_from")
      next.delete("date_to")
      return next
    }, { replace: true })
  }

  const hasAnyDate = !!(dateFrom || dateTo)
  const validationMessage = getDateValidationMessage(dateFrom, dateTo)
  const bothDatesValid = !!dateFrom && !!dateTo && validationMessage === null

  // Отправляем date_from/date_to бэкенду только когда обе даты заданы и валидны —
  // иначе 1C трактует частично заполненный период как «без фильтра» и возвращает
  // данные за сегодня, что выглядит как будто фильтр проигнорирован.
  const params: ListCashboxesParams = bothDatesValid ? { date_from: dateFrom, date_to: dateTo } : {}

  const query = useQuery({
    queryKey: ["cashboxes", params],
    queryFn: () => cashboxesApi.list(params),
  })

  const items = query.data?.items ?? []
  const failedObjects = query.data?.failed_objects ?? []

  const currencies = useMemo(() => getCurrencies(items), [items])
  const activeCurrency = currencies.includes(selectedCurrency) ? selectedCurrency : currencies[0] ?? ""
  const totals = useMemo(() => sumTotals(items, activeCurrency), [items, activeCurrency])

  // Триггерим на dataUpdatedAt, а не на сам query.data: react-query с
  // structuralSharing переиспользует ссылку data, если ответ не изменился
  // (например, повторный клик «Обновить» без изменений в 1C) — тогда эффект
  // на [query.data] не сработал бы, хотя запрос реально прошёл успешно.
  //
  // Ждём !isFetching и дедуплицируем по dataUpdatedAt через ref, иначе при
  // повторном заходе на страницу с уже закэшированными данными react-query
  // (refetchOnMount) мгновенно отдаёт старые данные И тут же фоново их
  // перезапрашивает, а React StrictMode в dev дополнительно дважды
  // вызывает сам эффект — без этой защиты получается до 3 тостов на одно
  // открытие страницы вместо одного.
  const lastToastedAt = useRef(0)
  useEffect(() => {
    if (query.isFetching) return
    if (!query.data) return
    if (lastToastedAt.current === query.dataUpdatedAt) return
    lastToastedAt.current = query.dataUpdatedAt
    const count = countCashboxes(query.data.items)
    toast.success(`Данные по ${count} ${cashboxesDative(count)} успешно получены`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.dataUpdatedAt, query.isFetching])

  const handleRefresh = async () => {
    try {
      await query.refetch({ throwOnError: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const openCashDetails = (objectId: string, objectTitle: string, cashId: string, cashName: string) => {
    const search = new URLSearchParams()
    if (bothDatesValid) {
      search.set("date_from", dateFrom)
      search.set("date_to", dateTo)
    }
    navigate(`/reports/cashboxes/${objectId}/${cashId}?${search.toString()}`, {
      state: { name: cashName, objectTitle },
    })
  }

  return (
    <>
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Кассы</h2>
            <p className="text-muted-foreground">
              {bothDatesValid ? "Остатки и обороты за выбранный период" : "Остатки и обороты за сегодня"}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  min={MIN_DATE}
                  max={MAX_DATE}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-[160px]"
                />
                <div className="h-px w-3 bg-border shrink-0" />
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  min={MIN_DATE}
                  max={MAX_DATE}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-[160px]"
                />
              </div>
              {hasAnyDate && (
                <Button variant="default" onClick={resetDates}>
                  Сбросить
                </Button>
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
            {hasAnyDate && validationMessage && (
              <p className="text-xs text-amber-600">{validationMessage}</p>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex flex-col gap-2 items-end">
            {currencies.length > 1 && (
              <Select value={activeCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  {currencies.map((cur) => (
                    <SelectItem key={cur} value={cur}>{cur}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatTile label="Начальный остаток" value={formatAmount(totals.ost1)} />
              <StatTile label="Приход" value={formatAmount(totals.sump)} tone="positive" />
              <StatTile label="Расход" value={formatAmount(totals.sumr)} tone="negative" />
              <StatTile label="Конечный остаток" value={formatAmount(totals.ost2)} />
            </div>
          </div>
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
          Не удалось загрузить кассы, попробуйте позже
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Нет доступных объектов с кассами
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((group) => (
            <Card key={group.object_id}>
              <CardHeader>
                <CardTitle>{group.object_title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Касса</TableHead>
                        <TableHead>Валюта</TableHead>
                        <TableHead className="text-right w-[140px] whitespace-normal">Начальный остаток</TableHead>
                        <TableHead className="text-right w-[140px] whitespace-normal">Приход</TableHead>
                        <TableHead className="text-right w-[140px] whitespace-normal">Расход</TableHead>
                        <TableHead className="text-right w-[140px] whitespace-normal">Конечный остаток</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.cashboxes.map((c) => (
                        <TableRow
                          key={c.id}
                          className="cursor-pointer"
                          onClick={() => openCashDetails(group.object_id, group.object_title, c.id, c.name)}
                        >
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="text-muted-foreground">{c.currency}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatAmount(c.ost1)}</TableCell>
                          <TableCell className="text-right tabular-nums text-green-600">{formatAmount(c.sump)}</TableCell>
                          <TableCell className="text-right tabular-nums text-red-600">{formatAmount(c.sumr)}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">{formatAmount(c.ost2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
