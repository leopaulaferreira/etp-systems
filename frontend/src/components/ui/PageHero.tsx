import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type PageHeroProps = {
  eyebrow: string
  icon: LucideIcon
  title: ReactNode
  description: string
  artwork?: ReactNode
  featured?: boolean
}

/** Cabeçalho compacto compartilhado pelas páginas internas e pelo Dashboard. */
export default function PageHero({
  eyebrow,
  icon: Icon,
  title,
  description,
  artwork,
  featured = false,
}: PageHeroProps) {
  return (
    <section
      className={`relative isolate flex min-h-[154px] items-center overflow-hidden rounded-[22px] border border-brand-blue-400/20 bg-[linear-gradient(115deg,#142747_0%,#101d35_52%,#0d192e_100%)] px-5 py-5 shadow-[0_18px_38px_-28px_rgba(0,0,0,0.9)] sm:px-7 lg:px-8 ${featured ? 'lg:min-h-[184px] lg:py-6' : 'lg:min-h-[168px] lg:py-5'}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-24 h-52 w-52 rounded-full border-[36px] border-brand-blue-500/[0.035]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-brand-cyan-400/40 via-brand-blue-400/10 to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-8 h-px w-40 bg-gradient-to-r from-brand-blue-400/30 to-transparent"
      />

      <div className="relative z-10 flex min-w-0 max-w-2xl flex-col items-start gap-2 xl:max-w-[58%]">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue-400/20 bg-brand-blue-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.11em] text-brand-blue-400">
          <Icon className="h-3.5 w-3.5 shrink-0 text-brand-cyan-400" strokeWidth={2} aria-hidden="true" />
          {eyebrow}
        </span>
        <h1 className="text-[29px] font-extrabold leading-tight tracking-[-0.025em] text-ink-900 sm:text-[32px]">
          {title}
        </h1>
        <p className="max-w-xl text-[13px] leading-[1.55] text-ink-500 sm:text-sm">
          {description}
        </p>
      </div>

      {artwork && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-5 hidden w-[38%] items-center justify-end xl:flex"
        >
          {artwork}
        </div>
      )}
    </section>
  )
}
