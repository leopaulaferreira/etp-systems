import {
  CloudCog,
  UsersRound,
  ChartNoAxesCombined,
  ShieldCheck,
  BookOpenText,
  Clock3,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'
import { type LearningPath } from '../trailApi'
import { levelIcons } from './trailLevels'

const iconConfig: Record<LearningPath['icon'], { icon: LucideIcon; tileClass: string; iconClass: string }> = {
  cloud: { icon: CloudCog, tileClass: 'border-orange-400/20 bg-orange-400/10', iconClass: 'bg-orange-500 text-white' },
  users: { icon: UsersRound, tileClass: 'border-emerald-400/20 bg-emerald-400/10', iconClass: 'bg-emerald-500 text-white' },
  data: { icon: ChartNoAxesCombined, tileClass: 'border-blue-400/20 bg-blue-400/10', iconClass: 'bg-blue-600 text-white' },
  shield: { icon: ShieldCheck, tileClass: 'border-indigo-400/20 bg-indigo-400/10', iconClass: 'bg-indigo-600 text-white' },
}

type TrailCardProps = {
  path: LearningPath
  onOpen: (path: LearningPath) => void
}

export default function TrailCard({ path, onOpen }: TrailCardProps) {
  const { icon: Icon, tileClass, iconClass } = iconConfig[path.icon]
  const LevelIcon = levelIcons[path.level]

  return (
    <button
      type="button"
      onClick={() => onOpen(path)}
      aria-label={`Explorar trilha ${path.title}`}
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

        {path.enrolled && <span className="mt-3 text-xs font-bold text-brand-blue-400">Inscrito · {path.progress}% concluído</span>}
        <div className="mt-auto flex items-center justify-between border-t border-ink-100/90 pt-3.5">
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[11px] font-semibold text-ink-500">
            <span className="flex items-center gap-1.5">
              <BookOpenText className="h-3.5 w-3.5 text-ink-400" strokeWidth={2} aria-hidden="true" />
              {path.courseCount} cursos
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-ink-400" strokeWidth={2} aria-hidden="true" />
              {Number(path.durationHours.toFixed(1)).toLocaleString('pt-BR')}h
            </span>
          </div>
          <span className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-200/80 bg-panel-alt text-ink-400 transition-[transform,background-color,border-color,color] duration-200 group-hover:translate-x-0.5 group-hover:border-brand-blue-500/40 group-hover:bg-brand-blue-500/10 group-hover:text-brand-blue-400">
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  )
}
