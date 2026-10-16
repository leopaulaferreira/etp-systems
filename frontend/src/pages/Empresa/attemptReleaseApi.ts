import { authSession } from '../../auth/session.ts'

export type AttemptRelease = {
  usedAttempts: number; maxAttempts: number; remainingAttempts: number; passed: boolean; canGrant: boolean
  grants: { id: string; authorizedBy: string; reason: string; afterAttempt: number; createdAt: string }[]
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export function parseAttemptRelease(value: unknown): AttemptRelease {
  if (!value || typeof value !== 'object') throw new Error('Tentativas inválidas')
  const v = value as Record<string, unknown>
  if (!['usedAttempts', 'maxAttempts', 'remainingAttempts'].every(k => typeof v[k] === 'number' && Number.isSafeInteger(v[k]) && (v[k] as number) >= 0) ||
      typeof v.passed !== 'boolean' || typeof v.canGrant !== 'boolean' || !Array.isArray(v.grants)) throw new Error('Tentativas inválidas')
  for (const g of v.grants) {
    if (!g || typeof g !== 'object' || typeof g.id !== 'string' || !uuid.test(g.id) ||
        typeof g.authorizedBy !== 'string' || typeof g.reason !== 'string' || !Number.isSafeInteger(g.afterAttempt) ||
        typeof g.createdAt !== 'string' || Number.isNaN(Date.parse(g.createdAt))) throw new Error('Histórico inválido')
  }
  return v as AttemptRelease
}
export async function fetchAttemptRelease(employeeId: string, courseId: string, signal?: AbortSignal): Promise<AttemptRelease> {
  return parseAttemptRelease(await authSession.request(path(employeeId, courseId), signal))
}
export async function grantAttempt(employeeId: string, courseId: string, reason: string): Promise<AttemptRelease> {
  if (!reason.trim() || reason.trim().length > 500) throw new Error('Informe um motivo de até 500 caracteres')
  return parseAttemptRelease(await authSession.request(path(employeeId, courseId), undefined, 'POST', { reason: reason.trim() }))
}
function path(employeeId: string, courseId: string) {
  if (!uuid.test(employeeId) || !uuid.test(courseId)) throw new Error('Colaborador ou curso inválido')
  return `/api/empresa/colaboradores/${employeeId}/cursos/${courseId}/tentativas`
}
