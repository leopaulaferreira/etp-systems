import {
  BrainCircuit,
  ChartNoAxesCombined,
  CloudCog,
  Fingerprint,
  Network,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import type { CourseThumbnailKey } from '../courseTypes'
import IllustratedIcon, { type IconTone } from '../../../components/ui/IllustratedIcon'

const thumbnailConfig: Record<CourseThumbnailKey, { icon: LucideIcon; tone: IconTone }> = {
  security: { icon: ShieldCheck, tone: 'indigo' },
  cloud: { icon: CloudCog, tone: 'orange' },
  data: { icon: ChartNoAxesCombined, tone: 'blue' },
  cybersecurity: { icon: Network, tone: 'violet' },
  ai: { icon: BrainCircuit, tone: 'fuchsia' },
  lgpd: { icon: Fingerprint, tone: 'teal' },
  projects: { icon: Workflow, tone: 'rose' },
}

type CourseThumbnailProps = { thumbnail: CourseThumbnailKey; size?: 'small' | 'medium' | 'large' }

export default function CourseThumbnail({ thumbnail, size = 'medium' }: CourseThumbnailProps) {
  const { icon, tone } = thumbnailConfig[thumbnail]
  return (
    <IllustratedIcon
      icon={icon}
      tone={tone}
      size={size}
      cornerIcon={size === 'large' ? Network : undefined}
    >
      {size === 'large' && (
        <>
          <span className="absolute left-4 top-4 text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/60">
            Aprendizado em andamento
          </span>
          <span className="absolute bottom-7 left-5 h-px w-16 bg-gradient-to-r from-brand-cyan-400/60 to-transparent" />
        </>
      )}
    </IllustratedIcon>
  )
}
