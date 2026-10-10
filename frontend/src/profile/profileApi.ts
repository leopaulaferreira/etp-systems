import { authSession } from '../auth/session.ts'

export type CurrentUser = {
  name: string
  role: string
  notificationCount: number
  email: string
  location: string
  memberSince: string
  birthDate: string
  phone: string
  position: string
  company: string
  learningFocus: string
  experienceLevel: string
  notificationsEnabled: boolean
  language: string
}

export type EditableProfile = Pick<CurrentUser, 'name' | 'phone' | 'location' | 'position' | 'learningFocus' | 'experienceLevel' | 'notificationsEnabled'>

export function parseProfile(value: unknown): CurrentUser {
  if (!value || typeof value !== 'object') throw new Error('Perfil inválido')
  const p = value as Record<string, unknown>
  for (const key of ['name', 'email', 'phone', 'location', 'position', 'company', 'learningFocus', 'experienceLevel']) {
    if (typeof p[key] !== 'string') throw new Error('Dados do perfil incompletos')
  }
  if (typeof p.notificationsEnabled !== 'boolean' || (p.memberSince !== null && typeof p.memberSince !== 'string')) throw new Error('Dados do perfil incompletos')
  return {
    name: p.name as string, email: p.email as string, phone: p.phone as string,
    location: p.location as string, position: p.position as string, company: p.company as string,
    learningFocus: p.learningFocus as string, experienceLevel: p.experienceLevel as string,
    notificationsEnabled: p.notificationsEnabled, memberSince: (p.memberSince as string | null) ?? '',
    role: 'Colaborador', notificationCount: 0, birthDate: '', language: 'Português (Brasil)',
  }
}

export async function fetchProfile(signal?: AbortSignal): Promise<CurrentUser> {
  return parseProfile(await authSession.request('/api/colaborador/perfil', signal))
}

export async function saveProfile(profile: EditableProfile): Promise<CurrentUser> {
  return parseProfile(await authSession.request('/api/colaborador/perfil', undefined, 'PUT', profile))
}
