import { courseIcons } from '../Cursos/courseTypes.ts'
import { authSession } from '../../auth/session.ts'
import type { CourseItem, CourseThumbnailKey } from './courseTypes'

type ApiCourse = {
  id: string
  title: string
  description: string | null
  icon: string
  durationHours: number
  enrolledAt: string
  progress: number
  updatedAt: string | null
  completedAt: string | null
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const thumbnails = new Set<string>(courseIcons)

export function courseThumbnail(icon: string): CourseThumbnailKey {
  return thumbnails.has(icon) ? icon as CourseThumbnailKey : 'data'
}

export function formatCourseDuration(hours: number): string {
  const minutes = Math.round(hours * 60)
  const wholeHours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return wholeHours && remaining ? `${wholeHours}h ${remaining}m`
    : wholeHours ? `${wholeHours}h` : `${remaining}m`
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}

export function parseMyCourse(value: unknown): CourseItem {
  if (!value || typeof value !== 'object') throw new Error('Dados de inscrição inválidos')
  const course = value as Record<string, unknown>
  if (typeof course.id !== 'string' || !uuid.test(course.id) ||
      typeof course.title !== 'string' || !course.title.trim() ||
      (course.description !== null && typeof course.description !== 'string') ||
      typeof course.icon !== 'string' ||
      typeof course.durationHours !== 'number' || !Number.isFinite(course.durationHours) || course.durationHours < 0 ||
      typeof course.enrolledAt !== 'string' || Number.isNaN(Date.parse(course.enrolledAt)) ||
      typeof course.progress !== 'number' || !Number.isFinite(course.progress) || course.progress < 0 || course.progress > 100 ||
      (course.updatedAt !== null && (typeof course.updatedAt !== 'string' || Number.isNaN(Date.parse(course.updatedAt)))) ||
      (course.completedAt !== null && (typeof course.completedAt !== 'string' || Number.isNaN(Date.parse(course.completedAt))))) {
    throw new Error('Dados de inscrição incompletos')
  }
  const valid = course as ApiCourse
  return {
    id: valid.id, title: valid.title, description: valid.description ?? undefined,
    type: 'CURSO', thumbnail: courseThumbnail(valid.icon),
    duration: formatCourseDuration(valid.durationHours),
    progress: valid.progress,
    updatedAt: valid.updatedAt ? formatDate(valid.updatedAt) : undefined,
    completedAt: valid.completedAt ? formatDate(valid.completedAt) : undefined,
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

export async function updateCourseProgress(id: string, percentual: number): Promise<CourseItem> {
  if (!uuid.test(id) || !Number.isFinite(percentual) || percentual < 0 || percentual > 100) {
    throw new Error('Progresso inválido')
  }
  return parseMyCourse(await authSession.request(
    `/api/colaborador/meus-cursos/${encodeURIComponent(id)}/progresso`,
    undefined, 'PUT', { percentual },
  ))
}
