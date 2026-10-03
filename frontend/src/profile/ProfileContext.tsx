import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { currentUser, type CurrentUser } from '../mocks/user.mock'

const STORAGE_KEY = 'etp-profile-v1'
type EditableProfile = Pick<CurrentUser, 'name' | 'email' | 'location' | 'birthDate' | 'phone' | 'position' | 'company' | 'learningFocus' | 'experienceLevel' | 'notificationsEnabled' | 'language'>
type ProfileContextValue = {
  profile: CurrentUser
  updateProfile: (changes: Partial<EditableProfile>) => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

function readProfile(): CurrentUser {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data: unknown = JSON.parse(saved)
      if (data && typeof data === 'object') {
        const entries = Object.entries(data).filter(([key, value]) =>
          key in currentUser && typeof value === typeof currentUser[key as keyof CurrentUser],
        )
        return { ...currentUser, ...Object.fromEntries(entries) }
      }
    }
  } catch {
    // Armazenamento indisponível: usa o perfil demonstrativo.
  }
  return currentUser
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(readProfile)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // A edição ainda funciona durante esta sessão.
    }
  }, [profile])

  return (
    <ProfileContext.Provider value={{ profile, updateProfile: (changes) => setProfile((current) => ({ ...current, ...changes })) }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) throw new Error('useProfile deve ser usado dentro de ProfileProvider')
  return context
}
