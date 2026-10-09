import {
  CloudCog,
  UsersRound,
  ChartNoAxesCombined,
  ShieldCheck,
  GitBranch,
  BrainCircuit,
  Fingerprint,
  Workflow,
  BookOpenText,
  Clock3,
  ArrowUpRight,
  SignalLow,
  SignalMedium,
  SignalHigh,
  type LucideIcon,
} from 'lucide-react'
import { type LearningPath, type LearningPathIconKey, type LearningPathLevel } from '../../../mocks/trilhas.mock'
import { Link } from 'react-router-dom'

const iconConfig: Record<LearningPathIconKey, { icon: LucideIcon; tileClass: string; iconClass: string }> = {
  cloud: { icon: CloudCog, tileClass: 'border-orange-400/20 bg-orange-400/10', iconClass: 'bg-orange-500 text-white' },
  users: { icon: UsersRound, tileClass: 'border-emerald-400/20 bg-emerald-400/10', iconClass: 'bg-emerald-500 text-white' },
  data: { icon: ChartNoAxesCombined, tileClass: 'border-blue-400/20 bg-blue-400/10', iconClass: 'bg-blue-600 text-white' },
  shield: { icon: ShieldCheck, tileClass: 'border-indigo-400/20 bg-indigo-400/10', iconClass: 'bg-indigo-600 text-white' },
  devops: { icon: GitBranch, tileClass: 'border-sky-400/20 bg-sky-400/10', iconClass: 'bg-sky-500 text-white' },
  ai: { icon: BrainCircuit, tileClass: 'border-violet-400/20 bg-violet-400/10', iconClass: 'bg-violet-600 text-white' },
  lock: { icon: Fingerprint, tileClass: 'border-teal-400/20 bg-teal-400/10', iconClass: 'bg-teal-600 text-white' },
  productivity: { icon: Workflow, tileClass: 'border-rose-400/20 bg-rose-400/10', iconClass: 'bg-rose-500 text-white' },
}

export const levelIcons: Record<LearningPathLevel, LucideIcon> = {
  Iniciante: SignalLow,
  Intermediário: SignalMedium,
  Avançado: SignalHigh,
}

type TrailCardProps = {
  path: LearningPath
}

export default function TrailCard({ path }: TrailCardProps) {
  const { icon: Icon, tileClass, iconClass } = iconConfig[path.icon]
  const LevelIcon = levelIcons[path.level]

  return (
    <Link
      to={`/cursos?categoria=${encodeURIComponent(path.category)}`}
      aria-label={`Explorar cursos de ${path.category}: ${path.title}`}
      className="group relative flex min-h-[204px] w-full overflow-hidden rounded-[20px] border border-ink-200/70 bg-panel p-5 text-left shadow-card transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-brand-blue-500/50 hover:shadow-[0_20px_38px_-22px_rgba(37,99,235,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transform-none"
    >
      <div className="flex h-full w-full flex-col">
        <div className="flex items-start gap-3.5">
          <span
            className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${tileClass}`}
          >
            <span className="absolute -right-3 -top-3 h-9 w-9 rounded-full bg-black/25" aria-hidden="true" />
            <span className={`relative flex h-10 w-10 items-center justify-center rounded-xl shadow-[0_8px_20px_-10px_rgba(0,0,0,0.9)] ${iconClass}`}>
              <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} aria-hidden="true" />
            </span>
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.105em] text-brand-blue-400/90">
              {path.category}
            </span>
            <h3 className="text-[16px] font-extrabold leading-[1.35] tracking-[-0.012em] text-ink-900">
              {path.title}
            </h3>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-500">
              <LevelIcon className="h-3.5 w-3.5 text-ink-400" strokeWidth={2} aria-hidden="true" />
              {path.level}
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-ink-100/90 pt-3.5">
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[11px] font-semibold text-ink-500">
            <span className="flex items-center gap-1.5">
              <BookOpenText className="h-3.5 w-3.5 text-ink-400" strokeWidth={2} aria-hidden="true" />
              {path.courseCount} cursos
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-ink-400" strokeWidth={2} aria-hidden="true" />
              {path.durationHours}h
            </span>
          </div>
          <span className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-200/80 bg-panel-alt text-ink-400 transition-[transform,background-color,border-color,color] duration-200 group-hover:translate-x-0.5 group-hover:border-brand-blue-500/40 group-hover:bg-brand-blue-500/10 group-hover:text-brand-blue-400">
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  )
}
