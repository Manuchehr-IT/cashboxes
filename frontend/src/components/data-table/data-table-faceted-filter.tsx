import { Check, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export interface FacetedFilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

interface DataTableFacetedFilterProps {
  title: string
  options: FacetedFilterOption[]
  selected: string[]
  onChange: (values: string[]) => void
  disabled?: boolean
  disabledTooltip?: string
}

export function DataTableFacetedFilter({
  title,
  options,
  selected,
  onChange,
  disabled,
  disabledTooltip,
}: DataTableFacetedFilterProps) {
  const selectedSet = new Set(selected)

  const toggle = (value: string) => {
    const next = new Set(selectedSet)
    next.has(value) ? next.delete(value) : next.add(value)
    onChange(Array.from(next))
  }

  const trigger = (
    <Button variant="outline" size="sm" className="h-8 border-dashed gap-1.5" disabled={disabled}>
      <PlusCircle className="size-4" />
      {title}
      {selectedSet.size > 0 && (
        <>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
            {selectedSet.size}
          </Badge>
          <div className="hidden gap-1 lg:flex">
            {selectedSet.size > 2 ? (
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                Выбрано: {selectedSet.size}
              </Badge>
            ) : (
              options
                .filter((o) => selectedSet.has(o.value))
                .map((o) => (
                  <Badge
                    key={o.value}
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {o.label}
                  </Badge>
                ))
            )}
          </div>
        </>
      )}
    </Button>
  )

  return (
    <Popover>
      {disabled && disabledTooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {/* span-обёртка — disabled-кнопка не всплывает мышиные события, тултип бы не показался */}
            <span tabIndex={0} className="inline-flex">
              <PopoverTrigger asChild>
                {trigger}
              </PopoverTrigger>
            </span>
          </TooltipTrigger>
          <TooltipContent>{disabledTooltip}</TooltipContent>
        </Tooltip>
      ) : (
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      )}
      <PopoverContent className="w-64 p-1" align="start">
        <div className="flex flex-col">
          <div className="flex flex-col max-h-64 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selectedSet.has(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  title={option.label}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <div
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible",
                    )}
                  >
                    <Check className="size-3.5" />
                  </div>
                  {option.icon && (
                    <option.icon className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 truncate">{option.label}</span>
                </button>
              )
            })}
          </div>
          {selectedSet.size > 0 && (
            <>
              <Separator className="my-1" />
              <button
                type="button"
                onClick={() => onChange([])}
                className="rounded-sm px-2 py-1.5 text-center text-sm hover:bg-accent"
              >
                Сбросить фильтр
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
