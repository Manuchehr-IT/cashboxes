import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userObjectsApi } from "@/pages/user-objects/api/user-objects"

export function useRevoke(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (objectId: string) => userObjectsApi.revoke(userId, objectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-objects", userId] })
    },
  })
}
