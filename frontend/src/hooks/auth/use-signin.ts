import { useMutation } from "@tanstack/react-query"
import { authApi } from "@/api/auth"
import type { LoginRequest } from "@/types/auth"
import { setAccessToken } from "@/lib/auth"

export function useSignin() {
  const login = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),

    onSuccess: (response) => {
      setAccessToken(response.data.access_token)
    },
  })

  return {
    login,
  }
}
