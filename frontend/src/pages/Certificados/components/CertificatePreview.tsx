import { Award } from 'lucide-react'
import symbol from '../../../assets/etp-symbol.svg'
import { useProfile } from '../../../profile/ProfileContext'
import type { Certificate } from '../../../types/certificate'

const accents = {
  blue: 'border-brand-blue-400/60 text-brand-blue-400',
  green: 'border-emerald-400/60 text-emerald-400',
  purple: 'border-violet-400/60 text-violet-400',
  orange: 'border-orange-400/60 text-orange-400',
  cyan: 'border-brand-cyan-400/60 text-brand-cyan-400',
}

export default function CertificatePreview({
  item,
  compact = false,
}: {
  item: Certificate
  compact?: boolean
}) {
  const { profile } = useProfile()
  return (
    <div
      aria-hidden="true"
      className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br from-panel-alt via-panel to-navy-800 text-center ${accents[item.accent]} ${compact ? 'aspect-[1.4] gap-1 p-2' : 'min-h-[250px] gap-3 p-5'}`}
    >
      <span className="pointer-events-none absolute inset-1 rounded-sm border border-current opacity-30" />
      <span
        className={`font-extrabold uppercase tracking-[0.2em] ${compact ? 'text-[5px]' : 'text-[10px]'}`}
      >
        Certificado
      </span>
      <span
        className={`flex items-center gap-1 font-extrabold text-ink-900 ${compact ? 'text-[5px]' : 'text-xs'}`}
      >
        <img src={symbol} alt="" className={compact ? 'h-3 w-3' : 'h-5 w-5'} /> ETP Systems
      </span>
      <span
        className={`border-b border-current pb-1 font-bold ${compact ? 'text-[5px]' : 'text-sm'}`}
      >
        {profile.name}
      </span>
      <span
        className={`max-w-[90%] font-bold leading-snug text-ink-900 ${compact ? 'line-clamp-2 text-[5px]' : 'text-sm'}`}
      >
        {item.title}
      </span>
      {!compact && (
        <span className="text-[9px] text-ink-500">
          {item.hours} horas de aprendizado e evolução
        </span>
      )}
      <Award
        className={compact ? 'absolute bottom-1.5 right-1.5 h-5 w-5' : 'h-10 w-10 shrink-0'}
        strokeWidth={1.5}
      />
    </div>
  )
}
