import { api } from "@/api/client"
import type {
  CreateUserPayload,
  CreateUserResponse,
  ListUsersParams,
  ListUsersResponse,
  UpdateUserPayload,
  User,
} from "@/pages/users/types"

export const usersApi = {
  list: (params?: ListUsersParams): Promise<ListUsersResponse> => {
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 10
    const query: Record<string, unknown> = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      q: params?.q,
      sort: params?.sort,
    }
    return api.get<ListUsersResponse>("/users", { params: query }).then((r) => r.data)
  },

  get: (userId: string): Promise<User> =>
    api.get<User>(`/users/${userId}`).then((r) => r.data),

  create: (payload: CreateUserPayload): Promise<CreateUserResponse> =>
    api.post<CreateUserResponse>("/users", payload).then((r) => r.data),

  update: (userId: string, payload: UpdateUserPayload): Promise<User> =>
    api.patch<User>(`/users/${userId}`, payload).then((r) => r.data),

  delete: (userId: string): Promise<void> =>
    api.delete(`/users/${userId}`).then(() => undefined),

  setPassword: (userId: string, password: string): Promise<void> =>
    api.patch(`/users/${userId}/password`, { password }).then(() => undefined),
}
