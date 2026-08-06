import { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Circle, CircleOff, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { usersApi } from "@/pages/users/api/users"
import { CASH_ACCESS_SCOPE_LABELS } from "@/pages/users/cash-access-scope"
import { EditUserSheet } from "@/pages/users/edit-sheet"
import { SetPasswordModal } from "@/pages/users/set-password-modal"
import { UserObjectsPage } from "@/pages/user-objects"

type Tab = "profile" | "objects"

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Профиль" },
  { id: "objects", label: "Объекты" },
]

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = (searchParams.get("tab") as Tab) ?? "profile"

  const setTab = (tab: Tab) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      tab === "profile" ? next.delete("tab") : next.set("tab", tab)
      // сброс табличных параметров при смене вкладки
      next.delete("page"); next.delete("sort"); next.delete("q"); next.delete("is_assigned")
      return next
    }, { replace: true })

  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersApi.get(userId!),
    enabled: !!userId,
  })

  const user = userQuery.data ?? null

  const [editOpen, setEditOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            {userQuery.isPending ? (
              <Skeleton className="h-7 w-48" />
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight truncate">
                  {user?.username ?? "Пользователь"}
                </h2>
                {user?.is_admin && (
                  <Badge variant="outline" className="rounded-lg bg-violet-200/30 text-violet-600 border-violet-300 dark:text-violet-100 gap-1">
                    <ShieldCheck className="size-3" /> Админ
                  </Badge>
                )}
                {user && (
                  user.is_active ? (
                    <Badge variant="outline" className="rounded-lg bg-green-200/30 text-green-600 border-green-300 dark:text-green-100 gap-1">
                      <Circle className="size-3" /> Активный
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-lg bg-gray-200/30 text-gray-600 border-gray-300 dark:text-gray-100 gap-1">
                      <CircleOff className="size-3" /> Неактивный
                    </Badge>
                  )
                )}
              </div>
            )}
            <p className="text-muted-foreground text-sm">
              Профиль пользователя и доступ к объектам
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {user && (
            <>
              <Button variant="outline" size="lg" onClick={() => setPasswordOpen(true)}>
                Изменить пароль
              </Button>
              <Button variant="outline" size="lg" onClick={() => setEditOpen(true)}>
                Редактировать
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "px-4 pb-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "profile" && user && (
        <div className="rounded-md border p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Имя пользователя</span>
            <span className="font-medium">{user.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Роль</span>
            <span className="font-medium">{user.is_admin ? "Админ" : "Пользователь"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Статус</span>
            <span className="font-medium">{user.is_active ? "Активный" : "Неактивный"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Доступные кассы</span>
            <span className="font-medium">{CASH_ACCESS_SCOPE_LABELS[user.cash_access_scope]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Создан</span>
            <span className="font-medium">
              {new Date(user.created_at).toLocaleString("ru-RU", {
                day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      )}
      {activeTab === "objects" && userId && <UserObjectsPage userId={userId} />}

      {user && (
        <>
          <EditUserSheet open={editOpen} onOpenChange={setEditOpen} user={user} />
          <SetPasswordModal open={passwordOpen} onOpenChange={setPasswordOpen} user={user} />
        </>
      )}
    </div>
  )
}
