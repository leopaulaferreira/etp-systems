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
const optionalFields = ['location', 'birthDate', 'phone', 'position', 'company', 'learningFocus', 'experienceLevel'] as const
const emptyProfile: CurrentUser = {
  ...currentUser,
  notificationCount: 0,
  memberSince: '',
  location: '', birthDate: '', phone: '', position: '', company: '',
  learningFocus: '', experienceLevel: '',
}

function readProfile(base: CurrentUser, storageKey: string | null): CurrentUser {
  if (!storageKey) return base
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (saved) {
      const data: unknown = JSON.parse(saved)
      if (data && typeof data === 'object') {
        const entries = Object.entries(data).filter(([key, value]) => {
          if (!['name', ...optionalFields, 'notificationsEnabled', 'language'].includes(key)) return false
          if (typeof value !== typeof base[key as keyof CurrentUser]) return false
          // A versão anterior persistia os exemplos do protótipo mesmo sem edição.
          if (optionalFields.some((field) => field === key) && value === currentUser[key as keyof CurrentUser]) return false
          return true
        })
        return { ...base, ...Object.fromEntries(entries) }
      }
    }
  } catch {
    // Armazenamento indisponível: mantém os dados da sessão em memória.
  }
  return base
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const base: CurrentUser = user ? { ...emptyProfile, name: user.nome, email: user.email,
    role: user.perfil === 'EMPRESA' ? 'Empresa / RH' : 'Colaborador' } : emptyProfile
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
