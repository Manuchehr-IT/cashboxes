import { useMutation, useQueryClient } from "@tanstack/react-query"
import { objectsApi } from "@/pages/objects/api/objects"

export function useDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => objectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objects"] })
    },
  })
}
