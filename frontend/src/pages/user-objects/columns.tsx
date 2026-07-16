import { type ColumnDef } from "@tanstack/react-table"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { DataTableSortableHeader } from "@/components/data-table/data-table-sortable-header"
import type { ObjectAccess } from "@/pages/user-objects/types"

export const columns: ColumnDef<ObjectAccess>[] = [
  {
    accessorKey: "title",
    size: 220,
    meta: { label: "Название" },
    enableHiding: false,
    header: ({ column }) => <DataTableSortableHeader column={column} title="Название" />,
    cell: ({ row }) => (
      <div className="font-medium truncate max-w-[220px]">{row.original.title}</div>
    ),
  },
  {
    accessorKey: "url",
    size: 300,
    meta: { label: "URL (1C)" },
    enableSorting: false,
    header: "URL (1C)",
    cell: ({ row }) => (
      <div className="text-muted-foreground font-mono text-xs truncate max-w-[300px]">
        {row.original.url}
      </div>
    ),
  },
  {
    accessorKey: "is_assigned",
    size: 110,
    meta: { label: "Доступ" },
    enableSorting: true,
    header: ({ column }) => <DataTableSortableHeader column={column} title="Доступ" />,
    cell: ({ row, table }) => {
      const { onToggle, pendingIds } = table.options.meta ?? {}
      const isPending = pendingIds?.has(row.original.id) ?? false
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.original.is_assigned}
            disabled={isPending}
            onCheckedChange={(checked) => onToggle?.(row.original, checked)}
            onClick={(e) => e.stopPropagation()}
          />
          {isPending && <Spinner size={14} className="text-muted-foreground" />}
        </div>
      )
    },
  },
]
