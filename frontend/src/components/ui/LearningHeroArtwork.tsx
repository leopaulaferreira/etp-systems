import {
  Award,
  BookOpen,
  BookOpenCheck,
  Check,
  CircleDot,
  GraduationCap,
  MapPinned,
  Play,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

type ArtworkVariant = 'dashboard' | 'courses' | 'myCourses' | 'paths'

const artwork: Record<ArtworkVariant, {
  icon: LucideIcon
  rowIcon: LucideIcon
  badgeIcon: LucideIcon
  cornerIcon: LucideIcon
  rows: number[]
}> = {
  dashboard: {
    icon: TrendingUp,
    rowIcon: Check,
    badgeIcon: TrendingUp,
    cornerIcon: Award,
    rows: [82, 57, 94],
  },
  courses: {
    icon: BookOpen,
    rowIcon: BookOpen,
    badgeIcon: BookOpen,
    cornerIcon: GraduationCap,
    rows: [72, 88, 62],
  },
  myCourses: {
    icon: BookOpenCheck,
    rowIcon: Check,
    badgeIcon: Play,
    cornerIcon: GraduationCap,
    rows: [88, 64, 42],
  },
  paths: {
    icon: MapPinned,
    rowIcon: CircleDot,
    badgeIcon: MapPinned,
    cornerIcon: GraduationCap,
    rows: [86, 68, 92],
  },
}

/** Arte vetorial em código: mantém a linguagem dos banners sem personagens ou imagens pesadas. */
export default function LearningHeroArtwork({ variant }: { variant: ArtworkVariant }) {
  const {
    icon: MainIcon,
    rowIcon: RowIcon,
    badgeIcon: BadgeIcon,
    cornerIcon: CornerIcon,
    rows,
  } = artwork[variant]

  return (
    <div className="relative h-[158px] w-[252px] shrink-0">
      <span className="absolute right-4 top-1 h-40 w-40 rounded-full border border-brand-blue-400/15 bg-brand-blue-500/5" />
      <span className="absolute right-9 top-6 h-28 w-28 rounded-full border border-dashed border-brand-cyan-400/15" />

      <div className="absolute right-10 top-3 flex h-[137px] w-[165px] -rotate-6 flex-col rounded-2xl border border-brand-blue-400/35 bg-gradient-to-br from-navy-700 to-navy-900 px-4 py-3 shadow-[12px_16px_30px_-12px_rgba(0,0,0,0.72)]">
        <span className="absolute -top-1.5 left-1/2 h-4 w-12 -translate-x-1/2 rounded-md border border-brand-blue-400/30 bg-navy-800" />
        <div className="flex items-center justify-between border-b border-brand-blue-400/15 pb-2">
          <MainIcon className="h-4 w-4 text-brand-cyan-400" strokeWidth={1.6} />
          <span className="h-1 w-12 rounded-full bg-brand-blue-400/30" />
        </div>
        <div className="flex flex-1 flex-col justify-around pt-1">
          {rows.map((width, index) => (
            <span key={index} className="flex items-center gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-brand-cyan-400/12">
                <RowIcon className="h-2.5 w-2.5 text-brand-cyan-400" strokeWidth={1.8} />
              </span>
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-brand-blue-400/15">
                <span
                  className="block h-full rounded-full bg-brand-blue-400/65"
                  style={{ width: `${width}%` }}
                />
              </span>
            </span>
          ))}
        </div>
      </div>

      <span className="absolute bottom-1 left-5 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-300/30 bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg">
        <BadgeIcon className="h-7 w-7 text-white" strokeWidth={1.8} />
      </span>
      <span className="absolute bottom-3 right-0 flex h-13 w-13 rotate-6 items-center justify-center rounded-2xl border border-brand-blue-400/25 bg-navy-800 shadow-lg">
        <CornerIcon className="h-8 w-8 text-brand-blue-400" strokeWidth={1.4} />
      </span>
      <Sparkles className="absolute left-4 top-4 h-4 w-4 text-brand-cyan-400/60" strokeWidth={1.5} />
    </div>
  )
}
