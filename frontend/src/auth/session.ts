import { ApiError, requestJson } from '../api/client.ts'
import { parseLogin, parseUser, roleForUser, type AccountRole, type AuthUser, type Credentials } from './auth.ts'

const STORAGE_KEY = 'etp-auth-session-v1'
type SessionStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
type Snapshot = {
  status: 'checking' | 'anonymous' | 'authenticated' | 'unavailable'
  user: AuthUser | null
  expiresAt: number | null
  expired: boolean
}

export class AccountRoleError extends Error {
  constructor() { super('A conta pertence a outro perfil de acesso.') }
}

export function createAuthSession(storage: () => SessionStorage = () => window.sessionStorage, now = Date.now) {
  let credentials: Credentials | null = null
  let revision = 0
  let snapshot: Snapshot = { status: 'checking', user: null, expiresAt: null, expired: false }
  const listeners = new Set<() => void>()

  function publish(next: Snapshot) {
    snapshot = next
    listeners.forEach((listener) => listener())
  }

  function persist(value: Credentials | null) {
    try {
      const target = storage()
      target.removeItem('etp-mock-session')
      target.removeItem('etp-mock-role')
      if (value) target.setItem(STORAGE_KEY, JSON.stringify(value))
      else target.removeItem(STORAGE_KEY)
    } catch { /* A sessão permanece em memória quando o navegador bloqueia armazenamento. */ }
  }

  function read(): Credentials | null {
    try {
      const value: unknown = JSON.parse(storage().getItem(STORAGE_KEY) ?? 'null')
      if (value && typeof value === 'object') {
        const saved = value as Record<string, unknown>
        if (typeof saved.accessToken === 'string' && saved.accessToken.trim()
          && typeof saved.expiresAt === 'number' && Number.isFinite(saved.expiresAt)) {
          return { accessToken: saved.accessToken, expiresAt: saved.expiresAt }
        }
      }
    } catch { /* Dados inválidos não concedem acesso. */ }
    return null
  }

  function logout(expired = false) {
    revision += 1
    credentials = null
    persist(null)
    publish({ status: 'anonymous', user: null, expiresAt: null, expired })
  }

  function expireIfNeeded() {
    if (credentials && credentials.expiresAt <= now()) logout(true)
  }

  async function restore(signal?: AbortSignal) {
    const current = ++revision
    credentials ??= read()
    if (!credentials) { logout(snapshot.expired); return }
    if (credentials.expiresAt <= now()) { logout(true); return }
    publish({ status: 'checking', user: null, expiresAt: credentials.expiresAt, expired: false })
    try {
      const user = parseUser(await requestJson('/api/auth/me', { token: credentials.accessToken, signal }))
      if (current !== revision || signal?.aborted) return
      if (credentials.expiresAt <= now()) { logout(true); return }
      persist(credentials)
      publish({ status: 'authenticated', user, expiresAt: credentials.expiresAt, expired: false })
    } catch (error) {
      if (current !== revision || signal?.aborted) return
      if (error instanceof ApiError && error.status === 401) logout(true)
      else publish({ status: 'unavailable', user: null, expiresAt: credentials.expiresAt, expired: false })
    }
  }

  async function login(email: string, senha: string, expectedRole: AccountRole, signal?: AbortSignal): Promise<AuthUser> {
    logout()
    const current = ++revision
    const startedAt = now()
    const result = parseLogin(await requestJson('/api/auth/login', {
      method: 'POST', body: { email: email.trim(), senha }, signal,
    }), startedAt)
    if (current !== revision || signal?.aborted) throw new DOMException('Operação cancelada', 'AbortError')
    if (roleForUser(result.user) !== expectedRole) throw new AccountRoleError()
    if (result.credentials.expiresAt <= now()) throw new ApiError(401)
    credentials = result.credentials
    persist(credentials)
    publish({ status: 'authenticated', user: result.user, expiresAt: credentials.expiresAt, expired: false })
    return result.user
  }

  async function request(path: string, signal?: AbortSignal): Promise<unknown> {
    const current = credentials
    if (current && current.expiresAt <= now()) { logout(true); throw new ApiError(401) }
    try {
      return await requestJson(path, { token: current?.accessToken, signal })
    } catch (error) {
      // Uma resposta de uma sessão antiga não pode encerrar um login mais recente.
      if (current && current === credentials && error instanceof ApiError && error.status === 401) logout(true)
      throw error
    }
  }

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    login, logout, restore, request, expireIfNeeded,
  }
}

export const authSession = createAuthSession()
