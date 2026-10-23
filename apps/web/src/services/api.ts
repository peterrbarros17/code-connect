import axios from 'axios'
import { getAccessToken } from './auth-storage.ts'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

type ErrorBody = {
  message?: string | string[]
  error?: string
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const body = error.response?.data as ErrorBody | undefined
    const message = Array.isArray(body?.message) ? body.message.join(' ') : body?.message
    const fallback = status
      ? (body?.error ?? 'Não foi possível concluir a solicitação.')
      : 'Não foi possível conectar ao servidor. Tente novamente.'

    return Promise.reject(new ApiError(message ?? fallback, status))
  },
)

export function getErrorMessage(error: unknown, fallback = 'Não foi possível concluir a operação.') {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
