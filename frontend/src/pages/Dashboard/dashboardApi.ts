import { authSession } from '../../auth/session.ts'

export type DashboardData = {
  enrolledCourses: number
  ongoingCourses: number
  completedCourses: number
  availableAssessments: number
  passedAssessments: number
  certificates: number
  certifiedHours: number
  continueCourse: null | {
    id: string; title: string; description: string | null; icon: string
    progress: number; lastActivity: string
  }
  recommendations: {
    id: string; title: string; category: string; level: string
    durationHours: number; icon: string
  }[]
  recentAssessments: {
    courseId: string; course: string; score: number; passed: boolean; completedAt: string
  }[]
  recentCertificates: { id: string; title: string; issuedAt: string }[]
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Dashboard inválido')
  return value as Record<string, unknown>
}
const nonnegative = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0
const count = (value: unknown) => nonnegative(value) && Number.isInteger(value)
const date = (value: unknown) => typeof value === 'string' && !Number.isNaN(Date.parse(value))

export function parseDashboard(value: unknown): DashboardData {
  const data = object(value)
  for (const key of ['enrolledCourses', 'ongoingCourses', 'completedCourses', 'availableAssessments', 'passedAssessments', 'certificates']) {
    if (!count(data[key])) throw new Error(`Indicador inválido: ${key}`)
  }
  if (!nonnegative(data.certifiedHours) ||
      Number(data.ongoingCourses) + Number(data.completedCourses) !== data.enrolledCourses ||
      !Array.isArray(data.recommendations) || !Array.isArray(data.recentAssessments) ||
      !Array.isArray(data.recentCertificates)) throw new Error('Indicadores incompletos')
  let next: DashboardData['continueCourse'] = null
  if (data.continueCourse !== null) {
    const item = object(data.continueCourse)
    if (typeof item.id !== 'string' || !uuid.test(item.id) ||
        typeof item.title !== 'string' || !item.title.trim() ||
        (item.description !== null && typeof item.description !== 'string') ||
        typeof item.icon !== 'string' || !nonnegative(item.progress) || (item.progress as number) > 100 ||
        !date(item.lastActivity)) throw new Error('Curso para continuar inválido')
    next = item as DashboardData['continueCourse']
  }
  const recommendations = data.recommendations.map((value) => {
    const item = object(value)
    if (typeof item.id !== 'string' || !uuid.test(item.id) ||
        typeof item.title !== 'string' || !item.title.trim() ||
        typeof item.category !== 'string' || typeof item.level !== 'string' ||
        typeof item.icon !== 'string' || !nonnegative(item.durationHours)) throw new Error('Recomendação inválida')
    return item as DashboardData['recommendations'][number]
  })
  const recentAssessments = data.recentAssessments.map((value) => {
    const item = object(value)
    if (typeof item.courseId !== 'string' || !uuid.test(item.courseId) ||
        typeof item.course !== 'string' || !count(item.score) || (item.score as number) > 100 ||
        typeof item.passed !== 'boolean' || !date(item.completedAt)) throw new Error('Avaliação recente inválida')
    return item as DashboardData['recentAssessments'][number]
  })
  const recentCertificates = data.recentCertificates.map((value) => {
    const item = object(value)
    if (typeof item.id !== 'string' || !uuid.test(item.id) ||
        typeof item.title !== 'string' || !date(item.issuedAt)) throw new Error('Certificado recente inválido')
    return item as DashboardData['recentCertificates'][number]
  })
  return { ...data, continueCourse: next, recommendations, recentAssessments, recentCertificates } as DashboardData
}

export async function fetchDashboard(signal?: AbortSignal): Promise<DashboardData> {
  return parseDashboard(await authSession.request('/api/colaborador/dashboard', signal))
}
