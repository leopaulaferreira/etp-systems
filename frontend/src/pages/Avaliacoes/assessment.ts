import type { Assessment, AssessmentQuestion, AssessmentStatus } from '../../types/assessment'

export type AssessmentFilters = {
  query: string
  type: 'Todos' | Assessment['type']
  courseType: 'Todos' | Assessment['courseType']
  status: 'all' | AssessmentStatus
}
export const initialFilters: AssessmentFilters = {
  query: '',
  type: 'Todos',
  courseType: 'Todos',
  status: 'all',
}
export const statusLabels: Record<AssessmentStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  scheduled: 'Agendada',
}

export function selectAssessments(items: Assessment[], filters: AssessmentFilters) {
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim()
  const query = normalize(filters.query)
  return items.filter(
    (item) =>
      normalize(`${item.title} ${item.course}`).includes(query) &&
      (filters.type === 'Todos' || filters.type === item.type) &&
      (filters.courseType === 'Todos' || filters.courseType === item.courseType) &&
      (filters.status === 'all' || filters.status === item.status),
  )
}

export function isAnswered(question: AssessmentQuestion, answers: Record<string, number>) {
  const answer = answers[question.id]
  return Number.isInteger(answer) && answer >= 0 && answer < question.options.length
}

export function calculateScore(item: Assessment, answers: Record<string, number>) {
  const correct = item.questions.filter(
    (question) => question.correctOption !== undefined && answers[question.id] === question.correctOption,
  ).length
  return item.questions.length ? Math.round((correct / item.questions.length) * 100) : 0
}

export function latestScore(item: Assessment) {
  const latest = item.attempts.at(-1)
  return latest ? (latest.score ?? calculateScore(item, latest.answers)) : null
}

export function remainingAttempts(item: Assessment) {
  return Math.max(0, item.maxAttempts - item.attempts.length)
}

export function canStart(item: Assessment) {
  return (
    item.status !== 'scheduled' &&
    remainingAttempts(item) > 0 &&
    (item.status !== 'completed' || (latestScore(item) ?? 0) < item.minimumScore)
  )
}

export function startAssessment(item: Assessment): Assessment {
  if (!canStart(item)) return item
  return {
    ...item,
    status: 'in_progress',
    answers: item.status === 'in_progress' ? item.answers : {},
  }
}

export function answerAssessment(item: Assessment, questionId: string, option: number): Assessment {
  const question = item.questions.find((question) => question.id === questionId)
  if (item.status !== 'in_progress' || !question || !isAnswered(question, { [questionId]: option }))
    return item
  return { ...item, answers: { ...item.answers, [questionId]: option } }
}

export function submitAssessment(item: Assessment, completedAt: string): Assessment {
  if (
    item.status !== 'in_progress' ||
    !remainingAttempts(item) ||
    !item.questions.length ||
    !item.questions.every((question) => isAnswered(question, item.answers))
  )
    return item
  return {
    ...item,
    status: 'completed',
    answers: {},
    attempts: [...item.attempts, { answers: { ...item.answers }, completedAt }],
  }
}

export function assessmentSummary(items: Assessment[]) {
  const completed = items.filter((item) => item.status === 'completed')
  return {
    pending: items.filter((item) => item.status === 'pending').length,
    ongoing: items.filter((item) => item.status === 'in_progress').length,
    completed: completed.length,
    average: completed.length
      ? Math.round(
          completed.reduce((sum, item) => sum + (latestScore(item) ?? 0), 0) / completed.length,
        )
      : null,
    remaining: items.filter(canStart).reduce((sum, item) => sum + remainingAttempts(item), 0),
  }
}

export function formatAssessmentDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(value))
}
