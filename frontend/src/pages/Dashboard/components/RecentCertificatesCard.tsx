import { Award, ArrowUpRight, ArrowRight } from 'lucide-react'
import { recentCertificates } from '../../../mocks/dashboard.mock'
import { Link } from 'react-router-dom'

export default function RecentCertificatesCard() {
  return (
    <section className="flex h-full flex-col gap-4 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-extrabold tracking-[-0.015em] text-ink-900">Certificados recentes</h2>
        <Link
          to="/certificados"
          className="group flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-bold text-brand-blue-400 transition-colors duration-150 hover:bg-brand-blue-500/10 hover:text-brand-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30"
        >
          Ver todos
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} aria-hidden="true" />
        </Link>
      </div>

      <ul className="flex flex-col divide-y divide-ink-100">
        {recentCertificates.map((certificate) => (
          <li
            key={certificate.id}
            className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3.5 transition-colors duration-150 first:pt-0 last:pb-0 hover:bg-ink-100/60"
          >
            <span
              aria-hidden="true"
              className="relative flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-blue-500/20 bg-gradient-to-br from-brand-blue-500/15 via-panel-alt to-brand-cyan-500/10 text-brand-blue-400 shadow-sm"
            >
              <span className="absolute inset-x-2 top-2 h-px bg-brand-blue-500/20" />
              <span className="absolute inset-x-3 top-3.5 h-px bg-brand-blue-500/10" />
              <Award className="relative mt-2 h-5 w-5" strokeWidth={1.9} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[14px] font-bold text-ink-900">{certificate.title}</span>
              <span className="text-[11px] font-medium text-ink-500">Concluído em {certificate.completedAt}</span>
            </span>
            <Link
              to="/certificados"
              aria-label={`Ver certificados: ${certificate.title}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-200/80 bg-panel-alt text-ink-400 transition-[transform,background-color,border-color,color] duration-150 hover:-translate-y-0.5 hover:border-brand-blue-500/40 hover:bg-brand-blue-500/10 hover:text-brand-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30"
            >
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
