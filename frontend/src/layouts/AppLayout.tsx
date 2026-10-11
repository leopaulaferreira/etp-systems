import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'
import CompanyOverviewProvider from '../pages/Empresa/CompanyOverviewProvider'
import './AppLayout.css'

const DESKTOP_QUERY = '(min-width: 1024px)'

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)
  const drawerRef = useRef<HTMLDivElement>(null)

  function closeDrawer() {
    setDrawerOpen(false)
  }

  // Fecha o drawer automaticamente se a tela crescer para desktop enquanto aberto.
  useEffect(() => {
    const desktopQuery = window.matchMedia(DESKTOP_QUERY)
    function handleChange(event: MediaQueryListEvent) {
      setIsDesktop(event.matches)
      if (event.matches) setDrawerOpen(false)
    }
    desktopQuery.addEventListener('change', handleChange)
    return () => desktopQuery.removeEventListener('change', handleChange)
  }, [])

  // Bloqueia o scroll do body e move o foco para o drawer enquanto ele estiver aberto.
  useEffect(() => {
    if (!drawerOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    drawerRef.current?.querySelector<HTMLElement>('button, a[href]')?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDrawer()
      if (event.key === 'Tab') {
        const items = drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]')
        const visible = Array.from(items ?? []).filter(item => item.getClientRects().length > 0)
        const first = visible[0]
        const last = visible.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      document.getElementById('mobile-menu-button')?.focus()
    }
  }, [drawerOpen])

  return (
    <CompanyOverviewProvider><div className="app-shell flex h-[100svh] min-h-0 w-full overflow-hidden bg-surface">
      {drawerOpen && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={closeDrawer}
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <div
        id="app-sidebar-drawer"
        inert={!isDesktop && !drawerOpen}
        ref={drawerRef}
        role={drawerOpen ? 'dialog' : undefined}
        aria-modal={drawerOpen ? true : undefined}
        aria-label="Navegação principal"
        tabIndex={-1}
        className={`fixed inset-y-0 left-0 z-50 w-[268px] shrink-0 transform transition-transform duration-200 ease-out focus:outline-none lg:static lg:z-auto lg:translate-x-0 lg:transition-none ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onNavigate={closeDrawer} />
      </div>

      <div inert={drawerOpen && !isDesktop} className="flex min-w-0 flex-1 flex-col">
        <Topbar isMenuOpen={drawerOpen} onOpenMenu={() => setDrawerOpen(true)} />
        <main className="app-scrollarea min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-5 sm:px-7 sm:py-7 lg:px-9">
            <Outlet />
          </div>
        </main>
      </div>
    </div></CompanyOverviewProvider>
  )
}
