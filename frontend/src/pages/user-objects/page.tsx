import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Circle, CircleOff } from "lucide-react"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableFacetedFilter, type FacetedFilterOption } from "@/components/data-table/data-table-faceted-filter"
import { getFilterValues, serializeSort } from "@/components/data-table/table-utils"
import { getErrorMessage } from "@/lib/api-error"
import { useTableParams } from "@/hooks/use-table-params"
import { columns } from "@/pages/user-objects/columns"
import { userObjectsApi } from "@/pages/user-objects/api/user-objects"
import { useGrant } from "@/pages/user-objects/hooks/use-grant"
import { useRevoke } from "@/pages/user-objects/hooks/use-revoke"
import type { ObjectAccess } from "@/pages/user-objects/types"

const IS_ASSIGNED_OPTIONS: FacetedFilterOption[] = [
	{ label: "Выдан",     value: "true",  icon: Circle    },
	{ label: "Не выдан",  value: "false", icon: CircleOff },
]

interface UserObjectsPageProps {
	userId: string
}

export function UserObjectsPage({ userId }: UserObjectsPageProps) {
	const { page, pageSize, sorting, columnFilters, setParams } = useTableParams()

	const selectedIsAssigned = getFilterValues(columnFilters, "is_assigned")
	const is_assigned = selectedIsAssigned.length === 1 ? selectedIsAssigned[0] === "true" : undefined

	const params = {
		page,
		pageSize,
		sort: serializeSort(sorting) || undefined,
		is_assigned,
	}

	const query = useQuery({
		queryKey: ["user-objects", userId, params],
		queryFn: () => userObjectsApi.list(userId, params),
		placeholderData: keepPreviousData,
	})

	const items = query.data?.items ?? []
	const totalCount = query.data?.count ?? 0

	const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
	const grant = useGrant(userId)
	const revoke = useRevoke(userId)

	const handleToggle = async (object: ObjectAccess, checked: boolean) => {
		setPendingIds((prev) => new Set(prev).add(object.id))
		try {
			if (checked) await grant.mutateAsync(object.id)
			else await revoke.mutateAsync(object.id)
			toast.success(checked ? `Доступ к «${object.title}» выдан` : `Доступ к «${object.title}» отозван`)
		} catch (err) {
			toast.error(getErrorMessage(err))
		} finally {
			setPendingIds((prev) => {
				const next = new Set(prev)
				next.delete(object.id)
				return next
			})
		}
	}

	const tableProps = {
		data: items,
		getRowId: (row: ObjectAccess) => row.id,
		sorting,
		onSortingChange: (s: typeof sorting) => setParams({ sorting: s }),
		pagination: { pageIndex: page - 1, pageSize },
		onPaginationChange: (p: { pageIndex: number; pageSize: number }) =>
			setParams({ page: p.pageIndex + 1, pageSize: p.pageSize }),
		pageCount: Math.max(1, Math.ceil(totalCount / pageSize)),
	}

	return (
		<DataTable
			{...tableProps}
			columns={columns}
			filterPlaceholder="Поиск объектов..."
			meta={{ onToggle: handleToggle, pendingIds }}
			toolbar={
				<DataTableFacetedFilter
					title="Доступ"
					options={IS_ASSIGNED_OPTIONS}
					selected={selectedIsAssigned}
					onChange={(values) => setParams({ filters: { is_assigned: values } })}
				/>
			}
		/>
	)
}
