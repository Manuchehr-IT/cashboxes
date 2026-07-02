import "@tanstack/react-table"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onOpen?: (row: TData) => void
    onEdit?: (row: TData) => void
    onDuplicate?: (row: TData) => void
    onFinish?: (row: TData) => void
    onCancel?: (row: TData) => void
    onDelete?: (row: TData) => void
    onToggle?: (row: TData, checked: boolean) => void
    pendingIds?: Set<string>
  }
}
