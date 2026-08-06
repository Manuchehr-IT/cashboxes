import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getErrorMessage } from "@/lib/api-error"
import { cashDetailsApi } from "@/pages/reports/cashbox-detail/api/cash-details"

function formatAmount(value: number): string {
  return value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatPeriodLabel(dateFrom: string | null, dateTo: string | null): string {
  if (!dateFrom && !dateTo) return "за сегодня"
  if (dateFrom && dateTo) return `за период ${dateFrom} — ${dateTo}`
  if (dateFrom) return `с ${dateFrom}`
  return `по ${dateTo}`
}

interface CashboxDetailLocationState {
  name?: string
  objectTitle?: string
}

export function CashboxDetailPage() {
  const { objectId, cashId } = useParams<{ objectId: string; cashId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const locationState = (location.state ?? {}) as CashboxDetailLocationState
  const name = locationState.name ?? "Касса"
  const objectTitle = locationState.objectTitle

  const dateFrom = searchParams.get("date_from")
  const dateTo = searchParams.get("date_to")

  const params = {
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }

  const query = useQuery({
    queryKey: ["cash-details", objectId, cashId, params],
    queryFn: () => cashDetailsApi.list(objectId!, cashId!, params),
    enabled: !!objectId && !!cashId,
  })

  const items = query.data?.items ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight truncate">{name}</h2>
          <p className="text-muted-foreground text-sm">
            {objectTitle ? `${objectTitle} · ` : ""}
            {formatPeriodLabel(dateFrom, dateTo)}
          </p>
        </div>
      </div>

      {query.isPending ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Spinner size={20} />
        </div>
      ) : query.isError ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          {getErrorMessage(query.error, { fallback: "Не удалось загрузить детализацию, попробуйте позже" })}
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Движений за выбранный период нет
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Документ</TableHead>
                <TableHead>Статья ДДС</TableHead>
                <TableHead>Аналитика</TableHead>
                <TableHead className="text-right">Приход</TableHead>
                <TableHead className="text-right">Расход</TableHead>
                <TableHead>Комментарий</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="max-w-[280px] whitespace-normal">{item.doc}</TableCell>
                  <TableCell className="text-muted-foreground">{item.ddsname || "—"}</TableCell>
                  <TableCell>
                    {item.subkonto.length > 0 ? (
                      <div className="flex flex-col">
                        {item.subkonto.map((s, j) => <span key={j}>{s}</span>)}
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-green-600">
                    {item.sump > 0 ? formatAmount(item.sump) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-red-600">
                    {item.sumr > 0 ? formatAmount(item.sumr) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] whitespace-normal">
                    {item.comment || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
