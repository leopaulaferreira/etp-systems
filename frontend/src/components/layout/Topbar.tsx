import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Building2, ChevronDown, LogOut, Menu, UserRound } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../auth/AuthContext'
import { useProfile } from '../../profile/ProfileContext'
import { useCompanySettings } from '../../pages/Empresa/companySettings'

type TopbarProps = {
  /** Estado do drawer mobile — usado apenas para o aria-expanded do botão hambúrguer. */
  isMenuOpen?: boolean
  /** Abre o drawer mobile da Sidebar. */
  onOpenMenu?: () => void
}

export default function Topbar({ isMenuOpen = false, onOpenMenu }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const accountButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function closeOutside(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [menuOpen])
  const { logout, role, companyId } = useAuth()
  const navigate = useNavigate()
  const { profile } = useProfile()
  const notificationCount = profile.notificationsEnabled ? profile.notificationCount : 0
  const { settings } = useCompanySettings(companyId)
  const isCompany = role === 'empresa'
  const displayName = isCompany ? settings.contactName : profile.name

  function handleLogout() {
    setMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="relative z-30 flex h-20 shrink-0 items-center justify-between gap-2 border-b border-ink-200 bg-panel/95 px-4 backdrop-blur-xl sm:h-[92px] sm:gap-4 sm:px-8">
      <button
        type="button"
        id="mobile-menu-button"
        aria-label="Abrir menu"
        aria-haspopup="dialog"
        aria-controls="app-sidebar-drawer"
        aria-expanded={isMenuOpen}
        onClick={onOpenMenu}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-500 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30 lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
      </button>

      {isCompany ? <div className="flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold text-ink-500"><Building2 className="h-5 w-5 shrink-0 text-brand-blue-400" aria-hidden="true" /><span className="hidden sm:inline">Gestão de aprendizagem</span></div> : <form role="search" onSubmit={(event) => {
        event.preventDefault()
        navigate(query.trim() ? `/cursos?busca=${encodeURIComponent(query.trim())}` : '/cursos')
      }} className="flex min-w-0 max-w-md flex-1 items-center gap-2.5 rounded-xl border border-ink-200 bg-panel-alt px-3.5 py-3 transition-[border-color,box-shadow] duration-150 focus-within:border-brand-blue-500 focus-within:ring-2 focus-within:ring-brand-blue-500/15">
        <Search className="h-[18px] w-[18px] shrink-0 text-ink-400" strokeWidth={2} aria-hidden="true" />
        <input
          type="search"
          enterKeyHint="search"
          placeholder="Buscar cursos..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Buscar cursos"
          className="w-full min-w-0 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
      </form>}

      <div className="flex shrink-0 items-center gap-1 sm:gap-4">
        {!isCompany && <button
          type="button"
          aria-label={`Notificações (${notificationCount} não lidas)`}
          onClick={() => navigate('/configuracoes?secao=notificacoes')}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30"
        >
          <Bell className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-blue-600 px-1 text-[10px] font-bold leading-none text-white">
              {notificationCount}
            </span>
          )}
        </button>}

        <div className="hidden h-8 w-px bg-ink-200 sm:block" aria-hidden="true" />

        <div
          ref={menuRef}
          className="relative"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') { setMenuOpen(false); accountButtonRef.current?.focus() }
          }}
        >
          <button
            type="button"
            ref={accountButtonRef}
            aria-label="Opções da conta"
            aria-controls="account-options"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-3 rounded-xl px-1.5 py-1 transition-colors duration-150 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30"
          >
            <Avatar name={displayName} className="h-10 w-10" />
            <span className="hidden max-w-40 flex-col items-start text-left leading-tight md:flex">
              <span className="w-full truncate text-sm font-semibold text-ink-900" title={displayName}>{displayName}</span>
              <span className="text-xs text-ink-500">{isCompany ? 'Empresa / RH' : profile.role}</span>
            </span>
            <ChevronDown
              className={`hidden h-4 w-4 text-ink-400 transition-transform sm:block duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>

          {menuOpen && (
            <div
              id="account-options"
              role="group"
              aria-label="Opções da conta"
              className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-ink-200 bg-panel p-1.5 shadow-card"
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  navigate(isCompany ? '/empresa/configuracoes/conta' : '/perfil')
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-700 transition-colors duration-150 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30"
              >
                <UserRound className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                {isCompany ? 'Minha conta' : 'Meu perfil'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-700 transition-colors duration-150 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
