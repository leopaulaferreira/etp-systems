import { authSession } from '../../auth/session.ts'

export type LearningPath = {
  id: string
  title: string
  description: string
  category: string
  level: 'Iniciante' | 'Intermediário' | 'Avançado'
  icon: 'cloud' | 'users' | 'data' | 'shield'
  featured: boolean
  courseCount: number
  durationHours: number
  enrolled: boolean
  progress: number
  courses: { id: string; title: string }[]
}

const levels = new Set(['Iniciante', 'Intermediário', 'Avançado'])
const icons = new Set(['cloud', 'users', 'data', 'shield'])
function parseTrail(value: unknown): LearningPath {
  if (!value || typeof value !== 'object') throw new Error('Trilha inválida')
  const trail = value as Record<string, unknown>
  if (typeof trail.id !== 'string' || typeof trail.title !== 'string' ||
      typeof trail.description !== 'string' || typeof trail.category !== 'string' ||
      typeof trail.level !== 'string' || !levels.has(trail.level) ||
      typeof trail.icon !== 'string' || !icons.has(trail.icon) ||
      typeof trail.featured !== 'boolean' || typeof trail.enrolled !== 'boolean' ||
      typeof trail.courseCount !== 'number' || typeof trail.durationHours !== 'number' ||
      typeof trail.progress !== 'number' || !Array.isArray(trail.courses) ||
      !trail.courses.every((course) => course && typeof course.id === 'string' && typeof course.title === 'string')) {
    throw new Error('Dados de trilha incompletos')
  }
  return trail as LearningPath
}

export async function fetchTrails(signal?: AbortSignal): Promise<LearningPath[]> {
  const result = await authSession.request('/api/colaborador/trilhas', signal)
  if (!Array.isArray(result)) throw new Error('Resposta de trilhas inválida')
  return result.map(parseTrail)
}

export async function enrollTrail(id: string): Promise<LearningPath> {
  return parseTrail(await authSession.request(`/api/colaborador/trilhas/${encodeURIComponent(id)}/inscricao`, undefined, 'POST'))
}
