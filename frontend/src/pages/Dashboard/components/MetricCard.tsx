import IllustratedIcon, { type IconTone } from '../../../components/ui/IllustratedIcon'
import { BookOpen, BookCheck, Award, Clock3, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export type MetricAccent = 'blue' | 'green' | 'purple' | 'orange'
export type MetricCardData = {
  id: string
  label: string
  value: string
  ctaLabel: string
  accent: MetricAccent
  icon: 'andamento' | 'concluidos' | 'certificados' | 'horas'
  to: string
}

const icons: Record<MetricCardData['icon'], LucideIcon> = {
  andamento: BookOpen,
  concluidos: BookCheck,
  certificados: Award,
  horas: Clock3,
}

const tones: Record<MetricAccent, IconTone> = { blue: 'blue', green: 'emerald', purple: 'violet', orange: 'orange' }

type MetricCardProps = {
  data: MetricCardData
}

export default function MetricCard({ data }: MetricCardProps) {
  const Icon = icons[data.icon]
  const tone = tones[data.accent]
  return (
    <div className="group relative flex min-h-[152px] overflow-hidden rounded-[20px] border border-ink-200/70 bg-panel p-5 shadow-card transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-brand-blue-500/50 hover:shadow-[0_20px_38px_-22px_rgba(37,99,235,0.45)] motion-reduce:transform-none">
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-blue-500/5`} aria-hidden="true" />
      <div className="relative flex w-full flex-col">
        <div className="flex items-center gap-4">
          <IllustratedIcon icon={Icon} tone={tone} size="tile" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[13px] font-semibold text-ink-500">{data.label}</span>
            <span className="text-[30px] font-extrabold leading-none tracking-[-0.025em] text-ink-900">{data.value}</span>
          </div>
        </div>

        <Link
          to={data.to}
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
