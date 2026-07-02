import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usersApi } from "@/pages/users/api/users"
import type { CreateUserPayload } from "@/pages/users/types"

export function useCreate() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] })
		},
	})
}
