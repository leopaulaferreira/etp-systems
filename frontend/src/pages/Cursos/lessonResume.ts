// Guardado por conta e curso; não altera a conclusão das aulas.
const prefix = 'etp-last-lesson-v1:'
export function savedLesson(userId: string, courseId: string, storage: Pick<Storage, 'getItem'>): string | null {
  try { return storage.getItem(`${prefix}${userId}:${courseId}`) } catch { return null }
}
export function rememberLesson(userId: string, courseId: string, lessonId: string, storage: Pick<Storage, 'setItem'>) {
  try { storage.setItem(`${prefix}${userId}:${courseId}`, lessonId) } catch { /* Estudar continua disponível sem armazenamento. */ }
}
export function resumeLessonIndex(requested: string | null, lessonIds: string[], savedId: string | null): number {
  const index = Number(requested)
  if (requested !== null && Number.isSafeInteger(index) && index > 0) return Math.min(index - 1, Math.max(0, lessonIds.length - 1))
  return Math.max(0, lessonIds.indexOf(savedId ?? ''))
}
