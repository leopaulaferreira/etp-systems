import { useEffect, useState, type ReactNode } from 'react'
import { AccessibilityContext, accessibilityDefaults, readAccessibility, ACCESSIBILITY_STORAGE_KEY } from './accessibility'
import './accessibility.css'

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readAccessibility)
  useEffect(() => {
    document.documentElement.classList.toggle('etp-larger-text', preferences.largerText)
    document.documentElement.classList.toggle('etp-reduced-motion', preferences.reducedMotion)
    try { localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(preferences)) } catch { /* Sessão em memória. */ }
  }, [preferences])
  return <AccessibilityContext.Provider value={{ preferences, update: (changes) => setPreferences((current) => ({ ...current, ...changes })), reset: () => setPreferences(accessibilityDefaults) }}>{children}</AccessibilityContext.Provider>
}
