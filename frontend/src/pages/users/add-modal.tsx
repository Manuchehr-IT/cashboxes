import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Check, Copy } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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
import { CASH_ACCESS_SCOPE_OPTIONS } from "@/pages/users/cash-access-scope"
import { useCreate } from "@/pages/users/hooks/use-create"
import type { CashAccessScope } from "@/pages/users/types"

const schema = z.object({
  username: z.string().min(1, "Введите имя пользователя"),
  cash_access_scope: z.enum(["main", "non_main", "all"]),
})

type Values = z.infer<typeof schema>

const DEFAULT_VALUES: Values = { username: "", cash_access_scope: "all" }
const CONFLICT_MESSAGE = "Пользователь с таким именем уже существует"

interface AddUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddUserModal({ open, onOpenChange }: AddUserModalProps) {
  const create = useCreate()
  const [error, setError] = useState<string | null>(null)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (open) {
      form.reset(DEFAULT_VALUES)
      setError(null)
      setGeneratedPassword(null)
      setCopied(false)
    }
  }, [open, form])

  const handleSubmit = async (values: Values) => {
    setError(null)
    try {
      const result = await create.mutateAsync(values)
      setGeneratedPassword(result.password)
      toast.success(`Пользователь «${values.username}» создан`)
    } catch (err) {
      setError(getErrorMessage(err, { conflict: CONFLICT_MESSAGE }))
    }
  }

  const handleCopy = () => {
    if (!generatedPassword) return
    navigator.clipboard.writeText(generatedPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const errors = form.formState.errors

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md flex flex-col p-0 gap-0">
        {generatedPassword ? (
          <>
            <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b">
              <DialogTitle>Пользователь создан</DialogTitle>
              <DialogDescription>Сохраните пароль — он показывается только один раз</DialogDescription>
            </DialogHeader>

            <div className="px-6 py-5 space-y-3">
              <Label>Временный пароль</Label>
              <div className="flex gap-2">
                <Input readOnly value={generatedPassword} className="font-mono" />
                <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Передайте пользователю. После закрытия окна пароль восстановить невозможно.
              </p>
            </div>

            <div className="shrink-0 px-6 py-4 border-t">
              <Button size="lg" className="w-full" onClick={() => onOpenChange(false)}>
                Готово
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b">
              <DialogTitle>Создать пользователя</DialogTitle>
              <DialogDescription>Пароль будет сгенерирован автоматически</DialogDescription>
            </DialogHeader>

            <form id="add-user-form" onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="px-6 py-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="add-username">Имя пользователя</Label>
                  <Input id="add-username" autoFocus {...form.register("username")} />
                  {errors.username && (
                    <p className="text-xs text-destructive">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Доступные кассы</Label>
                  <Select
                    value={form.watch("cash_access_scope")}
                    onValueChange={(v) => form.setValue("cash_access_scope", v as CashAccessScope, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      {CASH_ACCESS_SCOPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {error && <p className="text-sm text-destructive text-center">{error}</p>}
              </div>

              <div className="shrink-0 px-6 py-4 border-t">
                <Button type="submit" form="add-user-form" size="lg" className="w-full" disabled={create.isPending}>
                  {create.isPending ? "Создание..." : "Создать пользователя"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
