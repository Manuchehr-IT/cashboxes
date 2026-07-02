import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { clearAccessToken, getAccessToken } from "@/lib/auth"

/** Converts a server-relative path (e.g. /storage/…) to a full URL using the API origin. */
export function resolveStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const base = (import.meta.env.VITE_API_URL as string | undefined) ?? ""
  return `${base}${path}`
}

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    const parts: string[] = []
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue
      if (Array.isArray(value)) {
        for (const v of value) parts.push(`${key}=${encodeURIComponent(v)}`)
      } else {
        parts.push(`${key}=${encodeURIComponent(value as string)}`)
      }
    }
    return parts.join("&")
  },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const access_token = getAccessToken()

  if (access_token) {
    config.headers.Authorization = `Bearer ${access_token}`
  }

  config.headers['ngrok-skip-browser-warning'] = 'true'

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAccessToken()
      console.log("Ошибка авторизации [api.interceptors.response.use]");
    }

    return Promise.reject(error)
  }
)
