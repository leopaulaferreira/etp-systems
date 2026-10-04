import { createContext, useContext } from 'react'

export const ACCESSIBILITY_STORAGE_KEY = 'etp-accessibility-v1'
type Preferences = { largerText: boolean; reducedMotion: boolean }
export const accessibilityDefaults: Preferences = { largerText: false, reducedMotion: false }
export const AccessibilityContext = createContext<{
  preferences: Preferences
  update: (changes: Partial<Preferences>) => void
  reset: () => void
} | null>(null)

export function readAccessibility(): Preferences {
  try {
    const value = JSON.parse(localStorage.getItem(ACCESSIBILITY_STORAGE_KEY) ?? 'null')
    return { largerText: value?.largerText === true, reducedMotion: value?.reducedMotion === true }
  } catch { return accessibilityDefaults }
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) throw new Error('useAccessibility requer AccessibilityProvider')
  return context
}
