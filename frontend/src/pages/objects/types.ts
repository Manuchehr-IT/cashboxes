export type Obj = {
  id: string
  title: string
  url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ListObjectsParams = {
  page?: number
  pageSize?: number
  q?: string
  sort?: string
  is_active?: boolean
}

export type ListObjectsResponse = {
  items: Obj[]
  count: number
}

export type CreateObjectPayload = {
  title: string
  url: string
  is_active: boolean
}

export type UpdateObjectPayload = {
  title?: string
  url?: string
  is_active?: boolean
}
