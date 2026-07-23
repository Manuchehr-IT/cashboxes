import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { logsApi } from "@/pages/logs/api/logs"
import type { ListLogsParams, LogLevel } from "@/pages/logs/types"

const LEVEL_OPTIONS: LogLevel[] = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
const LIMIT_OPTIONS = [100, 200, 500, 1000, 2000]

function lineLevel(line: string): LogLevel | null {
  for (const level of LEVEL_OPTIONS) {
    if (line.includes(` - ${level} - `)) return level
  }
  return null
}

function levelClassName(level: LogLevel | null): string {
  switch (level) {
    case "ERROR":
    case "CRITICAL":
      return "text-red-600"
    case "WARNING":
      return "text-amber-600"
    case "DEBUG":
      return "text-muted-foreground"
    default:
      return ""
  }
}

export function LogsPage() {
  const [level, setLevel] = useState<LogLevel | "">("")
  const [q, setQ] = useState("")
  const [limit, setLimit] = useState(200)
  const containerRef = useRef<HTMLDivElement>(null)

  const params: ListLogsParams = {
    limit,
    level: level || undefined,
    q: q || undefined,
  }

  const query = useQuery({
    queryKey: ["logs", params],
    queryFn: () => logsApi.list(params),
  })

  const lines = query.data?.lines ?? []

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight })
  }, [query.dataUpdatedAt])

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Логи</h2>
          <p className="text-muted-foreground">
            {query.data ? `Показано ${lines.length} из ${query.data.total}` : "Файл logs/app.log на сервере"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Select value={level || "all"} onValueChange={(v) => setLevel(v === "all" ? "" : (v as LogLevel))}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            <SelectItem value="all">Все уровни</SelectItem>
            {LEVEL_OPTIONS.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Поиск по логу..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-[240px]"
        />

        <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            {LIMIT_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>{n} строк</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => query.refetch()}
          disabled={query.isFetching}
          aria-label="Обновить"
        >
          {query.isFetching ? <Spinner size={16} /> : <RefreshCw className="size-4" />}
        </Button>
      </div>

      {query.isPending ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Spinner size={20} />
        </div>
      ) : query.isError ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Не удалось загрузить логи, попробуйте позже
        </div>
      ) : lines.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Ничего не найдено
        </div>
      ) : (
        <div
          ref={containerRef}
          className="rounded-md border bg-card p-3 font-mono text-xs overflow-auto max-h-[calc(100vh-260px)]"
        >
          {lines.map((line, i) => (
            <div key={i} className={cn("whitespace-pre-wrap break-all", levelClassName(lineLevel(line)))}>
              {line}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
