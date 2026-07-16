import { Trash2, X, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DataTableSelectionBarProps {
  count: number
  totalCount?: number
  isLoadingSelectAll?: boolean
  onSelectAll?: () => void
  onClear: () => void
  onDelete?: () => void
  isDeleting?: boolean
  actions?: React.ReactNode
}

export function DataTableSelectionBar({
  count,
  totalCount,
  isLoadingSelectAll,
  onSelectAll,
  onClear,
  onDelete,
  isDeleting,
  actions,
}: DataTableSelectionBarProps) {
  if (count === 0) return null

  const label = count === 1 ? "выбран" : "выбрано"
  const showSelectAll = onSelectAll && totalCount !== undefined && totalCount > count

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-xl border bg-background px-2 py-1.5 shadow-lg">
        <Button variant="outline" size="icon-sm" onClick={onClear} aria-label="Снять выделение">
          <X className="size-4" />
        </Button>

        <div className="w-px h-5 bg-border" />

        <div className="flex items-center gap-2 px-1">
          <span className="inline-flex items-center justify-center rounded-full bg-foreground text-background text-xs font-semibold tabular-nums min-w-6 h-6 px-1.5">
            {count}
          </span>
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {label}
          </span>
        </div>

        <div className="w-px h-5 bg-border mx-0.5" />

        {showSelectAll && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onSelectAll}
                disabled={isLoadingSelectAll}
                aria-label={`Выбрать все ${totalCount}`}
              >
                {isLoadingSelectAll
                  ? <Spinner size={16} />
                  : <ListChecks className="size-4" />
                }
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Выбрать все {totalCount}
            </TooltipContent>
          </Tooltip>
        )}

        {actions ?? (onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="destructive"
                onClick={onDelete}
                disabled={isDeleting}
                aria-label="Удалить выбранные"
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isDeleting ? "Удаление..." : "Удалить выбранные"}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
