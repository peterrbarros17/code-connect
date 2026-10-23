import type { LoginResponse, User } from '../types/auth.ts'

const TOKEN_KEY = 'code-connect:access-token'
const USER_KEY = 'code-connect:user'
const EXPIRES_AT_KEY = 'code-connect:expires-at'

export function saveSession(session: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, session.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify(session.user))

  if (Number.isFinite(session.expires_in) && session.expires_in > 0) {
    localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + session.expires_in * 1000))
  } else {
    localStorage.removeItem(EXPIRES_AT_KEY)
  }
}

export function getAccessToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)

  if (!token) {
    return null
  }

  const expiresAt = Number(localStorage.getItem(EXPIRES_AT_KEY))

  if (expiresAt > 0 && Date.now() >= expiresAt) {
    clearSession()
    return null
  }

  return token
}

export function getStoredUser(): User | null {
  const rawUser = localStorage.getItem(USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as User
  } catch {
    clearSession()
    return null
  }
}

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
}
