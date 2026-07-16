import { Navigate, Outlet } from "react-router-dom"
import { Spinner } from "@/components/ui/spinner"
import { useMe } from "@/hooks/admin/use-me"

export function PublicRoute() {
  const me = useMe()

  if (me.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner size={24} />
      </div>
    )
  }

  if (!me.isError && me.data) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
