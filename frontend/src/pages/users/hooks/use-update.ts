import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi } from "@/pages/users/api/users"
import type { UpdateUserPayload } from "@/pages/users/types"

export function useUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["user", id] })
    },
  })
}
