export type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL"

export type ListLogsParams = {
  limit?: number
  level?: LogLevel
  q?: string
}

export type ListLogsResponse = {
  lines: string[]
  total: number
}
