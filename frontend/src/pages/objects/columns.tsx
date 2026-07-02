import { type ColumnDef } from "@tanstack/react-table"
import { Circle, CircleOff } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DataTableSortableHeader } from "@/components/data-table/data-table-sortable-header"
import { ObjectRowActions } from "@/pages/objects/row-actions"
import type { Obj } from "@/pages/objects/types"

export const columns: ColumnDef<Obj>[] = [
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
		accessorKey: "title",
		size: 200,
		meta: { label: "Название" },
		enableHiding: false,
		header: ({ column }) => <DataTableSortableHeader column={column} title="Название" />,
		cell: ({ row }) => (
			<div className="font-medium truncate max-w-[200px]">{row.original.title}</div>
		),
	},
	{
		accessorKey: "url",
		size: 280,
		meta: { label: "URL (1C)" },
		enableSorting: true,
		header: ({ column }) => <DataTableSortableHeader column={column} title="URL (1C)" />,
		cell: ({ row }) => (
			<div className="text-muted-foreground font-mono text-xs truncate max-w-[280px]">
				{row.original.url}
			</div>
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
				<ObjectRowActions table={table} row={row.original} />
			</div>
		),
	},
]
