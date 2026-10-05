/**
 * Camada de sessão MOCK do protótipo ETP Systems.
 *
 * Este é o único módulo do front-end que sabe onde a sessão é persistida
 * (sessionStorage, só para sobreviver a um refresh durante o protótipo).
 * Nenhuma página ou componente deve importar este arquivo diretamente —
 * sempre através de `useAuth()` (ver AuthContext.tsx).
 *
 * Quando a autenticação real (API + Spring Security/JWT) existir, esta
 * implementação é substituída sem que AuthContext, RequireAuth ou
 * qualquer página precisem mudar.
 */
const SESSION_KEY = 'etp-mock-session'
const ROLE_KEY = 'etp-mock-role'
export type AccountRole = 'colaborador' | 'empresa'

export function homeForRole(role: AccountRole) {
  return role === 'empresa' ? '/empresa/dashboard' : '/dashboard'
}

export function readMockRole(): AccountRole {
  try {
    return readMockSession() && window.sessionStorage.getItem(ROLE_KEY) === 'empresa' ? 'empresa' : 'colaborador'
  } catch {
    return 'colaborador'
  }
}

export function readMockSession(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeMockSession(value: boolean, role: AccountRole = 'colaborador'): void {
  try {
    if (value) {
      window.sessionStorage.setItem(ROLE_KEY, role)
      window.sessionStorage.setItem(SESSION_KEY, 'true')
    } else {
      window.sessionStorage.removeItem(SESSION_KEY)
      window.sessionStorage.removeItem(ROLE_KEY)
    }
  } catch {
    // sessionStorage indisponível (ex.: modo privado) — sessão fica só em memória
  }
}
