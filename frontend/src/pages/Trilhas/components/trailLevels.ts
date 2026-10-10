import { SignalHigh, SignalLow, SignalMedium, type LucideIcon } from 'lucide-react'
import type { LearningPath } from '../trailApi'

export const levelIcons: Record<LearningPath['level'], LucideIcon> = {
  Iniciante: SignalLow,
  Intermediário: SignalMedium,
  Avançado: SignalHigh,
}
