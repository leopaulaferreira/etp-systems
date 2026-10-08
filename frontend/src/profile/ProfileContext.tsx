import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { currentUser, type CurrentUser } from '../mocks/user.mock'
import { useAuth } from '../auth/AuthContext'

const STORAGE_KEY = 'etp-profile-v1'
type EditableProfile = Pick<CurrentUser, 'name' | 'email' | 'location' | 'birthDate' | 'phone' | 'position' | 'company' | 'learningFocus' | 'experienceLevel' | 'notificationsEnabled' | 'language'>
type ProfileContextValue = {
  profile: CurrentUser
  updateProfile: (changes: Partial<EditableProfile>) => void
  resetProfile: () => CurrentUser
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

function readProfile(base: CurrentUser, storageKey: string | null): CurrentUser {
  if (!storageKey) return base
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (saved) {
      const data: unknown = JSON.parse(saved)
      if (data && typeof data === 'object') {
        const entries = Object.entries(data).filter(([key, value]) =>
          key in currentUser && typeof value === typeof currentUser[key as keyof CurrentUser],
        )
        return { ...base, ...Object.fromEntries(entries), email: base.email, role: base.role }
      }
    }
  } catch {
    // Armazenamento indisponível: usa o perfil demonstrativo.
  }
  return base
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const base: CurrentUser = user ? { ...currentUser, name: user.nome, email: user.email,
    role: user.perfil === 'EMPRESA' ? 'Empresa / RH' : 'Colaborador' } : currentUser
  const storageKey = user ? `${STORAGE_KEY}:${user.id}` : null
  const [profile, setProfile] = useState(() => readProfile(base, storageKey))

  useEffect(() => {
    if (!storageKey) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(profile))
    } catch {
      // A edição ainda funciona durante esta sessão.
    }
  }, [profile, storageKey])

  return (
    <ProfileContext.Provider value={{ profile,
      updateProfile: (changes) => setProfile((current) => ({ ...current, ...changes, email: base.email })),
      resetProfile: () => { setProfile(base); return base },
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) throw new Error('useProfile deve ser usado dentro de ProfileProvider')
  return context
}
