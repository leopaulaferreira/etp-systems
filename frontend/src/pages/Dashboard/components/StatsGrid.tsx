import MetricCard, { type MetricCardData } from './MetricCard'
import { useAssessments } from '../../../assessments/AssessmentContext'
import { canStart } from '../../Avaliacoes/assessment'
import type { DashboardData } from '../dashboardApi'

export default function StatsGrid({ data }: { data: DashboardData }) {
  const { assessments, status } = useAssessments()
  const available = assessments.filter(item => item.questions.length > 0 && canStart(item) &&
    !item.attempts.some(attempt => attempt.passed || (attempt.score ?? -1) >= item.minimumScore)).length
  const metricCards: MetricCardData[] = [
    { id: 'andamento', label: 'Cursos em andamento', value: String(data.ongoingCourses), ctaLabel: 'Ver meus cursos', accent: 'blue', icon: 'andamento', to: '/meus-cursos' },
    { id: 'concluidos', label: 'Cursos concluídos', value: String(data.completedCourses), ctaLabel: 'Ver concluídos', accent: 'green', icon: 'concluidos', to: '/meus-cursos?aba=concluidos' },
    { id: 'avaliacoes', label: 'Avaliações disponíveis', value: status === 'ready' ? String(available) : '—', detail: status === 'loading' ? 'Carregando...' : status === 'error' ? 'Consulta indisponível' : undefined, ctaLabel: 'Ver avaliações', accent: 'orange', icon: 'avaliacoes', to: '/avaliacoes' },
    { id: 'certificados', label: 'Certificados', value: String(data.certificates), detail: `${Number(data.certifiedHours.toFixed(1)).toLocaleString('pt-BR')}h certificadas`, ctaLabel: 'Ver certificados', accent: 'purple', icon: 'certificados', to: '/certificados' },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metricCards.map((metric) => (
        <MetricCard key={metric.id} data={metric} />
      ))}
    </div>
  )
}
