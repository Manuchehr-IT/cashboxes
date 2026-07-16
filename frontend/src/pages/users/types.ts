export type User = {
  id: string
  username: string
  is_active: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

export type ListUsersParams = {
  page?: number
  pageSize?: number
  q?: string
  sort?: string
  is_active?: boolean
}

export type ListUsersResponse = {
  items: User[]
  count: number
}

export type CreateUserPayload = {
  username: string
  is_active: boolean
}

export type UpdateUserPayload = {
  username?: string
  is_active?: boolean
}

export type CreateUserResponse = {
  user: User
  password: string
}
