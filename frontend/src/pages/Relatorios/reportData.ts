import type { CourseItem } from '../MeusCursos/courseTypes'
import type { Certificate } from '../../types/certificate'
import type { LearningPath } from '../Trilhas/trailApi'
import type { Assessment } from '../../types/assessment'

export type ReportPeriod = 'all' | 'year'
export type ReportData = {
  enrolled: number
  completed: number
  totalCompleted: number
  ongoing: number
  notStarted: number
  certificates: number
  certifiedHours: number
  completedTrails: number
  attempts: number
  passedAssessments: number
  months: { month: number; label: string; certificates: number; courses: number; assessments: number }[]
  courses: CourseItem[]
  recentAttempts: { id: string; course: string; score: number; passed: boolean; completedAt: string }[]
  trails: LearningPath[]
}

function yearOf(value?: string): number | null {
  if (!value) return null
  const brazilian = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  const date = brazilian ? new Date(Number(brazilian[3]), Number(brazilian[2]) - 1, Number(brazilian[1])) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.getFullYear()
}

export function buildReport(courses: CourseItem[], certificates: Certificate[], trails: LearningPath[], assessments: Assessment[], period: ReportPeriod, year: number): ReportData {
  const inPeriod = (date?: string) => period === 'all' || yearOf(date) === year
  const completed = courses.filter((course) => course.progress === 100 && inPeriod(course.completedAt))
  const issued = certificates.filter((certificate) => certificate.status === 'completed' && inPeriod(certificate.issuedAt))
  const attempts = assessments.flatMap((assessment) => assessment.attempts.map((attempt, index) => ({
    id: `${assessment.id}-${index}`, course: assessment.course,
    score: attempt.score ?? 0, passed: attempt.passed ?? false, completedAt: attempt.completedAt,
  }))).filter((attempt) => inPeriod(attempt.completedAt))
    .sort((first, second) => second.completedAt.localeCompare(first.completedAt))
  const months = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    label: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(year, index, 1)).replace('.', ''),
    certificates: issued.filter((item) => new Date(item.issuedAt!).getFullYear() === year && new Date(item.issuedAt!).getMonth() === index).length,
    assessments: attempts.filter((item) => new Date(item.completedAt).getFullYear() === year && new Date(item.completedAt).getMonth() === index).length,
    courses: completed.filter((item) => {
      const match = item.completedAt && /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(item.completedAt)
      return match && Number(match[3]) === year && Number(match[2]) === index + 1
    }).length,
  }))
  return {
    enrolled: courses.length,
    completed: completed.length,
    totalCompleted: courses.filter((course) => course.progress === 100).length,
    ongoing: courses.filter((course) => (course.progress ?? 0) > 0 && course.progress !== 100).length,
    notStarted: courses.filter((course) => !course.progress).length,
    certificates: issued.length,
    certifiedHours: Number(issued.reduce((sum, item) => sum + item.hours, 0).toFixed(1)),
    completedTrails: trails.filter((trail) => trail.enrolled && trail.progress === 100).length,
    attempts: attempts.length,
    passedAssessments: attempts.filter((attempt) => attempt.passed).length,
    months,
    courses: [...courses].sort((first, second) => (second.progress ?? 0) - (first.progress ?? 0) || first.title.localeCompare(second.title, 'pt-BR')),
    recentAttempts: attempts.slice(0, 5),
    trails: trails.filter((trail) => trail.enrolled),
  }
}

export function reportCsv(data: ReportData, year: number): string {
  const rows: (string | number)[][] = [
    ['Indicador', 'Valor'],
    ['Cursos inscritos', data.enrolled],
    ['Cursos concluídos', data.completed],
    ['Cursos em andamento', data.ongoing],
    ['Certificados emitidos', data.certificates],
    ['Avaliações realizadas', data.attempts],
    ['Avaliações aprovadas', data.passedAssessments],
    ['Horas certificadas', data.certifiedHours],
    ['Trilhas concluídas', data.completedTrails],
    [],
    [`Mês de ${year}`, 'Cursos concluídos', 'Certificados emitidos', 'Avaliações realizadas'],
    ...data.months.map((month) => [month.label, month.courses, month.certificates, month.assessments]),
  ]
  return '\uFEFF' + rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';')).join('\r\n')
}
