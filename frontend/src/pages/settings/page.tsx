import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage } from "@/lib/api-error"
import { settingsApi } from "@/pages/settings/api/settings"
import type { OneCSettings, UpdateOneCSettingsPayload } from "@/pages/settings/types"

interface OneCSettingsFormProps {
  settings: OneCSettings
  isPending: boolean
  onSubmit: (payload: UpdateOneCSettingsPayload) => void
}

function OneCSettingsForm({ settings, isPending, onSubmit }: OneCSettingsFormProps) {
  const [username, setUsername] = useState(settings.username)
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ username, ...(password ? { password } : {}) })
    setPassword("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="onec-username">Пользователь</Label>
        <Input
          id="onec-username"
          autoComplete="off"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="onec-password">Пароль</Label>
        <PasswordInput
          id="onec-password"
          autoComplete="off"
          preventPasswordManager
          placeholder={settings.has_password ? "Оставьте пустым, чтобы не менять" : "Пароль не задан"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Сохранение..." : "Сохранить"}
      </Button>
    </form>
  )
}

export function SettingsPage() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["settings", "onec"],
    queryFn: settingsApi.getOneC,
  })

  const update = useMutation({
    mutationFn: settingsApi.updateOneC,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "onec"] })
      toast.success("Настройки 1C сохранены")
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Настройки</h2>
        <p className="text-muted-foreground text-sm">Авторизация для запросов к 1C</p>
      </div>

      <div className="rounded-md border p-4 max-w-md">
        {query.data ? (
          <OneCSettingsForm
            key={query.data.username}
            settings={query.data}
            isPending={update.isPending}
            onSubmit={(payload) => update.mutate(payload)}
          />
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}
      </div>
    </div>
  )
}
