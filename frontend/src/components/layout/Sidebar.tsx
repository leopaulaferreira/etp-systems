import { NavLink } from 'react-router-dom'
import { X, ArrowUpRight } from 'lucide-react'
import etpSymbol from '../../assets/etp-symbol-sculpted.svg'
import { navItems } from './navItems'
import SidebarSculptedIcon, { type SidebarSymbol } from './SidebarSculptedIcon'
import { useAuth } from '../../auth/AuthContext'

type SidebarProps = {
  /** Chamado quando um item de navegação é ativado — usado para fechar o drawer mobile. */
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { role } = useAuth()
  const groups: { label: string; items: { id: string; label: string; to: string; symbol: SidebarSymbol }[] }[] = role === 'empresa' ? [
    { label: 'Painel da empresa', items: [
      { id: 'overview', label: 'Visão geral', to: '/empresa/dashboard', symbol: 'dashboard' },
      { id: 'team', label: 'Colaboradores', to: '/empresa/colaboradores', symbol: 'team' },
      { id: 'assessments', label: 'Avaliações', to: '/empresa/avaliacoes', symbol: 'avaliacoes' },
      { id: 'certificates', label: 'Certificados', to: '/empresa/certificados', symbol: 'certificados' },
    ] },
    { label: 'Configurações', items: [
      { id: 'company', label: 'Dados da empresa', to: '/empresa/configuracoes/dados', symbol: 'company' },
      { id: 'account', label: 'Minha conta', to: '/empresa/configuracoes/conta', symbol: 'perfil' },
      { id: 'security', label: 'Segurança', to: '/empresa/configuracoes/seguranca', symbol: 'security' },
    ] },
  ] : [{ label: '', items: navItems.map(item => ({ ...item, symbol: item.id })) }]
  return (
    <aside
      tabIndex={-1}
      className="app-sidebar app-scrollarea flex h-full w-full shrink-0 flex-col overflow-y-auto px-4 py-6 focus:outline-none"
    >
      <div className="flex items-center gap-2 px-2 pb-7">
        <img src={etpSymbol} alt="" className="h-9 w-9 shrink-0 object-contain lg:h-10 lg:w-10" />
        <span className="flex-1 whitespace-nowrap text-[17px] font-bold tracking-[-0.02em] text-white lg:text-[19px]">ETP Systems</span>
        <button type="button" aria-label="Fechar menu" onClick={onNavigate} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 lg:hidden"><X className="h-5 w-5" aria-hidden="true" /></button>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Navegação principal">
        {groups.map((group) => <div key={group.label} className="mb-4 flex flex-col gap-1">
          {group.label && <p className="px-3.5 pb-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/40">{group.label}</p>}
          {group.items.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `relative flex min-h-11 items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 ${
                  isActive
                    ? 'font-medium text-blue-200'
                    : 'font-normal text-white/60 hover:text-white/90'
                }`
              }
            >
              <SidebarSculptedIcon kind={item.symbol} />
              {item.label}
            </NavLink>
          ))}</div>)}
      </nav>

      <div className="mx-2 mt-6 border-t border-white/[0.08] pt-5">
        <div className="flex items-center gap-3 text-white/75">
          <SidebarSculptedIcon kind="help" />
          <p className="text-sm font-medium">Precisa de ajuda?</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-white/55">
          Nossa equipe está pronta para apoiar sua jornada.
        </p>
        <NavLink
          to="/ajuda"
          onClick={onNavigate}
          className="mt-3 flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-blue-200/30 bg-blue-300/5 px-3 text-xs font-medium text-blue-200 transition-colors duration-150 hover:border-blue-200/60 hover:bg-blue-300/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
        >
          Central de Ajuda
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </NavLink>
      </div>
    </aside>
  )
}
