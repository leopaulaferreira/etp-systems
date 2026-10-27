import type { Assessment } from '../../types/assessment.ts'
import type { CourseItem } from '../MeusCursos/courseTypes.ts'
import { canStart, remainingAttempts } from '../Avaliacoes/assessment.ts'

export type ProfileNextStep = {
  kind: 'assessment' | 'course' | 'catalog'
  title: string
  description: string
  label: string
  to: string
  detail: string
  progress?: number
}

/** Sugere apenas ações disponíveis, mantendo a ordem recebida em caso de empate. */
export function profileNextStep(courses: CourseItem[], assessments: Assessment[]): ProfileNextStep {
  for (const course of courses) {
    if (course.progress !== 100) continue
    const assessment = assessments.find(item => item.courseId === course.id && item.questions.length > 0 && canStart(item) &&
      !item.attempts.some(attempt => attempt.passed || (attempt.score ?? -1) >= item.minimumScore))
    if (!assessment) continue
    const remaining = remainingAttempts(assessment)
    return {
      kind: 'assessment', title: course.title,
      description: 'Você concluiu o curso e pode realizar a avaliação.',
      label: assessment.status === 'in_progress' ? 'Retomar avaliação' : 'Ver avaliação',
      to: `/avaliacoes?curso=${encodeURIComponent(course.id)}`,
      detail: `${remaining} ${remaining === 1 ? 'tentativa restante' : 'tentativas restantes'}`,
    }
  }

  const course = courses.filter(item => (item.progress ?? 0) < 100 && (item.lessonCount ?? 0) > 0)
    .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))[0]
  if (course) return {
    kind: 'course', title: course.title,
    description: 'Continue de onde parou e avance na sua aprendizagem.',
    label: (course.progress ?? 0) > 0 ? 'Continuar estudando' : 'Começar curso',
    to: `/cursos/${encodeURIComponent(course.id)}/estudar`,
    detail: `${(course.progress ?? 0).toLocaleString('pt-BR')}% concluído`,
    progress: course.progress ?? 0,
  }

  return {
    kind: 'catalog', title: 'Encontre seu próximo curso',
    description: 'Explore o catálogo e escolha um conteúdo para continuar aprendendo.',
    label: 'Explorar cursos', to: '/cursos', detail: 'Uma nova oportunidade de aprender',
  }
}
