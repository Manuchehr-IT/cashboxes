export type UserResponse = {
  id: string
  username: string
  is_admin: boolean
  cash_access_scope: "main" | "non_main" | "all"
  can_view_cashboxes: boolean
  can_view_counterparties: boolean
  created_at: string
  updated_at: string
}
