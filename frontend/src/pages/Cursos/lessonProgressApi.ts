import { authSession } from '../../auth/session.ts'

export type LessonProgress = { completedLessonIds: string[]; totalLessons: number; progress: number }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function parseLessonProgress(value: unknown): LessonProgress {
  if (!value || typeof value !== 'object') throw new Error('Progresso das aulas inválido')
  const item = value as Record<string, unknown>
  if (!Array.isArray(item.completedLessonIds) || !item.completedLessonIds.every((id) => typeof id === 'string' && uuid.test(id)) ||
      new Set(item.completedLessonIds).size !== item.completedLessonIds.length ||
      typeof item.totalLessons !== 'number' || !Number.isSafeInteger(item.totalLessons) || item.totalLessons < item.completedLessonIds.length ||
      typeof item.progress !== 'number' || !Number.isFinite(item.progress) || item.progress < 0 || item.progress > 100) {
    throw new Error('Progresso das aulas inválido')
  }
  return { completedLessonIds: item.completedLessonIds, totalLessons: item.totalLessons, progress: item.progress }
}

export async function fetchLessonProgress(courseId: string, signal?: AbortSignal): Promise<LessonProgress> {
  if (!uuid.test(courseId)) throw new Error('Curso inválido')
  return parseLessonProgress(await authSession.request(`/api/colaborador/meus-cursos/${courseId}/aulas/progresso`, signal))
}

export async function completeLesson(courseId: string, lessonId: string, signal?: AbortSignal): Promise<LessonProgress> {
  if (!uuid.test(courseId) || !uuid.test(lessonId)) throw new Error('Aula inválida')
  return parseLessonProgress(await authSession.request(`/api/colaborador/meus-cursos/${courseId}/aulas/${lessonId}/conclusao`, signal, 'PUT'))
}
