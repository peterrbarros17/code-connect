import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getCurrentUser, login as loginRequest, register as registerRequest } from '../services/auth.ts'
import {
  clearSession,
  getAccessToken,
  getStoredUser,
  saveSession,
  saveUser,
} from '../services/auth-storage.ts'
import type { LoginPayload, RegisterPayload, User } from '../types/auth.ts'
import { AuthContext } from './auth-context.ts'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() =>
    getAccessToken() ? getStoredUser() : null,
  )
  const [isLoading, setIsLoading] = useState(() => Boolean(getAccessToken()))

  useEffect(() => {
    if (!getAccessToken()) {
      return
    }

    let isActive = true

    getCurrentUser()
      .then((currentUser) => {
        if (!isActive) {
          return
        }

        saveUser(currentUser)
        setUser(currentUser)
      })
      .catch(() => {
        if (!isActive) {
          return
        }

        clearSession()
        setUser(null)
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const session = await loginRequest(payload)

    saveSession(session)
    setUser(session.user)
  }, [])

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await registerRequest(payload)
      await login({ email: payload.email, password: payload.password })
    },
    [login],
  )

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
