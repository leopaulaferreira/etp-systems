import { authSession } from '../../auth/session.ts'
import type { CourseItem, CourseThumbnailKey } from '../../mocks/meus-cursos.mock.ts'

type ApiCourse = {
  id: string
  title: string
  description: string | null
  icon: string
  durationHours: number
  enrolledAt: string
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const thumbnails: Record<string, CourseThumbnailKey> = {
  security: 'security', cloud: 'cloud', ai: 'ai', projects: 'projects',
  analytics: 'data', python: 'data', code: 'data', governance: 'projects',
  workspace: 'projects', communication: 'projects', leadership: 'projects',
}

export function courseThumbnail(icon: string): CourseThumbnailKey {
  return thumbnails[icon] ?? 'data'
}

export function formatCourseDuration(hours: number): string {
  const minutes = Math.round(hours * 60)
  const wholeHours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return wholeHours && remaining ? `${wholeHours}h ${remaining}m`
    : wholeHours ? `${wholeHours}h` : `${remaining}m`
}

export function parseMyCourse(value: unknown): CourseItem {
  if (!value || typeof value !== 'object') throw new Error('Dados de inscrição inválidos')
  const course = value as Record<string, unknown>
  if (typeof course.id !== 'string' || !uuid.test(course.id) ||
      typeof course.title !== 'string' || !course.title.trim() ||
      (course.description !== null && typeof course.description !== 'string') ||
      typeof course.icon !== 'string' ||
      typeof course.durationHours !== 'number' || !Number.isFinite(course.durationHours) || course.durationHours < 0 ||
      typeof course.enrolledAt !== 'string' || Number.isNaN(Date.parse(course.enrolledAt))) {
    throw new Error('Dados de inscrição incompletos')
  }
  const valid = course as ApiCourse
  return {
    id: valid.id, title: valid.title, description: valid.description ?? undefined,
    type: 'CURSO', thumbnail: courseThumbnail(valid.icon),
    duration: formatCourseDuration(valid.durationHours),
  }
}

export async function fetchMyCourses(signal?: AbortSignal): Promise<CourseItem[]> {
  const result = await authSession.request('/api/colaborador/meus-cursos', signal)
  if (!Array.isArray(result)) throw new Error('Resposta de Meus Cursos inválida')
  return result.map(parseMyCourse)
}

export async function enrollCourse(id: string): Promise<CourseItem> {
  if (!uuid.test(id)) throw new Error('Curso inválido para inscrição')
  return parseMyCourse(await authSession.request(
    `/api/colaborador/inscricoes/cursos/${encodeURIComponent(id)}`, undefined, 'POST',
  ))
}
