import { useState, type FormEvent } from 'react'
import CertificateDialog from '../../Certificados/components/CertificateDialog'
import { useProfile } from '../../../profile/ProfileContext'

const inputClass = 'min-h-10 w-full rounded-xl border border-ink-200 bg-panel-alt px-3 text-sm text-ink-900 outline-none focus-visible:border-brand-blue-400 focus-visible:ring-2 focus-visible:ring-brand-blue-400/20'

export default function ProfileEditDialog({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile } = useProfile()
  const [draft, setDraft] = useState(profile)

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateProfile({
      name: draft.name.trim(),
      email: draft.email.trim(),
      location: draft.location.trim(),
      birthDate: draft.birthDate,
      phone: draft.phone.trim(),
      position: draft.position.trim(),
      company: draft.company.trim(),
      learningFocus: draft.learningFocus.trim(),
      experienceLevel: draft.experienceLevel,
      notificationsEnabled: draft.notificationsEnabled,
      language: draft.language,
    })
    onClose()
  }

  return (
    <CertificateDialog title="Editar perfil" onClose={onClose}>
      <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {([
          ['name', 'Nome completo', 'text'],
          ['email', 'E-mail', 'email'],
          ['location', 'Localização', 'text'],
          ['birthDate', 'Data de nascimento', 'date'],
          ['phone', 'Telefone', 'tel'],
          ['position', 'Cargo', 'text'],
          ['company', 'Empresa', 'text'],
          ['learningFocus', 'Área de interesse', 'text'],
        ] as const).map(([key, label, type]) => (
          <label key={key} className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-ink-500">
            {label}
            <input
              className={inputClass}
              type={type}
              value={draft[key]}
              onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
              required={key === 'name' || key === 'email'}
              maxLength={key === 'email' ? 120 : 80}
            />
          </label>
        ))}
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-500">
          Nível de experiência
          <select
            className={inputClass}
            value={draft.experienceLevel}
            onChange={(event) => setDraft((current) => ({ ...current, experienceLevel: event.target.value }))}
          >
            <option>Iniciante</option>
            <option>Intermediário</option>
            <option>Avançado</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-500">
          Idioma
          <select
            className={inputClass}
            value={draft.language}
            onChange={(event) => setDraft((current) => ({ ...current, language: event.target.value }))}
          >
            <option>Português (Brasil)</option>
            <option>English</option>
            <option>Español</option>
          </select>
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-ink-200 bg-panel-alt px-3 py-3 text-sm font-medium text-ink-700 sm:col-span-2">
          <input
            type="checkbox"
            checked={draft.notificationsEnabled}
            onChange={(event) => setDraft((current) => ({ ...current, notificationsEnabled: event.target.checked }))}
            className="h-4 w-4 accent-brand-blue-500"
          />
          Mostrar notificações no cabeçalho
        </label>
        <div className="flex justify-end gap-2 border-t border-ink-100 pt-4 sm:col-span-2">
          <button type="button" onClick={onClose} className="min-h-10 rounded-xl border border-ink-200 px-4 text-sm font-bold text-ink-700 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">
            Cancelar
          </button>
          <button type="submit" className="min-h-10 rounded-xl bg-brand-blue-600 px-4 text-sm font-bold text-white hover:bg-brand-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">
            Salvar alterações
          </button>
        </div>
      </form>
    </CertificateDialog>
  )
}
