import { api } from "@/api/client"
import type { ListUserObjectsParams, ListUserObjectsResponse } from "@/pages/user-objects/types"

export const userObjectsApi = {
  list: (userId: string, params?: ListUserObjectsParams): Promise<ListUserObjectsResponse> => {
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 10
    const query: Record<string, unknown> = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      sort: params?.sort,
    }
    if (params?.is_assigned !== undefined) query.is_assigned = params.is_assigned
    return api.get<ListUserObjectsResponse>(`/users/${userId}/objects`, { params: query }).then((r) => r.data)
  },

  grant: (userId: string, objectId: string): Promise<void> =>
    api.post(`/users/${userId}/objects/${objectId}`).then(() => undefined),

  revoke: (userId: string, objectId: string): Promise<void> =>
    api.delete(`/users/${userId}/objects/${objectId}`).then(() => undefined),
}
