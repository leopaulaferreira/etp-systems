import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { fetchProfile, saveProfile, type CurrentUser, type EditableProfile } from './profileApi'
import { createProfileEditor } from './profileEditor'

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
  // App remonta este provider quando a conta muda.
  const [editor] = useState(() => createProfileEditor({ read: fetchProfile, save: saveProfile },
    (profile) => { if (user) setLoaded({ id: user.id, profile }) }))
  const lifecycle = useRef<AbortController | null>(null)
  const base: CurrentUser = { ...emptyProfile, name: user?.nome ?? '', email: user?.email ?? '',
    role: user?.perfil === 'EMPRESA' ? 'Empresa / RH' : 'Colaborador' }
  const profile = loaded && loaded.id === user?.id ? loaded.profile : base

  useEffect(() => {
    if (!user || user.perfil !== 'COLABORADOR') return
    const controller = new AbortController()
    lifecycle.current = controller
    editor.load(controller.signal)
      .catch(() => { /* A identidade da sessão continua visível se o perfil não carregar. */ })
    return () => controller.abort()
  }, [user, editor])

  async function updateProfile(changes: Partial<EditableProfile>) {
    if (!user || user.perfil !== 'COLABORADOR') return
    await editor.update(changes, lifecycle.current?.signal)
  }

  async function resetProfile(): Promise<CurrentUser> {
    if (!user || user.perfil !== 'COLABORADOR') return base
    return editor.reset(lifecycle.current?.signal)
  }

  return <ProfileContext.Provider value={{ profile, updateProfile, resetProfile }}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) throw new Error('useProfile deve ser usado dentro de ProfileProvider')
  return context
}
