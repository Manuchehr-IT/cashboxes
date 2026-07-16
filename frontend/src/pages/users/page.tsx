import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Circle, CircleOff, Plus, RefreshCw, Trash2 } from "lucide-react"
import { getErrorMessage } from "@/lib/api-error"
import { runBulkAction } from "@/lib/bulk-action"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableFacetedFilter, type FacetedFilterOption } from "@/components/data-table/data-table-faceted-filter"
import { DataTableSelectionBar } from "@/components/data-table/data-table-selection-bar"
import { getFilterValues, serializeSort } from "@/components/data-table/table-utils"
import { useTableParams } from "@/hooks/use-table-params"
import { columns } from "@/pages/users/columns"
import { usersApi } from "@/pages/users/api/users"
import { useUpdate } from "@/pages/users/hooks/use-update"
import { useDelete } from "@/pages/users/hooks/use-delete"
import { AddUserModal } from "@/pages/users/add-modal"
import { EditUserSheet } from "@/pages/users/edit-sheet"
import type { User } from "@/pages/users/types"

const IS_ACTIVE_OPTIONS: FacetedFilterOption[] = [
  { label: "Активный",   value: "true",  icon: Circle    },
  { label: "Неактивный", value: "false", icon: CircleOff },
]

export function UsersPage() {
  const navigate = useNavigate()
  const { page, pageSize, sorting, columnFilters, search, setParams } = useTableParams()

  const selectedIsActive = getFilterValues(columnFilters, "is_active")
  const is_active = selectedIsActive.length === 1 ? selectedIsActive[0] === "true" : undefined

  const params = {
    page,
    pageSize,
    sort: serializeSort(sorting) || undefined,
    q: search || undefined,
    is_active,
  }

  const query = useQuery({
    queryKey: ["users", params],
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  })

  const items = query.data?.items ?? []
  const totalCount = query.data?.count ?? 0

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const filterKey = JSON.stringify(columnFilters)
  useEffect(() => { setRowSelection({}) }, [search, filterKey])

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

  const [isUpdatingStatuses, setIsUpdatingStatuses] = useState(false)
  const [isDeletingSelected, setIsDeletingSelected] = useState(false)

  const updateMutation = useUpdate()
  const deleteMutation = useDelete()

  const handleUpdateStatuses = async (isActiveValue: boolean) => {
    setIsUpdatingStatuses(true)
    try {
      const { successCount, failCount } = await runBulkAction(selectedIds, (id) =>
        updateMutation.mutateAsync({ id, payload: { is_active: isActiveValue } })
      )
      if (failCount === 0) toast.success(`Статус обновлён: ${successCount}`)
      else if (successCount > 0) toast.warning(`Обновлено ${successCount} из ${selectedIds.length}, ${failCount} с ошибкой`)
      else toast.error("Не удалось обновить статус")
      clearSelection()
    } finally {
      setIsUpdatingStatuses(false)
    }
  }

  const handleDeleteSelected = async () => {
    setIsDeletingSelected(true)
    try {
      const { successCount, failCount } = await runBulkAction(selectedIds, (id) => deleteMutation.mutateAsync(id))
      if (failCount === 0) toast.success(`Удалено пользователей: ${successCount}`)
      else if (successCount > 0) toast.warning(`Удалено ${successCount} из ${selectedIds.length}, ${failCount} с ошибкой`)
      else toast.error("Не удалось удалить пользователей")
      clearSelection()
    } finally {
      setIsDeletingSelected(false)
    }
  }

  const handleOpen = (u: User) => navigate(`/users/${u.id}`)
  const handleEdit = (u: User) => { setEditTarget(u); setEditOpen(true) }
  const handleDelete = async (u: User) => {
    try {
      await deleteMutation.mutateAsync(u.id)
      toast.success(`Пользователь «${u.username}» удалён`)
    } catch (err) {
      toast.error(getErrorMessage(err))
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
        meta={{ onOpen: handleOpen, onEdit: handleEdit, onDelete: handleDelete }}
        toolbar={
          <DataTableFacetedFilter
            title="Статус"
            options={IS_ACTIVE_OPTIONS}
            selected={selectedIsActive}
            onChange={(values) => setParams({ filters: { is_active: values } })}
          />
        }
      />

      <DataTableSelectionBar
        count={selectedCount}
        totalCount={totalCount}
        isLoadingSelectAll={isLoadingSelectAll}
        onSelectAll={selectAll}
        onClear={clearSelection}
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  disabled={isUpdatingStatuses}
                >
                  {isUpdatingStatuses
                    ? <Spinner size={12} />
                    : <RefreshCw className="size-3" />
                  }
                  {isUpdatingStatuses ? "Обновление..." : "Статус"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Изменить статус</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleUpdateStatuses(true)}>
                  <Circle className="size-3.5 mr-2 text-green-500" /> Активный
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatuses(false)}>
                  <CircleOff className="size-3.5 mr-2 text-red-500" /> Неактивный
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="destructive"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              disabled={isDeletingSelected}
              onClick={handleDeleteSelected}
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
    </>
  )
}
