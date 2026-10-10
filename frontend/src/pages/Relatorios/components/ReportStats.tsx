import { Award, BookCheck, BookOpen, CheckCheck, Clock3, Route, type LucideIcon } from 'lucide-react'
import IllustratedIcon, { type IconTone } from '../../../components/ui/IllustratedIcon'
import type { ReportData } from '../reportData'

const items: { key: keyof Pick<ReportData, 'enrolled' | 'attempts' | 'completed' | 'certificates' | 'certifiedHours' | 'completedTrails'>; label: string; suffix: string; icon: LucideIcon; tone: IconTone; graph: string }[] = [
  { key: 'enrolled', label: 'Cursos inscritos', suffix: '', icon: BookOpen, tone: 'blue', graph: 'text-brand-blue-400' },
  { key: 'attempts', label: 'Avaliações realizadas', suffix: '', icon: CheckCheck, tone: 'emerald', graph: 'text-emerald-300' },
  { key: 'completed', label: 'Cursos concluídos', suffix: '', icon: BookCheck, tone: 'emerald', graph: 'text-emerald-300' },
  { key: 'certificates', label: 'Certificados emitidos', suffix: '', icon: Award, tone: 'violet', graph: 'text-violet-300' },
  { key: 'certifiedHours', label: 'Horas certificadas', suffix: 'h', icon: Clock3, tone: 'orange', graph: 'text-orange-300' },
  { key: 'completedTrails', label: 'Trilhas concluídas', suffix: '', icon: Route, tone: 'blue', graph: 'text-brand-blue-400' },
]

export default function ReportStats({ data }: { data: ReportData }) {
  return <section aria-label="Indicadores do período" className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
    {items.map(({ key, label, suffix, icon: Icon, tone, graph }) => {
      const series = data.months.map((month) => key === 'attempts' ? month.assessments : key === 'completed' ? month.courses : key === 'certificates' ? month.certificates : 0)
      const max = Math.max(1, ...series)
      const hasMonthlyActivity = series.some((value) => value > 0)
      return <div key={key} className="group relative min-w-0 overflow-hidden rounded-[22px] border border-ink-200/70 bg-gradient-to-br from-panel-alt/70 to-panel p-4 shadow-card transition-colors hover:border-brand-blue-400/30 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><IllustratedIcon icon={Icon} tone={tone} size="compact" /><span className="text-[9px] font-semibold uppercase tracking-wider text-ink-500">{key === 'enrolled' || key === 'completedTrails' ? 'Total' : 'No período'}</span></div>
        <p className="min-h-8 text-[11px] font-semibold leading-4 text-ink-500">{label}</p>
        <div className="mt-2 flex items-end justify-between gap-1"><strong className="text-[32px] font-extrabold leading-none tracking-[-0.05em] text-ink-900">{data[key]}<span className="ml-0.5 text-lg text-ink-500">{suffix}</span></strong>
          {hasMonthlyActivity && <span aria-hidden="true" className={`hidden h-9 items-end gap-0.5 sm:flex ${graph}`}>{series.map((value, index) => <span key={index} className="w-0.5 rounded-t-sm bg-current opacity-60" style={{ height: `${Math.max(4, value / max * 100)}%` }} />)}</span>}
        </div>
        <p className="mt-4 border-t border-ink-200/50 pt-3 text-[10px] leading-4 text-ink-500">{key === 'enrolled' ? `${data.notStarted} ainda não iniciados` : key === 'attempts' ? `${data.passedAssessments} aprovadas` : key === 'certificates' ? `${data.certifiedHours}h certificadas` : key === 'completedTrails' ? `${data.trails.length} trilhas inscritas` : key === 'completed' ? `${data.totalCompleted} no total` : 'Carga horária certificada'}</p>
      </div>
    })}
  </section>
}
