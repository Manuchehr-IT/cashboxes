import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getErrorMessage } from "@/lib/api-error"
import { useUpdate } from "@/pages/users/hooks/use-update"
import type { User } from "@/pages/users/types"

const schema = z.object({
  username: z.string().min(1, "Введите имя пользователя"),
  is_active: z.boolean(),
})

type Values = z.infer<typeof schema>

const CONFLICT_MESSAGE = "Пользователь с таким именем уже существует"

interface EditUserSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export function EditUserSheet({ open, onOpenChange, user }: EditUserSheetProps) {
  const update = useUpdate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", is_active: true },
  })

  useEffect(() => {
    if (open && user) {
      form.reset({ username: user.username, is_active: user.is_active })
      setError(null)
    }
  }, [open, user, form])

  const handleSubmit = async (values: Values) => {
    if (!user) return
    setError(null)
    try {
      await update.mutateAsync({ id: user.id, payload: values })
      onOpenChange(false)
      toast.success(`Пользователь «${values.username}» обновлён`)
    } catch (err) {
      setError(getErrorMessage(err, { conflict: CONFLICT_MESSAGE }))
    }
  }

  const errors = form.formState.errors

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:!max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Редактировать пользователя</SheetTitle>
          <SheetDescription>Изменения применятся к профилю пользователя</SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          <form id="edit-user-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input id="username" {...form.register("username")} />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Статус</Label>
              <Select
                value={String(form.watch("is_active"))}
                onValueChange={(v) => form.setValue("is_active", v === "true", { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  <SelectItem value="true">Активный</SelectItem>
                  <SelectItem value="false">Неактивный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>

          {error && <p className="text-sm text-destructive text-center pt-4">{error}</p>}
        </div>

        <SheetFooter className="shrink-0 border-t px-6 py-4">
          <Button
            type="submit"
            form="edit-user-form"
            size="lg"
            className="w-full"
            disabled={update.isPending}
          >
            {update.isPending ? "Сохранение..." : "Сохранить"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
