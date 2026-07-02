import { api } from "./client"
import type { AuthResponse, LoginRequest } from "@/types/auth"

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>("/auth/login", data),
}
