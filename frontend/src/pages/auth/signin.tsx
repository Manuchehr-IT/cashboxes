import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { isAxiosError } from "axios"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SigninForm, type SigninValues } from "@/components/auth/signin-form"
import { useSignin } from "@/hooks/auth/use-signin"

function extractApiError(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status
    if (status === 401 || status === 400 || status === 422) return "Неверный логин или пароль"
  }
  return "Сервер недоступен, попробуйте позже"
}

export function SigninPage() {
  const navigate = useNavigate()
  const signin = useSignin()
  const [error, setError] = useState<string | null>(null)

  const handleSignin = async (values: SigninValues) => {
    setError(null)
    try {
      await signin.login.mutateAsync({
        username: values.username,
        password: values.password,
      })
      navigate("/")
    } catch (err) {
      setError(extractApiError(err))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Войти в систему</CardTitle>
          <CardDescription>Введите данные для входа</CardDescription>
        </CardHeader>

        <SigninForm
          onSubmit={handleSignin}
          isLoading={signin.login.isPending}
          error={error}
        />
      </Card>
    </div>
  )
}
