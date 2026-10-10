import {
  BrainCircuit,
  ChartPie,
  CloudCog,
  CodeXml,
  Fingerprint,
  Landmark,
  LockKeyhole,
  MessageSquareText,
  Network,
  PanelsTopLeft,
  ShieldCheck,
  UsersRound,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import type { CourseIcon } from '../courseTypes'

const themes: Record<CourseIcon, { icon: LucideIcon; color: string; background: string }> = {
  cloud: {
    icon: CloudCog,
    color: 'text-orange-300',
    background: 'border-orange-400/20 bg-orange-400/10',
  },
  python: {
    icon: CodeXml,
    color: 'text-blue-300',
    background: 'border-blue-400/20 bg-blue-400/10',
  },
  communication: {
    icon: MessageSquareText,
    color: 'text-violet-300',
    background: 'border-violet-400/20 bg-violet-400/10',
  },
  ai: {
    icon: BrainCircuit,
    color: 'text-emerald-300',
    background: 'border-emerald-400/20 bg-emerald-400/10',
  },
  security: {
    icon: Fingerprint,
    color: 'text-teal-300',
    background: 'border-teal-400/20 bg-teal-400/10',
  },
  governance: {
    icon: Landmark,
    color: 'text-violet-300',
    background: 'border-violet-400/20 bg-violet-400/10',
  },
  workspace: {
    icon: PanelsTopLeft,
    color: 'text-sky-300',
    background: 'border-sky-400/20 bg-sky-400/10',
  },
  analytics: {
    icon: ChartPie,
    color: 'text-orange-300',
    background: 'border-orange-400/20 bg-orange-400/10',
  },
  code: { icon: CodeXml, color: 'text-blue-300', background: 'border-blue-400/20 bg-blue-400/10' },
  leadership: {
    icon: UsersRound,
    color: 'text-emerald-300',
    background: 'border-emerald-400/20 bg-emerald-400/10',
  },
  projects: {
    icon: Workflow,
    color: 'text-rose-300',
    background: 'border-rose-400/20 bg-rose-400/10',
  },
}

export default function CourseArtwork({
  icon,
  featured = false,
}: {
  icon: CourseIcon
  featured?: boolean
}) {
  const { icon: Icon, color, background } = themes[icon]
  if (featured)
    return (
      <div
        aria-hidden="true"
        className="relative isolate flex min-h-[200px] items-center justify-center"
      >
        <span className="absolute h-44 w-44 rounded-full border border-brand-cyan-400/10" />
        <span className="absolute h-36 w-36 rotate-12 rounded-[28px] border border-brand-cyan-400/15 bg-brand-blue-500/10" />
        <span className="relative flex h-28 w-28 -rotate-3 items-center justify-center rounded-[26px] border border-brand-cyan-400/25 bg-gradient-to-br from-brand-blue-500/30 to-brand-cyan-400/10 shadow-[0_0_45px_-12px_rgba(34,195,238,0.4)]">
          <ShieldCheck className="h-20 w-20 rotate-3 text-brand-cyan-400" strokeWidth={1.2} />
          <LockKeyhole className="absolute h-7 w-7 rotate-3 text-white" strokeWidth={1.7} />
        </span>
        <Network className="absolute bottom-5 right-5 h-5 w-5 text-brand-cyan-400/50" />
      </div>
    )
  return (
    <span
      aria-hidden="true"
      className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${background}`}
    >
      <span className="absolute -right-3 -top-3 h-9 w-9 rounded-full bg-black/20" />
      <span
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border shadow-lg ${background} ${color}`}
      >
        <Icon className="h-6 w-6" strokeWidth={1.7} />
      </span>
    </span>
  )
}
