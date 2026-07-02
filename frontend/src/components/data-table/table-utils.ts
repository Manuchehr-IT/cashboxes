import type { ColumnFiltersState, SortingState } from "@tanstack/react-table"

/** SortingState → "field,-field2" для API-параметра `sort` (undefined, если пусто). */
export function serializeSort(sorting: SortingState): string | undefined {
  return sorting.map((s) => (s.desc ? `-${s.id}` : s.id)).join(",") || undefined
}

/** "field,-field2" → SortingState */
export function parseSort(sort: string | null | undefined): SortingState {
  if (!sort) return []
  return sort
    .split(",")
    .filter(Boolean)
    .map((s) => ({
      id: s.startsWith("-") ? s.slice(1) : s,
      desc: s.startsWith("-"),
    }))
}

/** Нормализует значение фильтра колонки к string[] (одиночное значение / массив / отсутствие). */
export function getFilterValues(filters: ColumnFiltersState, id: string): string[] {
  const value = filters.find((f) => f.id === id)?.value
  if (Array.isArray(value)) return value.map(String)
  if (value === undefined || value === null || value === "") return []
  return [String(value)]
}
