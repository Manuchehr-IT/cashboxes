import { type Table } from "@tanstack/react-table";
import { Settings2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterPlaceholder?: string;
  children?: React.ReactNode; // слот для кастомных кнопок (Status, Priority и т.д.)
}

export function DataTableToolbar<TData>({
  table,
  filterPlaceholder = "Filter...",
  children,
}: DataTableToolbarProps<TData>) {
  const externalFilter = (table.getState().globalFilter as string) ?? ""
  const [inputValue, setInputValue] = useState(externalFilter)
  const isFiltered = inputValue.length > 0;

  // Синхронизация, когда globalFilter меняется извне (кнопка «назад», программный сброс),
  // не затирая текст, который пользователь сейчас печатает.
  useEffect(() => {
    const effective = inputValue.length >= 2 ? inputValue : ""
    if (externalFilter !== effective) setInputValue(externalFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalFilter])

  // Дебаунс. <2 символов трактуем как пустой фильтр — иначе при удалении до 1 символа
  // старый фильтр «залипал» и не сбрасывался.
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = (table.getState().globalFilter as string) ?? ""
      const next = inputValue.length >= 2 ? inputValue : ""
      if (next !== current) table.setGlobalFilter(next)
    }, 400)
    return () => clearTimeout(timer)
  }, [inputValue, table])

  const handleReset = () => {
    setInputValue("")
    table.setGlobalFilter("")
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder={filterPlaceholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {children}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleReset}
          >
            Сбросить <X className="ml-2 size-4" />
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ms-auto hidden h-8 lg:flex gap-1.5">
            <Settings2 className="size-4" />
            Колонки
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {table.getAllColumns()
            .filter((col) => col.getCanHide())
            .map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={col.getIsVisible()}
                onCheckedChange={(v) => col.toggleVisibility(!!v)}
                onSelect={(e) => e.preventDefault()}
              >
                {col.columnDef.meta?.label ?? col.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
