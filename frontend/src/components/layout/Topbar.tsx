import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronDown, LogOut, Menu } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../auth/AuthContext'
import { useProfile } from '../../profile/ProfileContext'

type TopbarProps = {
  /** Estado do drawer mobile — usado apenas para o aria-expanded do botão hambúrguer. */
  isMenuOpen?: boolean
  /** Abre o drawer mobile da Sidebar. */
  onOpenMenu?: () => void
}

export default function Topbar({ isMenuOpen = false, onOpenMenu }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { profile } = useProfile()
  const notificationCount = profile.notificationsEnabled ? profile.notificationCount : 0

  function handleLogout() {
    setMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-[92px] shrink-0 items-center justify-between gap-4 border-b border-ink-200 bg-panel/95 px-5 backdrop-blur-xl sm:px-8">
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

      <div className="flex max-w-md flex-1 items-center gap-2.5 rounded-xl border border-ink-200 bg-panel-alt px-3.5 py-3 transition-[border-color,box-shadow] duration-150 focus-within:border-brand-blue-500 focus-within:ring-2 focus-within:ring-brand-blue-500/15">
        <Search className="h-[18px] w-[18px] shrink-0 text-ink-400" strokeWidth={2} aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar cursos, trilhas, temas..."
          aria-label="Buscar cursos, trilhas, temas"
          className="w-full min-w-0 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={`Notificações (${notificationCount} não lidas)`}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30"
        >
          <Bell className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-blue-600 px-1 text-[10px] font-bold leading-none text-white">
              {notificationCount}
            </span>
          )}
        </button>

        <div className="h-8 w-px bg-ink-200" aria-hidden="true" />

        <div
          className="relative"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setMenuOpen(false)
          }}
        >
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-3 rounded-xl px-1.5 py-1 transition-colors duration-150 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30"
          >
            <Avatar name={profile.name} className="h-10 w-10" />
            <span className="flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-ink-900">{profile.name}</span>
              <span className="text-xs text-ink-500">{profile.role}</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-ink-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-ink-200 bg-panel p-1.5 shadow-card"
            >
              <button
                type="button"
                role="menuitem"
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
