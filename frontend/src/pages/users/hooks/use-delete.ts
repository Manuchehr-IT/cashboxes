import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi } from "@/pages/users/api/users"

export function useDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
