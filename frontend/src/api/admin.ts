import { api } from "./client"
import type { UserResponse } from "@/types/admin"

export const adminApi = {
  me: async (): Promise<UserResponse> => (await api.get<UserResponse>("/users/me")).data,
}
