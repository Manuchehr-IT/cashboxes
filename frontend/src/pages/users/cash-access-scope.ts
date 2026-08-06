import type { CashAccessScope } from "@/pages/users/types"

export const CASH_ACCESS_SCOPE_LABELS: Record<CashAccessScope, string> = {
  all: "Все",
  main: "Основные",
  non_main: "Неосновные",
}

export const CASH_ACCESS_SCOPE_OPTIONS: { value: CashAccessScope; label: string }[] = [
  { value: "all", label: CASH_ACCESS_SCOPE_LABELS.all },
  { value: "main", label: CASH_ACCESS_SCOPE_LABELS.main },
  { value: "non_main", label: CASH_ACCESS_SCOPE_LABELS.non_main },
]
