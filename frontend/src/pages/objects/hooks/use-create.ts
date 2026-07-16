import { useMutation, useQueryClient } from "@tanstack/react-query"
import { objectsApi } from "@/pages/objects/api/objects"
import type { CreateObjectPayload } from "@/pages/objects/types"

export function useCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateObjectPayload) => objectsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objects"] })
    },
  })
}
