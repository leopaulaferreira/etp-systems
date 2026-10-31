import type { Assessment } from '../../types/assessment.ts'
import type { Certificate } from '../../types/certificate.ts'
import type { CourseItem } from '../MeusCursos/courseTypes.ts'

export type LearningEvent = {
  id: string
  kind: 'enrollment' | 'completion' | 'assessment' | 'certificate'
  title: string
  course: string
  date: string
  to: string
  detail: string
}

/** Usa apenas datas registradas, sem deduzir conclusões pelo progresso atual. */
export function profileTimeline(courses: CourseItem[], assessments: Assessment[], certificates: Certificate[]): LearningEvent[] {
  const events: LearningEvent[] = []
  for (const course of courses) {
    if (course.enrolledAt) events.push({ id: `enrollment-${course.id}`, kind: 'enrollment',
      title: 'Inscrição realizada', course: course.title, date: course.enrolledAt,
      to: `/cursos/${encodeURIComponent(course.id)}`, detail: 'Uma nova etapa de aprendizagem' })
    if (course.completedAtIso) events.push({ id: `completion-${course.id}`, kind: 'completion',
      title: 'Curso concluído', course: course.title, date: course.completedAtIso,
      to: '/meus-cursos?aba=concluidos', detail: 'Conclusão registrada no curso' })
  }
  for (const assessment of assessments) {
    assessment.attempts.forEach((attempt, index) => events.push({
      id: `assessment-${assessment.id}-${index}`, kind: 'assessment', title: 'Avaliação realizada',
      course: assessment.course, date: attempt.completedAt,
      to: assessment.courseId ? `/avaliacoes?curso=${encodeURIComponent(assessment.courseId)}` : '/avaliacoes',
      detail: `Tentativa ${index + 1}${attempt.score === undefined ? '' : ` · Nota ${attempt.score}%`}${attempt.passed === undefined ? '' : attempt.passed ? ' · Aprovado' : ' · Nota mínima não atingida'}`,
    }))
  }
  for (const certificate of certificates) {
    if (certificate.status === 'completed') events.push({ id: `certificate-${certificate.id}`, kind: 'certificate',
      title: 'Certificado emitido', course: certificate.title, date: certificate.issuedAt,
      to: '/certificados', detail: `${certificate.hours.toLocaleString('pt-BR')}h certificadas` })
  }
  const priority = { certificate: 0, assessment: 1, completion: 2, enrollment: 3 }
  return events.filter(event => Number.isFinite(Date.parse(event.date)))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || priority[a.kind] - priority[b.kind] || a.id.localeCompare(b.id))
}
