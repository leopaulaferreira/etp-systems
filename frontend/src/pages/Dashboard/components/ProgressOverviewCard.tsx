import IllustratedIcon, { type IconTone } from '../../../components/ui/IllustratedIcon'
import { BookOpen, BookCheck, ClipboardCheck, Award, ArrowRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DashboardData } from '../dashboardApi'

type ProgressItem = { id: string; label: string; current: number; total: number; icon: 'andamento' | 'concluidos' | 'avaliacoes' | 'certificados' }
const accentConfig: Record<ProgressItem['icon'], { icon: LucideIcon; tone: IconTone; barClass: string }> = {
  andamento: { icon: BookOpen, tone: 'blue', barClass: 'from-blue-600 to-cyan-400' },
  concluidos: { icon: BookCheck, tone: 'emerald', barClass: 'from-emerald-500 to-teal-400' },
  avaliacoes: { icon: ClipboardCheck, tone: 'orange', barClass: 'from-orange-500 to-amber-400' },
  certificados: { icon: Award, tone: 'violet', barClass: 'from-violet-600 to-fuchsia-400' },
}

export default function ProgressOverviewCard({ data }: { data: DashboardData }) {
  const progressOverview: ProgressItem[] = [
    { id: 'andamento', label: 'Cursos em andamento', current: data.ongoingCourses, total: data.enrolledCourses, icon: 'andamento' },
    { id: 'concluidos', label: 'Cursos concluídos', current: data.completedCourses, total: data.enrolledCourses, icon: 'concluidos' },
    { id: 'avaliacoes', label: 'Avaliações aprovadas', current: data.passedAssessments, total: data.availableAssessments, icon: 'avaliacoes' },
    { id: 'certificados', label: 'Certificados emitidos', current: data.certificates, total: data.enrolledCourses, icon: 'certificados' },
  ]
  return (
    <section className="flex h-full flex-col gap-4 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[18px] font-extrabold tracking-[-0.015em] text-ink-900">Meu progresso</h2>
        <Link
          to="/meus-cursos"
          className="group flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-bold text-brand-blue-400 transition-colors duration-150 hover:bg-brand-blue-500/10 hover:text-brand-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30"
        >
          Ver meus cursos
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} aria-hidden="true" />
        </Link>
      </div>

      <ul className="flex flex-col divide-y divide-ink-100">
        {progressOverview.map((item) => {
          const { icon: Icon, tone, barClass } = accentConfig[item.icon]
          const percent = item.total > 0 ? Math.min(100, Math.round((item.current / item.total) * 100)) : 0
          return (
            <li
              key={item.id}
              className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors duration-150 first:pt-0 last:pb-0 hover:bg-ink-100/60"
            >
              <IllustratedIcon icon={Icon} tone={tone} size="compact" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-bold text-ink-700">{item.label}</span>
                  <span className="text-[12px] font-extrabold text-ink-900">{item.current}/{item.total}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100 shadow-inner">
                  <div className={`h-full rounded-full bg-gradient-to-r ${barClass}`} style={{ width: `${percent}%` }} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
