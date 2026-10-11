import {
  BookOpen, BrainCircuit, ChartNoAxesCombined, CloudCog, CodeXml, Fingerprint,
  Landmark, MessageSquareText, Network, PanelsTopLeft, ShieldCheck, UsersRound,
  Workflow, type LucideIcon,
} from 'lucide-react'
import IllustratedIcon, { type IconTone, type IllustratedIconSize } from './IllustratedIcon'

// O mesmo assunto mantém símbolo e cor no catálogo, nas inscrições e no dashboard.
const themes: Record<string, { icon: LucideIcon; tone: IconTone }> = {
  cloud: { icon: CloudCog, tone: 'orange' },
  python: { icon: CodeXml, tone: 'blue' },
  code: { icon: CodeXml, tone: 'blue' },
  communication: { icon: MessageSquareText, tone: 'violet' },
  ai: { icon: BrainCircuit, tone: 'fuchsia' },
  security: { icon: ShieldCheck, tone: 'indigo' },
  shield: { icon: ShieldCheck, tone: 'indigo' },
  governance: { icon: Landmark, tone: 'violet' },
  workspace: { icon: PanelsTopLeft, tone: 'blue' },
  analytics: { icon: ChartNoAxesCombined, tone: 'blue' },
  data: { icon: ChartNoAxesCombined, tone: 'blue' },
  leadership: { icon: UsersRound, tone: 'emerald' },
  users: { icon: UsersRound, tone: 'emerald' },
  projects: { icon: Workflow, tone: 'rose' },
  cybersecurity: { icon: Network, tone: 'violet' },
  lgpd: { icon: Fingerprint, tone: 'teal' },
}
const fallback = { icon: BookOpen, tone: 'blue' } as const

export default function LearningIcon({ kind, size = 'tile' }: { kind: string; size?: IllustratedIconSize }) {
  const theme = Object.hasOwn(themes, kind) ? themes[kind] : fallback
  return <IllustratedIcon {...theme} size={size} />
}
