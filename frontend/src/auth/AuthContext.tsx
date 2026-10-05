import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { readMockRole, readMockSession, writeMockSession, type AccountRole } from './auth.mock'
import { company } from '../mocks/company.mock'

type AuthContextValue = {
  isAuthenticated: boolean
  role: AccountRole
  companyId: string | null
  login: (role?: AccountRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Provedor de autenticação do protótipo — implementação MOCK.
 *
 * Não valida credenciais nem fala com nenhuma API: existe apenas para que
 * rotas públicas/protegidas e o fluxo de login/logout funcionem de ponta a
 * ponta antes do backend (Spring Security/JWT) estar disponível.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readMockSession)
  const [role, setRole] = useState(readMockRole)

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      role,
      companyId: isAuthenticated && role === 'empresa' ? company.id : null,
      login: (nextRole = 'colaborador') => {
        writeMockSession(true, nextRole)
        setRole(nextRole)
        setIsAuthenticated(true)
      },
      logout: () => {
        writeMockSession(false)
        setIsAuthenticated(false)
        setRole('colaborador')
      },
    }),
    [isAuthenticated, role],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}
