import {
  LayoutDashboard, Route, BookOpen, GraduationCap, ClipboardCheck,
  Award, ChartNoAxesColumnIncreasing, UserRound, Settings2,
  Headphones, UsersRound, Building2, ShieldCheck, type LucideIcon,
} from 'lucide-react'
import type { NavItemId } from './navItems'

export type SidebarSymbol = NavItemId | 'help' | 'team' | 'company' | 'security'

const symbols: Record<SidebarSymbol, LucideIcon> = {
  dashboard: LayoutDashboard,
  trilhas: Route,
  cursos: BookOpen,
  'meus-cursos': GraduationCap,
  avaliacoes: ClipboardCheck,
  certificados: Award,
  relatorios: ChartNoAxesColumnIncreasing,
  perfil: UserRound,
  configuracoes: Settings2,
  help: Headphones,
  team: UsersRound,
  company: Building2,
  security: ShieldCheck,
}

export default function SidebarIcon({ kind }: { kind: SidebarSymbol }) {
  const Icon = symbols[kind]
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center" aria-hidden="true">
      <Icon className="h-5 w-5" strokeWidth={1.75} focusable="false" />
    </span>
  )
}
