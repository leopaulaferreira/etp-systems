import { useMemo, useSyncExternalStore } from 'react'
import { company } from '../../mocks/company.mock'

export const defaultCompanySettings = {
  name: company.name,
  contactEmail: 'contato@etp.example',
  contactName: company.contactName,
  accountEmail: 'mariana@etp.example',
}
export type CompanySettings = typeof defaultCompanySettings
const eventName = 'etp-company-settings-changed'
const keyFor = (id: string | null) => `etp-company-settings:${id ?? 'none'}`
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(eventName, callback)
  return () => { window.removeEventListener('storage', callback); window.removeEventListener(eventName, callback) }
}
export function useCompanySettings(companyId: string | null) {
  const raw = useSyncExternalStore(subscribe, () => {
    try { return companyId ? localStorage.getItem(keyFor(companyId)) : null } catch { return null }
  }, () => null)
  const settings = useMemo(() => {
    try {
      const data: unknown = JSON.parse(raw ?? 'null')
      if (!data || typeof data !== 'object') return defaultCompanySettings
      const stored = data as Record<string, unknown>
      return Object.fromEntries(Object.entries(defaultCompanySettings).map(([key, fallback]) => [
        key, typeof stored[key] === 'string' && stored[key].trim() ? stored[key] : fallback,
      ])) as CompanySettings
    } catch { return defaultCompanySettings }
  }, [raw])
  function save(next: CompanySettings) {
    if (!companyId) throw new Error('Empresa não identificada')
    localStorage.setItem(keyFor(companyId), JSON.stringify(next))
    window.dispatchEvent(new Event(eventName))
  }
  return { settings, save }
}
