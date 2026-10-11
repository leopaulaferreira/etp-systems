import { NavLink } from 'react-router-dom'
import { Headset, X, ArrowUpRight, LayoutDashboard, UsersRound, ClipboardCheck, Award, Building2, UserRound, ShieldCheck } from 'lucide-react'
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
      <div className="flex items-center gap-2 px-2 pb-7">
        <img src={etpSymbol} alt="" className="h-8 w-8 shrink-0 object-contain lg:h-9 lg:w-9" />
        <span className="flex-1 whitespace-nowrap text-[17px] font-bold tracking-[-0.02em] text-white lg:text-[19px]">ETP Systems</span>
        <button type="button" aria-label="Fechar menu" onClick={onNavigate} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 lg:hidden"><X className="h-5 w-5" aria-hidden="true" /></button>
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
                `relative flex min-h-11 items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 ${
                  isActive
                    ? 'bg-white/[0.045] font-medium text-blue-200 before:absolute before:left-0 before:top-3 before:bottom-3 before:w-0.5 before:rounded-full before:bg-blue-300'
                    : 'font-normal text-white/60 hover:bg-white/[0.03] hover:text-white/90'
                }`
              }
            >
              <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={1.5} aria-hidden="true" />
              {item.label}
            </NavLink>
          )
        })}</div>)}
      </nav>

      <div className="mx-2 mt-6 border-t border-white/[0.08] pt-5">
        <div className="flex items-center gap-3 text-white/75">
          <Headset className="h-[22px] w-[22px] shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <p className="text-sm font-medium">Precisa de ajuda?</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-white/55">
          Nossa equipe está pronta para apoiar sua jornada.
        </p>
        <NavLink
          to="/ajuda"
          onClick={onNavigate}
          className="mt-2 flex min-h-11 w-full items-center justify-between gap-2 rounded-lg text-xs font-medium text-blue-200 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
        >
          Central de Ajuda
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </NavLink>
      </div>
    </aside>
  )
}
