import type { CatalogCourse, CourseIcon, CourseLevel } from '../../mocks/cursos.mock'
import { authSession } from '../../auth/session.ts'

const icons = new Set<CourseIcon>([
  'cloud', 'python', 'communication', 'ai', 'security', 'governance',
  'workspace', 'analytics', 'code', 'leadership', 'projects',
])
const levels = new Set<CourseLevel>(['Iniciante', 'Intermediário', 'Avançado'])

export function parseCourse(value: unknown): CatalogCourse {
  if (!value || typeof value !== 'object') throw new Error('Dados de curso inválidos')
  const course = value as Record<string, unknown>
  if (typeof course.id !== 'string' || !course.id ||
      typeof course.title !== 'string' || !course.title ||
      typeof course.description !== 'string' ||
      typeof course.category !== 'string' || !course.category ||
      typeof course.level !== 'string' || !levels.has(course.level as CourseLevel) ||
      typeof course.durationHours !== 'number' || !Number.isFinite(course.durationHours) || course.durationHours < 0 ||
      typeof course.featured !== 'boolean') {
    throw new Error('Dados de curso incompletos')
  }
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    level: course.level as CourseLevel,
    durationHours: course.durationHours,
    icon: typeof course.icon === 'string' && icons.has(course.icon as CourseIcon)
      ? course.icon as CourseIcon : 'code',
    featured: course.featured,
  }
}

export async function fetchCourses(signal?: AbortSignal): Promise<CatalogCourse[]> {
  const result = await authSession.request('/api/cursos', signal)
  if (!Array.isArray(result)) throw new Error('Resposta do catálogo inválida')
  return result.map(parseCourse)
}

export async function fetchCourseDetails(id: string, signal?: AbortSignal): Promise<CatalogCourse> {
  const course = parseCourse(await authSession.request(`/api/cursos/${encodeURIComponent(id)}`, signal))
  if (course.id !== id) throw new Error('O curso recebido não corresponde ao solicitado')
  return course
}
