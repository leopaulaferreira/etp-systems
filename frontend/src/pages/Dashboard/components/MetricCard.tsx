import { MapPinned, BookCheck, BadgeCheck, TimerReset, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { type MetricAccent, type MetricCardData } from '../../../mocks/dashboard.mock'

const icons: Record<MetricCardData['icon'], LucideIcon> = {
  trilhas: MapPinned,
  cursos: BookCheck,
  certificados: BadgeCheck,
  horas: TimerReset,
}

const accentClasses: Record<MetricAccent, { tile: string; icon: string; glow: string }> = {
  blue: { tile: 'border-blue-400/20 bg-blue-400/10', icon: 'bg-blue-600 text-white', glow: 'bg-blue-500/10' },
  green: { tile: 'border-emerald-400/20 bg-emerald-400/10', icon: 'bg-emerald-500 text-white', glow: 'bg-emerald-500/10' },
  purple: { tile: 'border-violet-400/20 bg-violet-400/10', icon: 'bg-violet-600 text-white', glow: 'bg-violet-500/10' },
  orange: { tile: 'border-orange-400/20 bg-orange-400/10', icon: 'bg-orange-500 text-white', glow: 'bg-orange-500/10' },
}

type MetricCardProps = {
  data: MetricCardData
}

export default function MetricCard({ data }: MetricCardProps) {
  const Icon = icons[data.icon]
  const accent = accentClasses[data.accent]
  const destination = {
    trilhas: '/trilhas',
    cursos: '/meus-cursos?aba=concluidos',
    certificados: '/certificados',
    horas: '/relatorios',
  }[data.icon]

  return (
    <div className="group relative flex min-h-[152px] overflow-hidden rounded-[20px] border border-ink-200/70 bg-panel p-5 shadow-card transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-brand-blue-500/50 hover:shadow-[0_20px_38px_-22px_rgba(37,99,235,0.45)] motion-reduce:transform-none">
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${accent.glow}`} aria-hidden="true" />
      <div className="relative flex w-full flex-col">
        <div className="flex items-center gap-4">
          <span className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${accent.tile}`}>
            <span className="absolute -right-3 -top-3 h-9 w-9 rounded-full bg-black/25" aria-hidden="true" />
            <span className={`relative flex h-10 w-10 items-center justify-center rounded-xl shadow-[0_8px_20px_-10px_rgba(0,0,0,0.9)] ${accent.icon}`}>
              <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} aria-hidden="true" />
            </span>
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[13px] font-semibold text-ink-500">{data.label}</span>
            <span className="text-[30px] font-extrabold leading-none tracking-[-0.025em] text-ink-900">{data.value}</span>
          </div>
        </div>

        <Link
          to={destination}
          className="mt-auto flex items-center justify-between border-t border-ink-100/90 pt-3 text-[13px] font-bold text-brand-blue-400 transition-colors duration-150 hover:text-brand-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30"
        >
          {data.ctaLabel}
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ink-200/80 bg-panel-alt text-ink-400 transition-[transform,background-color,border-color,color] duration-200 group-hover:translate-x-0.5 group-hover:border-brand-blue-500/40 group-hover:bg-brand-blue-500/10 group-hover:text-brand-blue-400">
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
          </span>
        </Link>
      </div>
    </div>
  )
}
