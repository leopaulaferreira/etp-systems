import { NavLink } from 'react-router-dom'
import { Headset, ArrowUpRight, LayoutDashboard, UsersRound, ClipboardCheck, Award, Building2, UserRound, ShieldCheck } from 'lucide-react'
import etpSymbol from '../../assets/etp-symbol.svg'
import { navItems } from './navItems'
import { useAuth } from '../../auth/AuthContext'

type SidebarProps = {
  /** Chamado quando um item de navegação é ativado — usado para fechar o drawer mobile. */
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { role } = useAuth()
  const groups = role === 'empresa' ? [
    { label: 'Painel da empresa', items: [
      { id: 'overview', label: 'Visão geral', to: '/empresa/dashboard', icon: LayoutDashboard },
      { id: 'team', label: 'Colaboradores', to: '/empresa/colaboradores', icon: UsersRound },
      { id: 'assessments', label: 'Avaliações', to: '/empresa/avaliacoes', icon: ClipboardCheck },
      { id: 'certificates', label: 'Certificados', to: '/empresa/certificados', icon: Award },
    ] },
    { label: 'Configurações', items: [
      { id: 'company', label: 'Dados da empresa', to: '/empresa/configuracoes/dados', icon: Building2 },
      { id: 'account', label: 'Minha conta', to: '/empresa/configuracoes/conta', icon: UserRound },
      { id: 'security', label: 'Segurança', to: '/empresa/configuracoes/seguranca', icon: ShieldCheck },
    ] },
  ] : [{ label: '', items: navItems }]
  return (
    <aside
      tabIndex={-1}
      className="app-sidebar app-scrollarea flex h-full w-full shrink-0 flex-col overflow-y-auto px-4 py-6 focus:outline-none"
    >
      <div className="flex items-center gap-2.5 px-2 pb-7">
        <img src={etpSymbol} alt="" className="h-9 w-9 shrink-0 object-contain" />
        <span className="text-[19px] font-bold tracking-[-0.02em] text-white">ETP Systems</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Navegação principal">
        {groups.map((group) => <div key={group.label} className="mb-4 flex flex-col gap-1">
          {group.label && <p className="px-3.5 pb-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/40">{group.label}</p>}
          {group.items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.id}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan-400/40 ${
                  isActive ? 'bg-brand-blue-600 text-white' : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />
              {item.label}
            </NavLink>
          )
        })}</div>)}
      </nav>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-cyan-500/15 text-brand-cyan-400">
          <Headset className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-semibold text-white">Precisa de ajuda?</p>
        <p className="mt-1 text-xs leading-relaxed text-white/55">
          Nossa equipe está pronta para apoiar sua jornada.
        </p>
        <NavLink
          to="/ajuda"
          onClick={onNavigate}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-cyan-500 px-3 py-2 text-xs font-semibold text-navy-950 transition-colors duration-150 hover:bg-brand-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan-400/50"
        >
          Central de Ajuda
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
        </NavLink>
      </div>
    </aside>
  )
}
