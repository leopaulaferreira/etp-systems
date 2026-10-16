import { BrainCircuit, CloudCog, Fingerprint, KeyRound, ShieldCheck, Workflow, MessagesSquare } from 'lucide-react'
import type { Assessment } from '../../../types/assessment'
import IllustratedIcon from '../../../components/ui/IllustratedIcon'

const topics = {
  privacy: { icon: Fingerprint, tone: 'teal' },
  security: { icon: ShieldCheck, tone: 'indigo' },
  cloud: { icon: CloudCog, tone: 'orange' },
  access: { icon: KeyRound, tone: 'blue' },
  ai: { icon: BrainCircuit, tone: 'fuchsia' },
  projects: { icon: Workflow, tone: 'rose' },
  communication: { icon: MessagesSquare, tone: 'orange' },
} as const

export default function AssessmentIcon({ topic }: { topic: Assessment['topic'] }) {
  return <IllustratedIcon {...topics[topic]} size="compact" />
}
