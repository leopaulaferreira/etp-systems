import MetricCard, { type MetricCardData } from './MetricCard'
import type { DashboardData } from '../dashboardApi'

export default function StatsGrid({ data }: { data: DashboardData }) {
  const metricCards: MetricCardData[] = [
    { id: 'andamento', label: 'Cursos em andamento', value: String(data.ongoingCourses), ctaLabel: 'Ver meus cursos', accent: 'blue', icon: 'andamento', to: '/meus-cursos' },
    { id: 'concluidos', label: 'Cursos concluídos', value: String(data.completedCourses), ctaLabel: 'Ver concluídos', accent: 'green', icon: 'concluidos', to: '/meus-cursos?aba=concluidos' },
    { id: 'certificados', label: 'Certificados', value: String(data.certificates), ctaLabel: 'Ver certificados', accent: 'purple', icon: 'certificados', to: '/certificados' },
    { id: 'horas', label: 'Horas certificadas', value: `${Number(data.certifiedHours.toFixed(1)).toLocaleString('pt-BR')}h`, ctaLabel: 'Ver certificados', accent: 'orange', icon: 'horas', to: '/certificados' },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
      {metricCards.map((metric) => (
        <MetricCard key={metric.id} data={metric} />
      ))}
    </div>
  )
}
