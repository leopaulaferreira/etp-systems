import type { ReactNode } from 'react'
import IllustratedIcon from './IllustratedIcon'
import type { LucideIcon } from 'lucide-react'

type PageHeroProps = {
  eyebrow: string
  icon: LucideIcon
  title: ReactNode
  description: string
  artworkIcon?: LucideIcon
}

/** Cabeçalho compacto compartilhado pelas páginas internas e pelo Dashboard. */
export default function PageHero({
  eyebrow,
  icon: Icon,
  title,
  description,
  artworkIcon: ArtworkIcon = Icon,
}: PageHeroProps) {
  return (
    <section
      className="relative isolate flex min-h-[128px] items-center overflow-hidden rounded-[22px] border border-brand-blue-400/20 bg-[linear-gradient(115deg,#142747_0%,#101d35_52%,#0d192e_100%)] px-5 py-3.5 shadow-[0_18px_38px_-28px_rgba(0,0,0,0.9)] sm:px-7 lg:min-h-[132px] lg:px-8"
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

      <div className="relative z-10 flex w-full min-w-0 flex-col items-start gap-1.5 sm:pr-36">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue-400/20 bg-brand-blue-500/10 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.11em] text-brand-blue-400">
          <Icon className="h-3.5 w-3.5 shrink-0 text-brand-cyan-400" strokeWidth={2} aria-hidden="true" />
          {eyebrow}
        </span>
        <h1 className="text-[27px] font-extrabold leading-[1.13] tracking-[-0.025em] text-ink-900 sm:text-[29px]">
          {title}
        </h1>
        <p className="max-w-xl text-xs leading-[1.45] text-ink-500 sm:text-[13px]">
          {description}
        </p>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-6 hidden w-28 items-center justify-center text-white/20 sm:flex lg:right-8"
      >
        <IllustratedIcon icon={ArtworkIcon} tone="blue" size="hero" />
      </div>
    </section>
  )
}
