import { useState } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel,
  type ColumnDef, type SortingState, type VisibilityState, type TableMeta,
  flexRender,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  filterPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  toolbar?: React.ReactNode;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  globalFilter?: string;
  onGlobalFilterChange?: (filter: string) => void;
  pagination?: { pageIndex: number; pageSize: number };
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  pageCount?: number;
  meta?: TableMeta<TData>;
  getRowId?: (row: TData) => string;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;
  emptyMessage?: React.ReactNode;
};

export function DataTable<TData>({
  columns,
  data,
  filterPlaceholder,
  onRowClick,
  toolbar,
  sorting: sortingProp,
  onSortingChange,
  globalFilter: globalFilterProp,
  onGlobalFilterChange,
  pagination: paginationProp,
  onPaginationChange,
  pageCount,
  meta,
  getRowId,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  emptyMessage = "Ничего не найдено.",
}: DataTableProps<TData>) {
  const [rowSelectionState, setRowSelectionState] = useState<Record<string, boolean>>({});
  const rowSelection = rowSelectionProp ?? rowSelectionState;
  const setRowSelection = (updater: React.SetStateAction<Record<string, boolean>>) => {
    const next = typeof updater === "function" ? updater(rowSelection) : updater;
    if (onRowSelectionChange) onRowSelectionChange(next);
    else setRowSelectionState(next);
  };
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [globalFilterState, setGlobalFilterState] = useState("");
  const [paginationState, setPaginationState] = useState({ pageIndex: 0, pageSize: 10 });

  const sorting = sortingProp ?? sortingState;
  const globalFilter = globalFilterProp ?? globalFilterState;
  const pagination = paginationProp ?? paginationState;

  const table = useReactTable({
    data,
    columns,
    getRowId,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // initialState: { pagination: { pageSize: 10 } },
    meta,
    manualPagination: !!onPaginationChange,
    manualSorting: !!onSortingChange,
    manualFiltering: !!onGlobalFilterChange,
    pageCount,
    onSortingChange: onSortingChange
      ? (updater) => {
        const next = typeof updater === "function" ? updater(sorting) : updater
        onSortingChange(next)
      }
      : setSortingState,
    onGlobalFilterChange: onGlobalFilterChange
      ? (updater) => {
        const next = typeof updater === "function" ? updater(globalFilter) : updater
        onGlobalFilterChange(next)
      }
      : setGlobalFilterState,
    onPaginationChange: onPaginationChange
      ? (updater) => {
          const next = typeof updater === "function" ? updater(pagination) : updater
          onPaginationChange(next)
        }
      : setPaginationState,
    state: {
      sorting,
      globalFilter,
      pagination,
      rowSelection,
      columnVisibility,
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <DataTableToolbar table={table} filterPlaceholder={filterPlaceholder}>
        {toolbar}
      </DataTableToolbar>

      <div className="overflow-x-auto rounded-md border">
        <Table style={{ width: "100%", minWidth: table.getTotalSize() }}>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

    </div>
  );
};
