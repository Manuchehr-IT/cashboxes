import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends React.ComponentProps<"input"> {
  /**
   * Маскирует текст через CSS (-webkit-text-security) вместо type="password". Chrome не
   * ignore-ит autocomplete="off" для реальных password-полей и всё равно предлагает
   * сохранить/обновить пароль — актуально, когда вводится ЧУЖОЙ пароль (админ меняет пароль
   * другого пользователя), а не свой собственный логин. Не поддерживается в Firefox.
   */
  preventPasswordManager?: boolean
}

function PasswordInput({ className, preventPasswordManager, style, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        type={preventPasswordManager ? "text" : visible ? "text" : "password"}
        autoCorrect="off"
        spellCheck={false}
        style={
          preventPasswordManager
            ? ({ ...style, WebkitTextSecurity: visible ? "none" : "disc" } as React.CSSProperties)
            : style
        }
        className={cn("pr-9", className)}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
      >
        {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </button>
    </div>
  )
}

export { PasswordInput }
