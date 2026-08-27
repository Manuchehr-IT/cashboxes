import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { getErrorMessage } from "@/lib/api-error"
import { runBulkAction } from "@/lib/bulk-action"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableSelectionBar } from "@/components/data-table/data-table-selection-bar"
import { serializeSort } from "@/components/data-table/table-utils"
import { useTableParams } from "@/hooks/use-table-params"
import { columns } from "@/pages/users/columns"
import { usersApi } from "@/pages/users/api/users"
import { useDelete } from "@/pages/users/hooks/use-delete"
import { AddUserModal } from "@/pages/users/add-modal"
import { EditUserSheet } from "@/pages/users/edit-sheet"
import { SetPasswordModal } from "@/pages/users/set-password-modal"
import type { User } from "@/pages/users/types"

export function UsersPage() {
  const navigate = useNavigate()
  const { page, pageSize, sorting, search, setParams } = useTableParams()

  const params = {
    page,
    pageSize,
    sort: serializeSort(sorting) || undefined,
    q: search || undefined,
  }

  const query = useQuery({
    queryKey: ["users", params],
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  })

  const items = query.data?.items ?? []
  const totalCount = query.data?.count ?? 0

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  useEffect(() => { setRowSelection({}) }, [search])

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedCount = selectedIds.length
  const clearSelection = () => setRowSelection({})

  const [isLoadingSelectAll, setIsLoadingSelectAll] = useState(false)
  const selectAll = async () => {
    setIsLoadingSelectAll(true)
    try {
      const all = await usersApi.list({ ...params, page: 1, pageSize: totalCount })
      const next: Record<string, boolean> = {}
      for (const item of all.items) next[item.id] = true
      setRowSelection(next)
    } finally {
      setIsLoadingSelectAll(false)
    }
  }

  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null)
  const [passwordOpen, setPasswordOpen] = useState(false)

  const [isDeletingSelected, setIsDeletingSelected] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const deleteMutation = useDelete()

  const confirmDeleteSelected = async () => {
    setBulkDeleteOpen(false)
    setIsDeletingSelected(true)
    try {
      const { successCount, failCount } = await runBulkAction(selectedIds, (id) => deleteMutation.mutateAsync(id))
      if (failCount === 0) toast.success(`Удалено пользователей: ${successCount}`)
      else if (successCount > 0) toast.warning(`Удалено ${successCount} из ${selectedIds.length}`)
      else toast.error("Не удалось удалить пользователей")
      clearSelection()
    } finally {
      setIsDeletingSelected(false)
    }
  }

  const handleOpen = (u: User) => navigate(`/users/${u.id}`)
  const handleEdit = (u: User) => { setEditTarget(u); setEditOpen(true) }
  const handleChangePassword = (u: User) => { setPasswordTarget(u); setPasswordOpen(true) }
  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success(`Пользователь «${deleteTarget.username}» удалён`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleteTarget(null)
    }
  }

  const tableProps = {
    data: items,
    getRowId: (row: User) => row.id,
    rowSelection,
    onRowSelectionChange: setRowSelection,
    sorting,
    onSortingChange: (s: typeof sorting) => setParams({ sorting: s }),
    globalFilter: search,
    onGlobalFilterChange: (q: string) => setParams({ search: q }),
    pagination: { pageIndex: page - 1, pageSize },
    onPaginationChange: (p: { pageIndex: number; pageSize: number }) =>
      setParams({ page: p.pageIndex + 1, pageSize: p.pageSize }),
    pageCount: Math.max(1, Math.ceil(totalCount / pageSize)),
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Пользователи</h2>
          <p className="text-muted-foreground">Управляйте пользователями системы</p>
        </div>
        <Button size="lg" className="gap-1.5" onClick={() => setAddOpen(true)}>
          Создать пользователя
          <Plus className="size-4" />
        </Button>
      </div>

      <DataTable
        {...tableProps}
        columns={columns}
        filterPlaceholder="Поиск пользователей..."
        meta={{ onOpen: handleOpen, onEdit: handleEdit, onChangePassword: handleChangePassword, onDelete: setDeleteTarget }}
      />

      <DataTableSelectionBar
        count={selectedCount}
        totalCount={totalCount}
        isLoadingSelectAll={isLoadingSelectAll}
        onSelectAll={selectAll}
        onClear={clearSelection}
        actions={
          <>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              disabled={isDeletingSelected}
              onClick={() => setBulkDeleteOpen(true)}
            >
              {isDeletingSelected
                ? <Spinner size={12} />
                : <Trash2 className="size-3" />
              }
              {isDeletingSelected ? "Удаление..." : "Удалить"}
            </Button>
          </>
        }
      />

      <AddUserModal open={addOpen} onOpenChange={setAddOpen} />
      <EditUserSheet open={editOpen} onOpenChange={setEditOpen} user={editTarget} />
      <SetPasswordModal open={passwordOpen} onOpenChange={setPasswordOpen} user={passwordTarget} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Удалить пользователя?"
        description={`Пользователь «${deleteTarget?.username}» будет удалён без возможности восстановления.`}
        onConfirm={confirmDelete}
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Удалить выбранных пользователей?"
        description={`Будет удалено пользователей: ${selectedCount}. Это действие необратимо.`}
        onConfirm={confirmDeleteSelected}
      />
    </>
  )
}
