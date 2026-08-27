import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { ChevronDown, ChevronRight, RefreshCw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DataTableFacetedFilter, type FacetedFilterOption } from "@/components/data-table/data-table-faceted-filter"
import { getErrorMessage } from "@/lib/api-error"
import { counterpartiesApi } from "@/pages/reports/counterparties/api/counterparties"
import type { Debt, ObjectDebts } from "@/pages/reports/counterparties/types"

function formatAmount(value: number): string {
  return value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Именительный/родительный падеж «запись» после числа: 1 запись, 2–4 записи, 5+ записей. */
function pluralizeRecords(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return "запись"
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "записи"
  return "записей"
}

function countDebts(items: ObjectDebts[]): number {
  return items.reduce((sum, group) => sum + group.debts.length, 0)
}

function getAccNames(items: ObjectDebts[]): string[] {
  const set = new Set<string>()
  for (const group of items) {
    for (const d of group.debts) set.add(d.acc_name)
  }
  return Array.from(set).sort()
}

/** Только менеджеры, реально встречающиеся у выбранного счёта — не полный список по всем счетам. */
function getManagersForAccName(items: ObjectDebts[], accName: string): string[] {
  const set = new Set<string>()
  for (const group of items) {
    for (const d of group.debts) {
      if (d.acc_name === accName && d.manager) set.add(d.manager)
    }
  }
  return Array.from(set).sort()
}

type DebtWithObject = Debt & { object_title: string }

function flattenDebts(items: ObjectDebts[]): DebtWithObject[] {
  return items.flatMap((group) => group.debts.map((d) => ({ ...d, object_title: group.object_title })))
}

interface KontrGroup {
  kontr: string
  records: DebtWithObject[]
}

/** Группировка по контрагенту вместо объекта — один контрагент может встречаться в нескольких объектах. */
function groupByKontr(debts: DebtWithObject[]): KontrGroup[] {
  const map = new Map<string, DebtWithObject[]>()
  for (const d of debts) {
    const list = map.get(d.kontr)
    if (list) list.push(d)
    else map.set(d.kontr, [d])
  }
  return Array.from(map.entries())
    .map(([kontr, records]) => ({ kontr, records }))
    .sort((a, b) => a.kontr.localeCompare(b.kontr, "ru"))
}

/** Валюты, встречающиеся у выбранного счёта — без учёта фильтров менеджера/поиска: итоги по валютам
 * от них не зависят. */
function getCurrenciesForAccName(items: ObjectDebts[], accName: string): string[] {
  const set = new Set<string>()
  for (const group of items) {
    for (const d of group.debts) {
      if (d.acc_name === accName) set.add(d.currency)
    }
  }
  return Array.from(set).sort()
}

function sumDebtByCurrency(items: ObjectDebts[], accName: string, currency: string): number {
  return items.reduce(
    (sum, group) =>
      sum + group.debts.reduce((s, d) => (d.acc_name === accName && d.currency === currency ? s + d.debt : s), 0),
    0
  )
}

export function CounterpartiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [expandedKontrs, setExpandedKontrs] = useState<Set<string>>(new Set())

  const selectedAccName = searchParams.get("acc_name") ?? ""
  const selectedManagers = searchParams.getAll("manager")
  const kontrSearch = searchParams.get("q") ?? ""

  const toggleKontr = (kontr: string) => {
    setExpandedKontrs((prev) => {
      const next = new Set(prev)
      if (next.has(kontr)) next.delete(kontr)
      else next.add(kontr)
      return next
    })
  }

  const setAccName = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set("acc_name", value)
      else next.delete("acc_name")
      return next
    }, { replace: true })
  }

  const setManagers = (values: string[]) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete("manager")
      for (const value of values) next.append("manager", value)
      return next
    }, { replace: true })
  }

  const setKontrSearch = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set("q", value)
      else next.delete("q")
      return next
    }, { replace: true })
  }

  // Локальное состояние + дебаунс — иначе каждое нажатие клавиши сразу пишет в URL.
  const [searchInput, setSearchInput] = useState(kontrSearch)
  useEffect(() => {
    setSearchInput(kontrSearch)
  }, [kontrSearch])
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== kontrSearch) setKontrSearch(searchInput)
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const query = useQuery({
    queryKey: ["counterparties"],
    queryFn: () => counterpartiesApi.list(),
  })

  const items = query.data?.items ?? []
  const failedObjects = query.data?.failed_objects ?? []

  const accNameOptions = useMemo(() => getAccNames(items), [items])
  const managerOptions: FacetedFilterOption[] = useMemo(
    () => getManagersForAccName(items, selectedAccName).map((manager) => ({ label: manager, value: manager })),
    [items, selectedAccName]
  )
  // Итоги по валютам считаются только от выбранного счёта — фильтры менеджера и
  // поисковик по контрагенту их не сужают.
  const totalCurrencies = useMemo(
    () => getCurrenciesForAccName(items, selectedAccName),
    [items, selectedAccName]
  )

  // acc_name — обязательный фильтр: пока счёт не выбран, данные не показываем вообще.
  const hasAccNameSelected = !!selectedAccName
  const filteredItems = hasAccNameSelected
    ? items
      .map((group) => ({
        ...group,
        debts: group.debts.filter((d) =>
          d.acc_name === selectedAccName &&
          (selectedManagers.length === 0 || selectedManagers.includes(d.manager))
        ),
      }))
      .filter((group) => group.debts.length > 0)
    : []

  // Без группировки по объекту — один контрагент может встречаться в нескольких объектах,
  // группируем именно по нему, с общим долгом и разворачиваемым списком записей.
  // groupByKontr уже сортирует результат по имени контрагента.
  const allKontrGroups = groupByKontr(flattenDebts(filteredItems))
  const normalizedSearch = kontrSearch.trim().toLowerCase()
  const kontrGroups = normalizedSearch
    ? allKontrGroups.filter((g) => g.kontr.toLowerCase().includes(normalizedSearch))
    : allKontrGroups

  // Тост не привязан к самому запросу (при переключении счёта/менеджера новый запрос не идёт —
  // фильтрация целиком на фронте): показываем его только при реальной смене счёта и по клику
  // «Обновить», но не при первом открытии страницы, пока счёт ещё не выбран.
  const lastToastedAccName = useRef<string | null>(null)
  useEffect(() => {
    if (!selectedAccName) return
    if (lastToastedAccName.current === selectedAccName) return
    lastToastedAccName.current = selectedAccName
    const count = countDebts(filteredItems)
    toast.success(`Показано ${count} ${pluralizeRecords(count)}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccName])

  const handleRefresh = async () => {
    try {
      await query.refetch({ throwOnError: true })
      if (hasAccNameSelected) {
        const count = countDebts(filteredItems)
        toast.success(`Показано ${count} ${pluralizeRecords(count)}`)
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Контрагенты</h2>
          <p className="text-muted-foreground">Задолженности по счетам и контрагентам</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* key сбрасывает внутреннее состояние Select при возврате selectedAccName к "" —
              иначе Radix Select продолжает показывать последнее значение вместо плейсхолдера. */}
          <Select key={selectedAccName} value={selectedAccName || undefined} onValueChange={setAccName}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Выберите счёт" />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              {accNameOptions.map((accName) => (
                <SelectItem key={accName} value={accName}>{accName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(() => {
            const searchInputEl = (
              <Input
                placeholder="Поиск по контрагенту..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                disabled={!hasAccNameSelected}
                className="h-9 w-[220px]"
              />
            )
            if (hasAccNameSelected) return searchInputEl
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-flex">
                    {searchInputEl}
                  </span>
                </TooltipTrigger>
                <TooltipContent>Сначала выберите счёт</TooltipContent>
              </Tooltip>
            )
          })()}
          {(!hasAccNameSelected || managerOptions.length > 1) && (
            <DataTableFacetedFilter
              title="Менеджер"
              options={managerOptions}
              selected={selectedManagers}
              onChange={setManagers}
              disabled={!hasAccNameSelected}
              disabledTooltip="Сначала выберите счёт"
            />
          )}
          {(() => {
            const refreshButton = (
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={!hasAccNameSelected || query.isFetching}
                aria-label="Обновить"
              >
                {query.isRefetching ? <Spinner size={16} /> : <RefreshCw className="size-4" />}
              </Button>
            )
            if (hasAccNameSelected) return refreshButton
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* span-обёртка — disabled-кнопка не всплывает мышиные события, тултип бы не показался */}
                  <span tabIndex={0} className="inline-flex">
                    {refreshButton}
                  </span>
                </TooltipTrigger>
                <TooltipContent>Сначала выберите счёт</TooltipContent>
              </Tooltip>
            )
          })()}
        </div>
      </div>

      {failedObjects.length > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-200/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-100">
          <TriangleAlert className="size-4 shrink-0" />
          Не удалось получить данные по объектам: {failedObjects.map((f) => f.object_title).join(", ")}
        </div>
      )}

      {hasAccNameSelected && totalCurrencies.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium text-muted-foreground">Итого</h3>
          <div className="rounded-md border">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 w-[80px]">Валюта</TableHead>
                  <TableHead className="h-8 text-right w-[130px]">Долг</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totalCurrencies.map((currency) => {
                  const total = sumDebtByCurrency(items, selectedAccName, currency)
                  return (
                    <TableRow key={currency} className="hover:bg-transparent">
                      <TableCell className="py-1.5 font-medium">{currency}</TableCell>
                      <TableCell className={`py-1.5 text-right tabular-nums font-medium ${total < 0 ? "text-red-600" : ""}`}>
                        {formatAmount(total)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {query.isPending ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Spinner size={20} />
        </div>
      ) : query.isError ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Не удалось загрузить данные, попробуйте позже
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Нет доступных объектов с данными по контрагентам
        </div>
      ) : !hasAccNameSelected ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Выберите счёт, чтобы увидеть данные
        </div>
      ) : kontrGroups.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Нет данных по выбранным фильтрам
        </div>
      ) : (
        <div className="rounded-md border">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[240px]">Контрагент</TableHead>
                <TableHead className="w-[200px]">Объект</TableHead>
                <TableHead className="w-[200px]">Договор</TableHead>
                <TableHead className="w-[130px]">Менеджер</TableHead>
                <TableHead className="w-[130px]">Вид расчёта</TableHead>
                <TableHead className="w-[80px]">Валюта</TableHead>
                <TableHead className="text-right w-[130px]">Долг</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kontrGroups.map((group) => {
                const isExpanded = expandedKontrs.has(group.kontr)
                return (
                  <Fragment key={group.kontr}>
                    <TableRow className="cursor-pointer" onClick={() => toggleKontr(group.kontr)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5">
                          {isExpanded ? (
                            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="truncate" title={group.kontr}>{group.kontr}</span>
                        </div>
                      </TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                    </TableRow>
                    {isExpanded && group.records.map((r, i) => (
                      <TableRow key={i} className="bg-muted/30 hover:bg-muted/30">
                        <TableCell />
                        <TableCell className="text-sm text-muted-foreground truncate" title={r.object_title}>{r.object_title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate" title={r.contract}>{r.contract}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate" title={r.manager}>{r.manager}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate" title={r.vid_raschet}>{r.vid_raschet}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.currency}</TableCell>
                        <TableCell className={`text-sm text-right tabular-nums ${r.debt < 0 ? "text-red-600" : ""}`}>
                          {formatAmount(r.debt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
