import IllustratedIcon from '../../../components/ui/IllustratedIcon'
import { ArrowRight, ClipboardCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DashboardData } from '../dashboardApi'

export default function RecentAssessmentsCard({ items }: { items: DashboardData['recentAssessments'] }) {
  return (
    <section className="flex h-full flex-col gap-4 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-extrabold tracking-[-0.015em] text-ink-900">Avaliações recentes</h2>
        <Link to="/avaliacoes" className="group flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-bold text-brand-blue-400 transition-colors hover:bg-brand-blue-500/10 hover:text-brand-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30">
          Ver todas <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} aria-hidden="true" />
        </Link>
      </div>
      <ul className="flex flex-col divide-y divide-ink-100">
        {items.length === 0 && <li className="py-4 text-sm text-ink-500">Suas avaliações concluídas aparecerão aqui.</li>}
        {items.map((item, index) => (
          <li key={`${item.courseId}-${item.completedAt}-${index}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3.5 transition-colors hover:bg-ink-100/60">
            <IllustratedIcon icon={ClipboardCheck} tone="blue" size="compact" />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="line-clamp-2 text-[14px] font-bold text-ink-900">{item.course}</span>
              <span className="text-[11px] font-medium text-ink-500">{new Date(item.completedAt).toLocaleDateString('pt-BR')} · Nota {item.score}%</span>
            </span>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${item.passed ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
              {item.passed ? 'Aprovado' : 'Não aprovado'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
