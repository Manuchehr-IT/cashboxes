import { Navigate, Outlet } from "react-router-dom"
import { useMe } from "@/hooks/admin/use-me"

export function ProtectedRoute() {
  const me = useMe()

  if (me.isLoading) {
    return <div>Loading...</div>
  }

  if (me.isError || !me.data) {
    return <Navigate to="/signin" replace />
  }

  return <Outlet />
}
