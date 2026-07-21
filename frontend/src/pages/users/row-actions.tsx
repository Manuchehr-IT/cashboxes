import { ExternalLink, KeyRound, Pencil, Trash2 } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import type { User } from "@/pages/users/types"

export function UserRowActions({ table, row }: { table: Table<User>; row: User }) {
  const { onOpen, onEdit, onChangePassword, onDelete } = table.options.meta ?? {}

  return (
    <DataTableRowActions
      actions={[
        { label: "Открыть", icon: ExternalLink, onClick: () => onOpen?.(row) },
        { label: "Редактировать", icon: Pencil, onClick: () => onEdit?.(row) },
        { label: "Изменить пароль", icon: KeyRound, onClick: () => onChangePassword?.(row) },
        { label: "Удалить", icon: Trash2, variant: "destructive", separatorBefore: true, onClick: () => onDelete?.(row) },
      ]}
    />
  )
}
