import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/api-error"
import { useSetPassword } from "@/pages/users/hooks/use-set-password"
import type { User } from "@/pages/users/types"

const schema = z
  .object({
    password: z.string().min(8, "Минимум 8 символов"),
    confirm_password: z.string().min(1, "Повторите пароль"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Пароли не совпадают",
    path: ["confirm_password"],
  })

type Values = z.infer<typeof schema>

const DEFAULT_VALUES: Values = { password: "", confirm_password: "" }

interface SetPasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export function SetPasswordModal({ open, onOpenChange, user }: SetPasswordModalProps) {
  const setPassword = useSetPassword()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (open) {
      form.reset(DEFAULT_VALUES)
      setError(null)
    }
  }, [open, form])

  const handleSubmit = async (values: Values) => {
    if (!user) return
    setError(null)
    try {
      await setPassword.mutateAsync({ id: user.id, password: values.password })
      onOpenChange(false)
      toast.success(`Пароль пользователя «${user.username}» изменён`)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const errors = form.formState.errors

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md flex flex-col p-0 gap-0">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b">
          <DialogTitle>Изменить пароль</DialogTitle>
          <DialogDescription>
            Новый пароль для пользователя <strong className="font-semibold text-foreground">{user?.username}</strong>
          </DialogDescription>
        </DialogHeader>

        <form id="set-password-form" autoComplete="off" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Новый пароль</Label>
              <PasswordInput
                id="new-password"
                autoFocus
                autoComplete="off"
                preventPasswordManager
                {...form.register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Подтверждение пароля</Label>
              <PasswordInput
                id="confirm-password"
                autoComplete="off"
                preventPasswordManager
                {...form.register("confirm_password")}
              />
              {errors.confirm_password && (
                <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
              )}
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </div>

          <div className="shrink-0 px-6 py-4 border-t">
            <Button
              type="submit"
              form="set-password-form"
              size="lg"
              className="w-full"
              disabled={setPassword.isPending}
            >
              {setPassword.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
