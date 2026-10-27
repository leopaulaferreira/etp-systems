import type { ReactNode } from 'react'
import { Info, type LucideIcon } from 'lucide-react'

export function SettingsToggle({ label, checked, onChange, disabled = false }: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center">
    <input type="checkbox" role="switch" aria-label={label} checked={checked} disabled={disabled} onChange={event => onChange(event.target.checked)} className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-wait" />
    <span aria-hidden="true" className={`relative h-6 w-11 rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-cyan-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-panel peer-disabled:opacity-50 ${checked ? 'border-brand-blue-500 bg-brand-blue-600' : 'border-ink-400 bg-ink-200'}`}>
      <span className={`absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${checked ? 'translate-x-5' : ''}`} />
    </span>
  </span>
}

export function SettingsPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-[22px] border border-ink-200/70 bg-panel p-5 sm:p-6 ${className}`}>{children}</div>
}

export function SettingsNote({ children }: { children: ReactNode }) {
  return <p className="flex items-start gap-2 text-xs leading-5 text-ink-500"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{children}</span></p>
}

export function SettingsHeading({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: ReactNode }) {
  return <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-blue-400/20 bg-brand-blue-400/10 text-brand-blue-400"><Icon className="h-5 w-5" aria-hidden="true" /></span><div className="min-w-0"><h3 className="text-sm font-bold text-ink-900">{title}</h3>{children && <p className="mt-1 text-xs leading-5 text-ink-500">{children}</p>}</div></div>
}
