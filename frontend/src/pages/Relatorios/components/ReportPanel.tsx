import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

type Props = {
  title: string
  eyebrow: string
  children: ReactNode
  actionLabel?: string
  onDetails?: () => void
  className?: string
}

export default function ReportPanel({
  title,
  eyebrow,
  children,
  actionLabel = 'Ver detalhes',
  onDetails,
  className = '',
}: Props) {
  return (
    <section
      aria-label={title}
      className={`relative flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-ink-200/70 bg-panel shadow-card ${className}`}
    >
      <div className="flex items-start justify-between gap-3 px-5 pb-5 pt-6 sm:px-6">
        <div className="min-w-0">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
            {eyebrow}
          </p>
          <h2 className="text-[16px] font-extrabold leading-snug tracking-tight text-ink-900">
            {title}
          </h2>
        </div>
        {onDetails && (
          <button
            type="button"
            onClick={onDetails}
            aria-label={`${actionLabel}: ${title}`}
            title={actionLabel}
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-200 bg-panel-alt text-ink-500 transition-colors hover:border-brand-blue-500/50 hover:bg-brand-blue-500/10 hover:text-brand-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {children}
    </section>
  )
}
