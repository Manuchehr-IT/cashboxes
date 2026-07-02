import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { clearAccessToken } from "@/lib/auth"

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const logout = () => {
    clearAccessToken()
    queryClient.clear()
    navigate("/signin", { replace: true })
  }

  return logout
}
