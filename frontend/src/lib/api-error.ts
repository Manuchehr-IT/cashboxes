import { isAxiosError } from "axios"

/** Переводы доменных кодов ошибок бэкенда (src/domain/.../exceptions.py), не покрытых inline-обработкой в формах. */
const ERROR_CODE_MESSAGES: Record<string, string> = {
  self_access_forbidden: "Нельзя изменить доступ к объектам для самого себя",
  admin_access_forbidden: "Нельзя изменить доступ к объектам для администратора",
  self_deletion_forbidden: "Нельзя удалить самого себя",
  admin_deletion_forbidden: "Нельзя удалить администратора",
  admin_password_change_forbidden: "Нельзя изменить пароль другого администратора",
  cash_access_forbidden: "Нет доступа к этой кассе",
}

interface GetErrorMessageOptions {
  /** Сообщение для HTTP 409 — конфликтные ошибки (уже существует) обычно специфичны для формы. */
  conflict?: string
  fallback?: string
}

/**
 * Извлекает читаемое сообщение об ошибке API для форм, тостов и алертов.
 * Доменные ошибки (ForbiddenError, NotFoundError, ConflictError и т.д.) отдаются
 * бэкендом как {code, message}; необработанные FastAPI-ошибки (422 и т.п.) — как {detail}.
 */
export function getErrorMessage(error: unknown, options?: GetErrorMessageOptions): string {
  const fallback = options?.fallback ?? "Что-то пошло не так, попробуйте позже"

  if (isAxiosError(error)) {
    if (options?.conflict && error.response?.status === 409) return options.conflict

    const data = error.response?.data
    if (typeof data?.code === "string" && data.code in ERROR_CODE_MESSAGES) {
      return ERROR_CODE_MESSAGES[data.code]
    }
    if (typeof data?.message === "string") return data.message
    if (typeof data?.detail === "string") return data.detail
    if (Array.isArray(data?.detail) && data.detail.length > 0) return data.detail[0]?.msg ?? fallback
  }
  return fallback
}
