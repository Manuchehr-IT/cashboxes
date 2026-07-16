import { useEffect, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Circle, CircleOff, Plus, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { getErrorMessage } from "@/lib/api-error"
import { runBulkAction } from "@/lib/bulk-action"
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
import { columns } from "@/pages/objects/columns"
import { objectsApi } from "@/pages/objects/api/objects"
import { useUpdate } from "@/pages/objects/hooks/use-update"
import { useDelete } from "@/pages/objects/hooks/use-delete"
import { AddObjectModal } from "@/pages/objects/add-modal"
import { EditObjectSheet } from "@/pages/objects/edit-sheet"
import type { Obj } from "@/pages/objects/types"

const IS_ACTIVE_OPTIONS: FacetedFilterOption[] = [
  { label: "Активный",   value: "true",  icon: Circle    },
  { label: "Неактивный", value: "false", icon: CircleOff },
]

export function ObjectsPage() {
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
    queryKey: ["objects", params],
    queryFn: () => objectsApi.list(params),
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
      const all = await objectsApi.list({ ...params, page: 1, pageSize: totalCount })
      const next: Record<string, boolean> = {}
      for (const item of all.items) next[item.id] = true
      setRowSelection(next)
    } finally {
      setIsLoadingSelectAll(false)
    }
  }

  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Obj | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const [isUpdatingStatuses, setIsUpdatingStatuses] = useState(false)
  const [isDeletingSelected, setIsDeletingSelected] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Obj | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

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

  const confirmDeleteSelected = async () => {
    setBulkDeleteOpen(false)
    setIsDeletingSelected(true)
    try {
      const { successCount, failCount } = await runBulkAction(selectedIds, (id) => deleteMutation.mutateAsync(id))
      if (failCount === 0) toast.success(`Удалено объектов: ${successCount}`)
      else if (successCount > 0) toast.warning(`Удалено ${successCount} из ${selectedIds.length}`)
      else toast.error("Не удалось удалить объекты")
      clearSelection()
    } finally {
      setIsDeletingSelected(false)
    }
  }

  const handleEdit = (o: Obj) => { setEditTarget(o); setEditOpen(true) }
  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success(`Объект «${deleteTarget.title}» удалён`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleteTarget(null)
    }
  }

  const tableProps = {
    data: items,
    getRowId: (row: Obj) => row.id,
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
          <h2 className="text-2xl font-bold tracking-tight">Объекты</h2>
          <p className="text-muted-foreground">Управляйте объектами недвижимости</p>
        </div>
        <Button size="lg" className="gap-1.5" onClick={() => setAddOpen(true)}>
          Добавить объект
          <Plus className="size-4" />
        </Button>
      </div>

      <DataTable
        {...tableProps}
        columns={columns}
        filterPlaceholder="Поиск объектов..."
        meta={{ onEdit: handleEdit, onDelete: setDeleteTarget }}
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

      <AddObjectModal open={addOpen} onOpenChange={setAddOpen} />
      <EditObjectSheet open={editOpen} onOpenChange={setEditOpen} object={editTarget} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Удалить объект?"
        description={`Объект «${deleteTarget?.title}» будет удалён без возможности восстановления.`}
        onConfirm={confirmDelete}
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Удалить выбранные объекты?"
        description={`Будет удалено объектов: ${selectedCount}. Это действие необратимо.`}
        onConfirm={confirmDeleteSelected}
      />
    </>
  )
}
