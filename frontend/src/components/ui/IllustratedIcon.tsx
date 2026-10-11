import { useId, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export type IconTone =
  'indigo' | 'orange' | 'blue' | 'violet' | 'fuchsia' | 'teal' | 'rose' | 'emerald'

export type IconFinish = 'illustrated' | 'relief'

const reliefTones: Record<IconTone, string> = {
  indigo: 'text-indigo-300',
  orange: 'text-orange-300',
  blue: 'text-blue-300',
  violet: 'text-violet-300',
  fuchsia: 'text-fuchsia-300',
  teal: 'text-teal-300',
  rose: 'text-rose-300',
  emerald: 'text-emerald-300',
}

const themes: Record<IconTone, { tile: string; accent: string }> = {
  indigo: {
    tile: 'from-indigo-950 via-navy-900 to-indigo-900',
    accent: 'text-indigo-300 border-indigo-400/30 bg-indigo-500/20',
  },
  orange: {
    tile: 'from-navy-950 via-navy-900 to-orange-950',
    accent: 'text-orange-300 border-orange-400/30 bg-orange-500/20',
  },
  blue: {
    tile: 'from-navy-950 via-navy-900 to-blue-900',
    accent: 'text-blue-300 border-blue-400/30 bg-blue-500/20',
  },
  violet: {
    tile: 'from-violet-950 via-navy-900 to-violet-900',
    accent: 'text-violet-300 border-violet-400/30 bg-violet-500/20',
  },
  fuchsia: {
    tile: 'from-violet-950 via-navy-900 to-fuchsia-950',
    accent: 'text-fuchsia-300 border-fuchsia-400/30 bg-fuchsia-500/20',
  },
  teal: {
    tile: 'from-navy-950 via-navy-900 to-teal-900',
    accent: 'text-teal-300 border-teal-400/30 bg-teal-500/20',
  },
  rose: {
    tile: 'from-navy-950 via-navy-900 to-rose-950',
    accent: 'text-rose-300 border-rose-400/30 bg-rose-500/20',
  },
  emerald: {
    tile: 'from-navy-950 via-navy-900 to-emerald-950',
    accent: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/20',
  },
}
const sizes = {
  tile: { tile: 'h-14 w-14 rounded-2xl', center: 'h-10 w-10', icon: 'h-6 w-6', shape: 'h-11 w-11' },
  hero: { tile: 'h-24 w-24 rounded-[22px]', center: 'h-16 w-16', icon: 'h-10 w-10', shape: 'h-20 w-20' },
  featured: { tile: 'h-40 w-40 rounded-[26px]', center: 'h-24 w-24', icon: 'h-14 w-14', shape: 'h-32 w-32' },
  compact: {
    tile: 'h-10 w-10 rounded-xl',
    center: 'h-7 w-7',
    icon: 'h-4.5 w-4.5',
    shape: 'h-8 w-8',
  },
  metric: {
    tile: 'h-13 w-13 rounded-2xl',
    center: 'h-9 w-9',
    icon: 'h-5.5 w-5.5',
    shape: 'h-10 w-10',
  },
  small: { tile: 'h-14 w-16 rounded-xl', center: 'h-10 w-10', icon: 'h-6 w-6', shape: 'h-11 w-11' },
  medium: {
    tile: 'h-20 w-24 rounded-2xl',
    center: 'h-10 w-10',
    icon: 'h-6 w-6',
    shape: 'h-11 w-11',
  },
  large: {
    tile: 'min-h-[220px] h-full w-full rounded-[20px]',
    center: 'h-24 w-24 -rotate-3',
    icon: 'h-14 w-14',
    shape: 'h-32 w-32',
  },
}

export type IllustratedIconSize = keyof typeof sizes

const reliefSizes: Record<IllustratedIconSize, string> = {
  compact: 'h-7 w-7',
  metric: 'h-9 w-9',
  tile: 'h-9 w-9',
  small: 'h-9 w-9',
  medium: 'h-11 w-11',
  hero: 'h-16 w-16',
  featured: 'h-24 w-24',
  large: 'h-24 w-24',
}

/** Acabamento visual compartilhado a partir das miniaturas de Meus Cursos. */
export default function IllustratedIcon({
  icon: Icon,
  tone,
  size = 'metric',
  finish = 'illustrated',
  children,
  cornerIcon: CornerIcon,
}: {
  icon: LucideIcon
  tone: IconTone
  size?: IllustratedIconSize
  finish?: IconFinish
  children?: ReactNode
  cornerIcon?: LucideIcon
}) {
  const gradientId = useId()
  const { tile, accent } = themes[tone]
  const dimensions = sizes[size]
  if (finish === 'relief') {
    return (
      <span
        aria-hidden="true"
        className={`pointer-events-none relative flex shrink-0 items-center justify-center ${reliefTones[tone]} ${dimensions.tile}`}
      >
        <Icon
          className={`${reliefSizes[size]} [filter:drop-shadow(0_1px_0_rgba(0,0,0,0.4))_drop-shadow(0_3px_3px_rgba(0,0,0,0.18))]`}
          stroke={`url(#${gradientId})`}
          strokeWidth={1.65}
        >
          <defs>
            <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="18" y2="24">
              <stop offset="0%" stopColor="white" stopOpacity={0.95} />
              <stop offset="38%" stopColor="currentColor" />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0.65} />
            </linearGradient>
          </defs>
        </Icon>
        {CornerIcon && <CornerIcon className="absolute bottom-5 right-5 h-4 w-4" />}
        {children}
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none relative isolate flex shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-gradient-to-br shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${tile} ${dimensions.tile}`}
    >
      <span className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:18px_18px]" />
      <span
        className={`absolute rounded-full border opacity-30 ${accent} ${size === 'large' ? 'h-44 w-44' : 'h-20 w-20'}`}
      />
      <span
        className={`absolute rotate-12 rounded-[22%] border opacity-40 ${accent} ${dimensions.shape}`}
      />
      <span
        className={`relative flex items-center justify-center rounded-[24%] border shadow-lg backdrop-blur-sm ${accent} ${dimensions.center}`}
      >
        <Icon
          className={`${dimensions.icon} ${size === 'large' ? 'rotate-3' : ''} drop-shadow-[0_0_8px_currentColor]`}
          strokeWidth={size === 'large' || size === 'featured' ? 1.5 : 1.8}
        />
      </span>
      {CornerIcon && (
        <span
          className={`absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-xl border ${accent}`}
        >
          <CornerIcon className="h-4 w-4" />
        </span>
      )}
      {children}
    </span>
  )
}
