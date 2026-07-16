import { useMutation, useQueryClient } from "@tanstack/react-query"
import { objectsApi } from "@/pages/objects/api/objects"
import type { UpdateObjectPayload } from "@/pages/objects/types"

export function useUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateObjectPayload }) =>
      objectsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objects"] })
    },
  })
}
