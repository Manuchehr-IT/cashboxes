import { type ColumnDef } from "@tanstack/react-table"
import { Circle, CircleOff, ShieldCheck } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DataTableSortableHeader } from "@/components/data-table/data-table-sortable-header"
import { UserRowActions } from "@/pages/users/row-actions"
import type { User } from "@/pages/users/types"

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    size: 40,
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
        className="rounded-lg"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Select row"
        className="rounded-lg"
      />
    ),
  },
  {
    accessorKey: "username",
    size: 200,
    meta: { label: "Пользователь" },
    enableHiding: false,
    header: ({ column }) => <DataTableSortableHeader column={column} title="Пользователь" />,
    cell: ({ row }) => (
      <div className="font-medium truncate max-w-[200px]">{row.original.username}</div>
    ),
  },
  {
    accessorKey: "is_admin",
    size: 110,
    meta: { label: "Роль" },
    enableSorting: false,
    header: "Роль",
    cell: ({ row }) =>
      row.original.is_admin ? (
        <Badge variant="outline" className="rounded-lg bg-violet-200/30 text-violet-600 border-violet-300 dark:text-violet-100 gap-1">
          <ShieldCheck className="size-3" /> Админ
        </Badge>
      ) : (
        <span className="text-sm text-muted-foreground">Пользователь</span>
      ),
  },
  {
    accessorKey: "is_active",
    size: 130,
    meta: { label: "Статус" },
    enableSorting: true,
    header: ({ column }) => <DataTableSortableHeader column={column} title="Статус" />,
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge variant="outline" className="rounded-lg bg-green-200/30 text-green-600 border-green-300 dark:text-green-100 gap-1">
          <Circle className="size-3" /> Активный
        </Badge>
      ) : (
        <Badge variant="outline" className="rounded-lg bg-gray-200/30 text-gray-600 border-gray-300 dark:text-gray-100 gap-1">
          <CircleOff className="size-3" /> Неактивный
        </Badge>
      ),
  },
  {
    accessorKey: "created_at",
    size: 155,
    meta: { label: "Создан" },
    enableSorting: true,
    header: ({ column }) => <DataTableSortableHeader column={column} title="Создан" />,
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  {
    id: "actions",
    size: 48,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row, table }) => (
      <div className="flex justify-end pr-1">
        <UserRowActions table={table} row={row.original} />
      </div>
    ),
  },
]
