import { authSession } from '../../auth/session.ts'
import { fetchCourses } from '../Cursos/courseApi.ts'
import { fetchMyCourses } from '../MeusCursos/myCoursesApi.ts'
import { fetchAssessments } from '../Avaliacoes/assessmentApi.ts'
import type { Certificate } from '../../types/certificate.ts'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function parseCertificate(value: unknown): Certificate {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Certificado inválido')
  const item = value as Record<string, unknown>
  if (typeof item.id !== 'string' || !uuid.test(item.id) ||
      typeof item.courseId !== 'string' || !uuid.test(item.courseId) ||
      typeof item.holderName !== 'string' || !item.holderName.trim() ||
      typeof item.title !== 'string' || !item.title.trim() ||
      (item.description !== null && typeof item.description !== 'string') ||
      typeof item.durationHours !== 'number' || !Number.isFinite(item.durationHours) || item.durationHours < 0 ||
      typeof item.code !== 'string' || !item.code.trim() || item.code.length > 100 ||
      typeof item.issuedAt !== 'string' || Number.isNaN(Date.parse(item.issuedAt))) {
    throw new Error('Dados do certificado incompletos')
  }
  return {
    id: item.id, courseId: item.courseId, holderName: item.holderName, title: item.title,
    description: (item.description as string | null) ?? '',
    hours: item.durationHours, accent: 'blue', status: 'completed', progress: 100,
    issuedAt: item.issuedAt, code: item.code,
  }
}

export async function fetchCertificates(signal?: AbortSignal): Promise<Certificate[]> {
  const result = await authSession.request('/api/colaborador/certificados', signal)
  if (!Array.isArray(result)) throw new Error('Lista de certificados inválida')
  return result.map(parseCertificate)
}

export async function fetchCertificatePage(signal?: AbortSignal): Promise<Certificate[]> {
  const [issued, enrolled, assessments, catalog] = await Promise.all([
    fetchCertificates(signal), fetchMyCourses(signal), fetchAssessments(signal), fetchCourses(signal),
  ])
  const issuedCourses = new Set(issued.map((item) => item.courseId))
  const assessmentsByCourse = new Map(assessments.map((item) => [item.courseId, item]))
  const catalogById = new Map(catalog.map((item) => [item.id, item]))
  const pending: Certificate[] = enrolled
    .filter((item) => assessmentsByCourse.has(item.id) && !issuedCourses.has(item.id))
    .map((item) => {
      const course = catalogById.get(item.id)
      return {
        id: item.id, courseId: item.id, title: item.title, description: course?.description ?? item.description ?? '',
        hours: course?.durationHours ?? 0, accent: 'blue', status: 'in_progress',
        progress: item.progress ?? 0,
        awaitingRelease: assessmentsByCourse.get(item.id)?.attempts.some((attempt) => attempt.passed) ?? false,
      }
    })
  return [...issued, ...pending]
}
