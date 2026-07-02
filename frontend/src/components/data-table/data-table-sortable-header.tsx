import { type Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableSortableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableSortableHeader<TData, TValue>({
  column,
  title,
}: DataTableSortableHeaderProps<TData, TValue>) {
  const sorted = column.getIsSorted()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 -mx-2 px-2 gap-1.5 data-[state=open]:bg-accent">
          <span>{title}</span>
          {sorted === "asc" ? (
            <ArrowUp className="size-4" />
          ) : sorted === "desc" ? (
            <ArrowDown className="size-4" />
          ) : (
            <ChevronsUpDown className="size-4 opacity-50" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-max whitespace-nowrap">
        <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
          <ArrowUp className="size-3.5 mr-2 text-muted-foreground" /> По возрастанию
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
          <ArrowDown className="size-3.5 mr-2 text-muted-foreground" /> По убыванию
        </DropdownMenuItem>
        {sorted && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.clearSorting()}>
              <X className="size-3.5 mr-2 text-muted-foreground" /> Сбросить
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
