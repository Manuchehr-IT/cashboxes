import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { FieldErrorIcon } from "@/components/ui/field-error-icon"

const signinSchema = z.object({
  username: z.string().min(1, "Введите имя пользователя"),
  password: z.string().min(1, "Введите пароль"),
})

export type SigninValues = z.infer<typeof signinSchema>

type Props = {
  onSubmit: (values: SigninValues) => void
  isLoading: boolean
  error?: string | null
}

export function SigninForm({ onSubmit, isLoading, error }: Props) {
  const form = useForm<SigninValues>({
    resolver: zodResolver(signinSchema),
    mode: "onTouched",
    defaultValues: { username: "", password: "" },
  })

  return (
    <>
      <CardContent>
        <form id="signin-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center gap-1.5">
                    <FieldLabel htmlFor={field.name}>Пользователь</FieldLabel>
                    <FieldErrorIcon message={fieldState.error?.message} />
                  </div>
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    autoComplete="username"
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center gap-1.5">
                    <FieldLabel htmlFor={field.name}>Пароль</FieldLabel>
                    <FieldErrorIcon message={fieldState.error?.message} />
                  </div>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        {error && <p className="mt-3 text-sm text-destructive text-center">{error}</p>}
      </CardContent>

      <CardFooter>
        <Button type="submit" form="signin-form" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Загрузка..." : "Войти"}
        </Button>
      </CardFooter>
    </>
  )
}
