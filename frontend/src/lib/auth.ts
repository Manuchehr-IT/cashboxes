const ACCESS_TOKEN_KEY = "access_token"

let accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY)

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token: string) {
  accessToken = token
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken() {
  accessToken = null
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}
