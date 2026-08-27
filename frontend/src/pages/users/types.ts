export type CashAccessScope = "main" | "non_main" | "all"

export type User = {
  id: string
  username: string
  is_admin: boolean
  cash_access_scope: CashAccessScope
  can_view_cashboxes: boolean
  can_view_counterparties: boolean
  created_at: string
  updated_at: string
}

export type ListUsersParams = {
  page?: number
  pageSize?: number
  q?: string
  sort?: string
}

export type ListUsersResponse = {
  items: User[]
  count: number
}

export type CreateUserPayload = {
  username: string
  cash_access_scope?: CashAccessScope
}

export type UpdateUserPayload = {
  username?: string
  cash_access_scope?: CashAccessScope
  can_view_cashboxes?: boolean
  can_view_counterparties?: boolean
}

export type CreateUserResponse = {
  user: User
  password: string
}
