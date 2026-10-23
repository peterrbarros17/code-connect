export type User = {
  id: string
  name: string
  email: string
  createdAt: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
}

export type LoginResponse = {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}
