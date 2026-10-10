import { useMemo, useSyncExternalStore } from 'react'
import { useAuth } from '../../auth/AuthContext'

export const defaultCompanySettings = {
  name: 'Empresa',
  contactEmail: '',
  contactName: 'Responsável',
  accountEmail: '',
}
export type CompanySettings = typeof defaultCompanySettings
const eventName = 'etp-company-settings-changed'
const keyFor = (id: string | null) => `etp-company-settings:${id ?? 'none'}`
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(eventName, callback)
  return () => { window.removeEventListener('storage', callback); window.removeEventListener(eventName, callback) }
}
export function useCompanySettings(companyId: string | null, companyName?: string) {
  const { user } = useAuth()
  const storageKey = keyFor(companyId ? `${companyId}:${user?.id}` : null)
  const raw = useSyncExternalStore(subscribe, () => {
    try { return companyId ? localStorage.getItem(storageKey) : null } catch { return null }
  }, () => null)
  const settings = useMemo(() => {
    const defaults = { ...defaultCompanySettings, name: companyName ?? defaultCompanySettings.name,
      contactName: user?.nome ?? defaultCompanySettings.contactName,
      accountEmail: user?.email ?? defaultCompanySettings.accountEmail }
    try {
      const data: unknown = JSON.parse(raw ?? 'null')
      if (!data || typeof data !== 'object') return defaults
      const stored = data as Record<string, unknown>
      return { ...Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [
        key, typeof stored[key] === 'string' && stored[key].trim() ? stored[key] : fallback,
      ])), accountEmail: defaults.accountEmail } as CompanySettings
    } catch { return defaults }
  }, [raw, user, companyName])
  function save(next: CompanySettings) {
    if (!companyId) throw new Error('Empresa não identificada')
    localStorage.setItem(storageKey, JSON.stringify(next))
    window.dispatchEvent(new Event(eventName))
  }
  return { settings, save }
}
