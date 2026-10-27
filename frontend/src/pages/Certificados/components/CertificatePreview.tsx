import { useMemo } from 'react'
import { useProfile } from '../../../profile/ProfileContext'
import type { Certificate } from '../../../types/certificate'
import { certificateSvg } from '../certificateArtwork'

export default function CertificatePreview({ item, compact = false, fit = false }: { item: Certificate; compact?: boolean; fit?: boolean }) {
  const { profile } = useProfile()
  const source = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(certificateSvg(item, profile.name))}`, [item, profile.name])
  return (
    <div className={fit ? 'h-full w-full' : `w-full overflow-hidden border border-[#dcd4c2] bg-[#faf8f2] ${compact ? 'rounded-sm' : 'rounded-md shadow-[0_12px_32px_-16px_rgba(0,0,0,0.45)]'}`}>
      <img src={source} width={842} height={595} draggable={false}
        alt={compact ? '' : `Certificado de ${item.holderName ?? profile.name} — ${item.title}`}
        className={fit ? 'block h-full w-full object-contain' : 'block h-auto w-full'} />
    </div>
  )
}
