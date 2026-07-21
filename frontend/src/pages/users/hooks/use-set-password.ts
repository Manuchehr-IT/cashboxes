import { useMutation } from "@tanstack/react-query"
import { usersApi } from "@/pages/users/api/users"

export function useSetPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      usersApi.setPassword(id, password),
  })
}
