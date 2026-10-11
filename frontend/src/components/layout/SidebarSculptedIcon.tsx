import { useId, type ReactNode } from 'react'
import type { NavItemId } from './navItems'

export type SidebarSymbol = NavItemId | 'help' | 'team' | 'company' | 'security'

// Silhuetas preenchidas: o relevo pertence ao símbolo, sem placa ou moldura.
const symbols: Record<SidebarSymbol, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="6" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="11" width="8" height="10" rx="2" /></>,
  trilhas: <><circle cx="6" cy="5" r="3" /><circle cx="18" cy="19" r="3" /><path d="M11 4h6a5 5 0 0 1 0 10H7a2 2 0 0 0 0 4h6v2H7a4 4 0 0 1 0-8h10a3 3 0 0 0 0-6h-6Z" /></>,
  cursos: <><path d="M2.5 4.5C6 3.4 9 4 11 5.5V21c-2.4-1.8-5.3-2.1-8.5-1.2ZM13 5.5c2-1.5 5-2.1 8.5-1V19.8c-3.2-.9-6.1-.6-8.5 1.2Z" /></>,
  'meus-cursos': <><path d="m1 8 11-5 11 5-11 5ZM5 12l7 3.2 7-3.2v5c-4 3.3-10 3.3-14 0Z" /><rect x="21" y="10" width="1.5" height="7" rx=".75" /></>,
  avaliacoes: <><path fillRule="evenodd" d="M7 5H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2v2H7Zm9.7 6.3a1 1 0 0 0-1.4 0L10 16.6l-2.3-2.3a1 1 0 0 0-1.4 1.4l3 3a1 1 0 0 0 1.4 0l6-6a1 1 0 0 0 0-1.4Z" /><rect x="8" y="2" width="8" height="4" rx="1.5" /></>,
  certificados: <><circle cx="12" cy="8" r="6" /><path d="m6.8 14-2 8 4.2-1.9 2 1.9.4-6A8 8 0 0 1 6.8 14Zm10.4 0 2 8-4.2-1.9-2 1.9-.4-6a8 8 0 0 0 4.6-2Z" /></>,
  relatorios: <><rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="7" width="4" height="14" rx="1" /><rect x="17" y="3" width="4" height="18" rx="1" /></>,
  perfil: <><circle cx="12" cy="7" r="4.5" /><path d="M3.5 21a8.5 8.5 0 0 1 17 0Z" /></>,
  configuracoes: <path fillRule="evenodd" d="m9 2-.6 3-1.7 1L4 5l-3 5 2.5 2v2L1 16l3 5 2.7-1 1.7 1 .6 3h6l.6-3 1.7-1 2.7 1 3-5-2.5-2v-2L23 10l-3-5-2.7 1-1.7-1-.6-3Zm7 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" transform="translate(1 0) scale(.92)" />,
  help: <><path d="M3 12a9 9 0 0 1 18 0v6a4 4 0 0 1-4 4h-4v-2h4a2 2 0 0 0 2-2v-6a7 7 0 0 0-14 0v6H3Z" /><rect x="2" y="11" width="5" height="8" rx="2" /><rect x="17" y="11" width="5" height="8" rx="2" /></>,
  team: <><circle cx="9" cy="7" r="4" /><path d="M1 21a8 8 0 0 1 16 0Zm16-8a7 7 0 0 1 6 8h-4a10 10 0 0 0-2-8Z" /><path d="M15 3a4 4 0 0 1 0 8 6 6 0 0 0 0-8Z" /></>,
  company: <path fillRule="evenodd" d="M4 2h12a1 1 0 0 1 1 1v7h4a1 1 0 0 1 1 1v11h-9v-5H8v5H3V3a1 1 0 0 1 1-1Zm2 3v2h3V5Zm5 0v2h3V5Zm-5 5v2h3v-2Zm5 0v2h3v-2Zm7 3v2h2v-2Zm0 4v2h2v-2Z" />,
  security: <path fillRule="evenodd" d="m12 2 9 4v6c0 5-4 9-9 11-5-2-9-6-9-11V6Zm4.7 6.3a1 1 0 0 0-1.4 0L10 13.6l-2.3-2.3a1 1 0 0 0-1.4 1.4l3 3a1 1 0 0 0 1.4 0l6-6a1 1 0 0 0 0-1.4Z" />,
}

export default function SidebarSculptedIcon({ kind }: { kind: SidebarSymbol }) {
  const id = useId()
  return (
    <svg viewBox="0 0 24 26" className="h-7 w-7 shrink-0 overflow-visible" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-metal`} gradientUnits="userSpaceOnUse" x1="4" y1="2" x2="18" y2="24">
          <stop offset="0" stopColor="#ecf5ff" />
          <stop offset=".35" stopColor="#a9cbee" />
          <stop offset=".7" stopColor="#759cc5" />
          <stop offset="1" stopColor="#47698e" />
        </linearGradient>
        <g id={`${id}-symbol`}>{symbols[kind]}</g>
      </defs>
      <use href={`#${id}-symbol`} fill="#192d46" transform="translate(0 1)" />
      <use href={`#${id}-symbol`} fill={`url(#${id}-metal)`} />
    </svg>
  )
}
