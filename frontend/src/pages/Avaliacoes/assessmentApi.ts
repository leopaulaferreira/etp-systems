import { authSession } from '../../auth/session.ts'
import type { Assessment, AssessmentQuestion, AssessmentAttempt } from '../../types/assessment.ts'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const topics = new Set(['privacy', 'security', 'cloud', 'access'])

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Resposta da API inválida')
  return value as Record<string, unknown>
}

function question(value: unknown): AssessmentQuestion {
  const item = object(value)
  if (typeof item.id !== 'string' || !uuid.test(item.id) || typeof item.prompt !== 'string' ||
      !Array.isArray(item.options) || !item.options.every((option) => typeof option === 'string') ||
      !Array.isArray(item.optionIds) || item.optionIds.length !== item.options.length ||
      !item.optionIds.every((id) => typeof id === 'string' && uuid.test(id))) {
    throw new Error('Questão inválida')
  }
  if (item.correctOption !== null && item.correctOption !== undefined &&
      (!Number.isInteger(item.correctOption) || (item.correctOption as number) < 0 ||
       (item.correctOption as number) >= item.options.length)) throw new Error('Gabarito inválido')
  return {
    id: item.id, kind: 'multiple_choice', prompt: item.prompt,
    options: item.options as string[], optionIds: item.optionIds as string[],
    correctOption: typeof item.correctOption === 'number' ? item.correctOption : undefined,
    explanation: typeof item.explanation === 'string' ? item.explanation : undefined,
  }
}

function attempt(value: unknown): AssessmentAttempt {
  const item = object(value)
  const answers = object(item.answers)
  if (typeof item.completedAt !== 'string' || Number.isNaN(Date.parse(item.completedAt)) ||
      typeof item.score !== 'number' || !Number.isInteger(item.score) || item.score < 0 || item.score > 100 ||
      typeof item.passed !== 'boolean' ||
      !Object.entries(answers).every(([id, choice]) => uuid.test(id) && Number.isInteger(choice) && (choice as number) >= 0)) {
    throw new Error('Tentativa inválida')
  }
  return { answers: answers as Record<string, number>, completedAt: item.completedAt,
    score: item.score, passed: item.passed }
}

export function parseAssessment(value: unknown): Assessment {
  const item = object(value)
  if (typeof item.id !== 'string' || !uuid.test(item.id) ||
      typeof item.courseId !== 'string' || !uuid.test(item.courseId) ||
      typeof item.title !== 'string' || typeof item.course !== 'string' ||
      (item.status !== 'pending' && item.status !== 'completed') ||
      typeof item.minimumScore !== 'number' || typeof item.maxAttempts !== 'number' ||
      typeof item.estimatedMinutes !== 'number' ||
      !Array.isArray(item.questions) || !Array.isArray(item.attempts)) {
    throw new Error('Avaliação inválida')
  }
  const questions = item.questions.map(question)
  if (!questions.length || new Set(questions.map((entry) => entry.id)).size !== questions.length) {
    throw new Error('Questões incompletas')
  }
  return {
    id: item.id, courseId: item.courseId, title: item.title, course: item.course,
    courseType: 'Curso', type: 'Teste',
    topic: typeof item.topic === 'string' && topics.has(item.topic)
      ? item.topic as Assessment['topic'] : 'security',
    status: item.status, estimatedMinutes: item.estimatedMinutes,
    minimumScore: item.minimumScore, maxAttempts: item.maxAttempts,
    questions, answers: {}, attempts: item.attempts.map(attempt),
  }
}

export async function fetchAssessments(signal?: AbortSignal): Promise<Assessment[]> {
  const result = await authSession.request('/api/colaborador/avaliacoes', signal)
  if (!Array.isArray(result)) throw new Error('Lista de avaliações inválida')
  return result.map(parseAssessment)
}

export async function sendAttempt(item: Assessment): Promise<Assessment> {
  const respostas = item.questions.map((question) => {
    const selected = item.answers[question.id]
    const alternativaId = question.optionIds?.[selected]
    if (!alternativaId) throw new Error('Responda todas as questões')
    return { questaoId: question.id, alternativaId }
  })
  return parseAssessment(await authSession.request(
    `/api/colaborador/avaliacoes/${encodeURIComponent(item.id)}/tentativas`,
    undefined, 'POST', { respostas },
  ))
}

export type Lesson = { id: string; title: string; content: string; videoUrl: string | null; order: number }

export function parseLesson(value: unknown): Lesson {
  const item = object(value)
  if (typeof item.id !== 'string' || !uuid.test(item.id) || typeof item.title !== 'string' ||
      typeof item.content !== 'string' ||
      (item.videoUrl !== null && typeof item.videoUrl !== 'string') ||
      typeof item.order !== 'number') throw new Error('Aula inválida')
  return { id: item.id, title: item.title, content: item.content,
    videoUrl: item.videoUrl, order: item.order }
}

export async function fetchLessons(courseId: string, signal?: AbortSignal): Promise<Lesson[]> {
  if (!uuid.test(courseId)) throw new Error('Curso inválido')
  const result = await authSession.request(
    `/api/colaborador/cursos/${encodeURIComponent(courseId)}/aulas`, signal,
  )
  if (!Array.isArray(result)) throw new Error('Aulas inválidas')
  return result.map(parseLesson)
}
