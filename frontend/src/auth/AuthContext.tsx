import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react'
import { roleForUser, type AccountRole, type AuthUser } from './auth'
import { authSession } from './session'

type AuthContextValue = {
  isAuthenticated: boolean
  status: ReturnType<typeof authSession.getSnapshot>['status']
  expired: boolean
  user: AuthUser | null
  role: AccountRole
  companyId: string | null
  login: typeof authSession.login
  logout: () => void
  retry: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(authSession.subscribe, authSession.getSnapshot)

  useEffect(() => {
    const controller = new AbortController()
    void authSession.restore(controller.signal)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (session.expiresAt === null) return
    const timer = window.setTimeout(authSession.expireIfNeeded, Math.max(0, session.expiresAt - Date.now()))
    window.addEventListener('focus', authSession.expireIfNeeded)
    document.addEventListener('visibilitychange', authSession.expireIfNeeded)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('focus', authSession.expireIfNeeded)
      document.removeEventListener('visibilitychange', authSession.expireIfNeeded)
    }
  }, [session.expiresAt])

  return <AuthContext.Provider value={{
    isAuthenticated: session.status === 'authenticated', status: session.status, expired: session.expired,
    user: session.user, role: session.user ? roleForUser(session.user) : 'colaborador',
    companyId: session.user?.empresaId ?? null,
    login: authSession.login, logout: () => authSession.logout(), retry: () => authSession.restore(),
  }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}
