import LearningIcon from '../../../components/ui/LearningIcon'
import {
  ArrowRight,
  Clock3,
  SignalLow,
  SignalMedium,
  SignalHigh,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DashboardData } from '../dashboardApi'

const levelIcons: Record<string, LucideIcon> = { Iniciante: SignalLow, Intermediário: SignalMedium, Avançado: SignalHigh }

export default function RecommendationsCard({ items }: { items: DashboardData['recommendations'] }) {
  return (
    <section className="flex flex-col gap-4 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-extrabold tracking-[-0.015em] text-ink-900">Explore o catálogo</h2>
        <Link
          to="/cursos"
          className="group flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-bold text-brand-blue-400 transition-colors duration-150 hover:bg-brand-blue-500/10 hover:text-brand-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30"
        >
          Ver todas
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} aria-hidden="true" />
        </Link>
      </div>

      <ul className="flex flex-col divide-y divide-ink-100">
        {items.length === 0 && <li className="py-4 text-sm text-ink-500">Você já está inscrito nos cursos disponíveis.</li>}
        {items.map((item) => {
          const LevelIcon = levelIcons[item.level] ?? SignalLow
          return (
            <li key={item.id} className="first:[&>a]:pt-0 last:[&>a]:pb-0">
              <Link
                to={`/cursos?busca=${encodeURIComponent(item.title)}`}
                className="group -mx-2 flex w-full items-center gap-3 rounded-xl px-2 py-3.5 text-left transition-[background-color,transform] duration-150 hover:translate-x-0.5 hover:bg-ink-100/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-brand-blue-400 motion-reduce:transform-none"
              >
                <LearningIcon kind={item.icon} />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="line-clamp-2 text-[14px] font-bold leading-snug text-ink-900">{item.title}</span>
                  <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-semibold text-ink-500">
                    <span className="rounded-md border border-blue-400/20 bg-blue-400/10 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-blue-400">
                      CURSO
                    </span>
                    <span className="flex items-center gap-1">
                      <LevelIcon className="h-3.5 w-3.5 text-ink-400" strokeWidth={2} aria-hidden="true" />
                      {item.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5 text-ink-400" strokeWidth={2} aria-hidden="true" />
                      {Number(item.durationHours.toFixed(1)).toLocaleString('pt-BR')}h
                    </span>
                  </span>
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-200/80 bg-panel-alt text-ink-400 transition-[transform,background-color,border-color,color] duration-200 group-hover:translate-x-0.5 group-hover:border-brand-blue-500/40 group-hover:bg-brand-blue-500/10 group-hover:text-brand-blue-400">
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
