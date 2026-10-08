import { ApiError } from '../api/client.ts'

export type AccountRole = 'colaborador' | 'empresa'
export type AuthUser = { id: string; nome: string; email: string; perfil: 'COLABORADOR' | 'EMPRESA'; empresaId: string | null }
export type Credentials = { accessToken: string; expiresAt: number }

export function homeForRole(role: AccountRole) {
  return role === 'empresa' ? '/empresa/dashboard' : '/dashboard'
}

export function roleForUser(user: AuthUser): AccountRole {
  return user.perfil === 'EMPRESA' ? 'empresa' : 'colaborador'
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function parseUser(value: unknown): AuthUser {
  if (!value || typeof value !== 'object') throw new ApiError(502)
  const user = value as Record<string, unknown>
  if (typeof user.id !== 'string' || !uuid.test(user.id)
    || typeof user.nome !== 'string' || !user.nome.trim()
    || typeof user.email !== 'string' || !user.email.trim()
    || (user.perfil !== 'COLABORADOR' && user.perfil !== 'EMPRESA')
    || (user.empresaId !== null && (typeof user.empresaId !== 'string' || !uuid.test(user.empresaId)))
    || (user.perfil === 'EMPRESA' && !user.empresaId)) throw new ApiError(502)
  return { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil, empresaId: user.empresaId as string | null }
}

export function parseLogin(value: unknown, now: number) {
  if (!value || typeof value !== 'object') throw new ApiError(502)
  const result = value as Record<string, unknown>
  if (typeof result.accessToken !== 'string' || !result.accessToken.trim() || result.tokenType !== 'Bearer'
    || typeof result.expiresIn !== 'number' || !Number.isFinite(result.expiresIn)
    || result.expiresIn <= 0 || result.expiresIn > 86400) throw new ApiError(502)
  return {
    user: parseUser(result.usuario),
    credentials: { accessToken: result.accessToken, expiresAt: now + result.expiresIn * 1000 },
  }
}
