import { Pencil, Trash2 } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import type { Obj } from "@/pages/objects/types"

export function ObjectRowActions({ table, row }: { table: Table<Obj>; row: Obj }) {
	const { onEdit, onDelete } = table.options.meta ?? {}

	return (
		<DataTableRowActions
			actions={[
				{ label: "Редактировать", icon: Pencil, onClick: () => onEdit?.(row) },
				{ label: "Удалить", icon: Trash2, variant: "destructive", separatorBefore: true, onClick: () => onDelete?.(row) },
			]}
		/>
	)
}
