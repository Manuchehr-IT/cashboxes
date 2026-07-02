import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/api/admin"

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: adminApi.me,
    retry: false,
  })
}
