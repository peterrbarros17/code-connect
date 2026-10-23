import type { LoginPayload, LoginResponse, RegisterPayload, User } from '../types/auth.ts'
import { api } from './api.ts'

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', payload)

  return data
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<User>('/users', payload)

  return data
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/auth/me')

  return data
}
