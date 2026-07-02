export type LoginRequest = {
  username: string
  password: string
}

export type AuthResponse = {
  access_token: string
  refresh_token: string | null
}
