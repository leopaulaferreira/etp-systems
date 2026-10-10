import type { CourseItem } from '../MeusCursos/courseTypes'
import type { Certificate } from '../../types/certificate'
import type { LearningPath } from '../Trilhas/trailApi'

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
  months: { month: number; label: string; certificates: number; courses: number }[]
  recentCourses: CourseItem[]
  trails: LearningPath[]
}

function yearOf(value?: string): number | null {
  if (!value) return null
  const brazilian = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  const date = brazilian ? new Date(Number(brazilian[3]), Number(brazilian[2]) - 1, Number(brazilian[1])) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.getFullYear()
}

export function buildReport(courses: CourseItem[], certificates: Certificate[], trails: LearningPath[], period: ReportPeriod, year: number): ReportData {
  const inPeriod = (date?: string) => period === 'all' || yearOf(date) === year
  const completed = courses.filter((course) => course.progress === 100 && inPeriod(course.completedAt))
  const issued = certificates.filter((certificate) => certificate.status === 'completed' && inPeriod(certificate.issuedAt))
  const months = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    label: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(year, index, 1)).replace('.', ''),
    certificates: issued.filter((item) => new Date(item.issuedAt!).getFullYear() === year && new Date(item.issuedAt!).getMonth() === index).length,
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
    months,
    recentCourses: completed.slice(0, 5),
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
    ['Horas certificadas', data.certifiedHours],
    ['Trilhas concluídas', data.completedTrails],
    [],
    [`Mês de ${year}`, 'Cursos concluídos', 'Certificados emitidos'],
    ...data.months.map((month) => [month.label, month.courses, month.certificates]),
  ]
  return '\uFEFF' + rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';')).join('\r\n')
}
