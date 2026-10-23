import type { CurrentUser, EditableProfile } from './profileApi.ts'

type ProfileApi = {
  read: (signal?: AbortSignal) => Promise<CurrentUser>
  save: (profile: EditableProfile, signal?: AbortSignal) => Promise<CurrentUser>
}

/** Ordena leituras e gravações para que cada alteração use o último perfil salvo. */
export function createProfileEditor(api: ProfileApi, publish: (profile: CurrentUser) => void) {
  let current: CurrentUser | null = null
  let pending: Promise<unknown> = Promise.resolve()

  function enqueue(operation: () => Promise<CurrentUser>, signal?: AbortSignal) {
    const result = pending.then(async () => {
      signal?.throwIfAborted()
      const profile = await operation()
      signal?.throwIfAborted()
      current = profile
      publish(profile)
      return profile
    })
    // Uma falha não bloqueia as próximas alterações; releia após resultado incerto.
    pending = result.catch(() => { current = null })
    return result
  }

  function update(changes: Partial<EditableProfile>, signal?: AbortSignal) {
    return enqueue(async () => {
      const profile = current ?? await api.read(signal)
      signal?.throwIfAborted()
      return api.save({
        name: changes.name ?? profile.name, phone: changes.phone ?? profile.phone,
        location: changes.location ?? profile.location, position: changes.position ?? profile.position,
        learningFocus: changes.learningFocus ?? profile.learningFocus,
        experienceLevel: changes.experienceLevel ?? profile.experienceLevel,
        notificationsEnabled: changes.notificationsEnabled ?? profile.notificationsEnabled,
      }, signal)
    }, signal)
  }

  return {
    load: (signal?: AbortSignal) => enqueue(() => api.read(signal), signal),
    update,
    reset: (signal?: AbortSignal) => update({ phone: '', location: '', position: '',
      learningFocus: '', experienceLevel: '', notificationsEnabled: true }, signal),
  }
}
