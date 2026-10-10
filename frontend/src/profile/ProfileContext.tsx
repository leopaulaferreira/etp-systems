import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { fetchProfile, saveProfile, type CurrentUser, type EditableProfile } from './profileApi'

type ProfileContextValue = {
  profile: CurrentUser
  updateProfile: (changes: Partial<EditableProfile>) => Promise<void>
  resetProfile: () => Promise<CurrentUser>
}

const ProfileContext = createContext<ProfileContextValue | null>(null)
const emptyProfile: CurrentUser = {
  name: '', role: 'Colaborador', notificationCount: 0, email: '', location: '', memberSince: '',
  birthDate: '', phone: '', position: '', company: '', learningFocus: '', experienceLevel: '',
  notificationsEnabled: true, language: 'Português (Brasil)',
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loaded, setLoaded] = useState<{ id: string; profile: CurrentUser } | null>(null)
  const base: CurrentUser = { ...emptyProfile, name: user?.nome ?? '', email: user?.email ?? '',
    role: user?.perfil === 'EMPRESA' ? 'Empresa / RH' : 'Colaborador' }
  const profile = loaded && loaded.id === user?.id ? loaded.profile : base

  useEffect(() => {
    if (!user || user.perfil !== 'COLABORADOR') return
    const controller = new AbortController()
    fetchProfile(controller.signal).then((data) => {
      if (!controller.signal.aborted) setLoaded({ id: user.id, profile: data })
    }).catch(() => { /* A identidade da sessão continua visível se o perfil não carregar. */ })
    return () => controller.abort()
  }, [user])

  async function updateProfile(changes: Partial<EditableProfile>) {
    if (!user || user.perfil !== 'COLABORADOR') return
    const current = loaded?.id === user.id ? loaded.profile : await fetchProfile()
    const saved = await saveProfile({
      name: changes.name ?? current.name, phone: changes.phone ?? current.phone,
      location: changes.location ?? current.location, position: changes.position ?? current.position,
      learningFocus: changes.learningFocus ?? current.learningFocus,
      experienceLevel: changes.experienceLevel ?? current.experienceLevel,
      notificationsEnabled: changes.notificationsEnabled ?? current.notificationsEnabled,
    })
    setLoaded({ id: user.id, profile: saved })
  }

  async function resetProfile(): Promise<CurrentUser> {
    if (!user || user.perfil !== 'COLABORADOR') return base
    const current = loaded?.id === user.id ? loaded.profile : await fetchProfile()
    const saved = await saveProfile({ name: current.name, phone: '', location: '', position: '',
      learningFocus: '', experienceLevel: '', notificationsEnabled: true })
    setLoaded({ id: user.id, profile: saved })
    return saved
  }

  return <ProfileContext.Provider value={{ profile, updateProfile, resetProfile }}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) throw new Error('useProfile deve ser usado dentro de ProfileProvider')
  return context
}
