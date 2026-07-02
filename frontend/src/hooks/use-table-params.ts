import { useSearchParams } from "react-router-dom"
import { type SortingState, type ColumnFiltersState } from "@tanstack/react-table"
import { parseSort, serializeSort } from "@/components/data-table/table-utils"

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

export function useTableParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get("page") ?? DEFAULT_PAGE)
  const pageSize = Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE)
  const search = searchParams.get("q") ?? ""

  const sorting: SortingState = parseSort(searchParams.get("sort"))

  // все остальные параметры кроме служебных — это фильтры
  const RESERVED = new Set(["page", "pageSize", "sort", "q"])
  const columnFilters: ColumnFiltersState = Array.from(searchParams.entries())
    .filter(([key]) => !RESERVED.has(key))
    .map(([key, value]) => ({
      id: key,
      value: value.includes(",") ? value.split(",") : value,
    }))

  function setParams(updates: {
    page?: number
    pageSize?: number
    sorting?: SortingState
    filters?: Record<string, string | string[] | null>
    search?: string
  }) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      let resetPage = false

      if (updates.page !== undefined) {
        updates.page === DEFAULT_PAGE
          ? next.delete("page")
          : next.set("page", String(updates.page))
      }

      if (updates.pageSize !== undefined) {
        resetPage = true
        updates.pageSize === DEFAULT_PAGE_SIZE
          ? next.delete("pageSize")
          : next.set("pageSize", String(updates.pageSize))
      }

      if (updates.sorting !== undefined) {
        resetPage = true
        const sortParam = serializeSort(updates.sorting)
        sortParam ? next.set("sort", sortParam) : next.delete("sort")
      }

      if (updates.filters !== undefined) {
        resetPage = true
        for (const [key, value] of Object.entries(updates.filters)) {
          if (!value || (Array.isArray(value) && value.length === 0)) {
            next.delete(key)
          } else {
            next.set(key, Array.isArray(value) ? value.join(",") : value)
          }
        }
      }

      if (updates.search !== undefined) {
        resetPage = true
        updates.search ? next.set("q", updates.search) : next.delete("q")
      }

      if (resetPage && updates.page === undefined) next.delete("page")

      return next
    }, { replace: true })
  }

  return { page, pageSize, sorting, columnFilters, search, setParams }
}
