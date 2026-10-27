import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Accessibility, Bell, BookOpen, Check, ChevronRight, LockKeyhole, Target, Play, FileText, PencilLine,
  Mail, Settings, ShieldCheck, UserRound, LogOut, Download, Trash2, ArrowUpRight, Building2, Save, Monitor, Type, MousePointer2,
  type LucideIcon,
} from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import { SettingsToggle, SettingsPanel, SettingsNote, SettingsHeading } from './SettingsUi'
import { useAssessments } from '../../assessments/AssessmentContext'
import { hasUnsavedAnswers } from '../../assessments/unsavedAnswers'
import PageHero from '../../components/ui/PageHero'
import { useProfile } from '../../profile/ProfileContext'
import { useAuth } from '../../auth/AuthContext'
import { useAccessibility } from '../../preferences/accessibility'
import CertificateDialog from '../Certificados/components/CertificateDialog'

type Section = 'conta' | 'seguranca' | 'notificacoes' | 'estudo' | 'acessibilidade' | 'privacidade'
type AccountDraft = {
  name: string
  phone: string
  location: string
  position: string
}
type StudySettings = {
  videos: boolean
  articles: boolean
  exercises: boolean
  studyReminders: boolean
  assessmentReminders: boolean
  courseReminders: boolean
}

const STORAGE_KEY = 'etp-study-settings-v1'
const objectives = ['Aprimorar habilidades profissionais', 'Preparar-me para uma nova função', 'Explorar novos temas']
const difficulties = ['Iniciante', 'Intermediário', 'Avançado']
const defaultStudy: StudySettings = {
  videos: true,
  articles: true,
  exercises: true,
  studyReminders: true,
  assessmentReminders: false,
  courseReminders: false,
}
const sections: Array<{ id: Section; label: string; icon: LucideIcon; description: string }> = [
  { id: 'estudo', label: 'Preferências de estudo', icon: BookOpen, description: 'Defina seus objetivos e registre como você prefere aprender.' },
  { id: 'conta', label: 'Conta', icon: UserRound, description: 'Mantenha seus dados pessoais e profissionais atualizados.' },
  { id: 'notificacoes', label: 'Notificações', icon: Bell, description: 'Organize suas preferências de avisos e lembretes.' },
  { id: 'acessibilidade', label: 'Acessibilidade', icon: Accessibility, description: 'Ajuste a leitura e os movimentos da interface ao seu conforto.' },
  { id: 'seguranca', label: 'Segurança', icon: ShieldCheck, description: 'Consulte seu acesso e gerencie a sessão atual.' },
  { id: 'privacidade', label: 'Privacidade', icon: LockKeyhole, description: 'Consulte uma cópia do seu perfil e gerencie suas personalizações.' },
]

const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400'
const actionBase = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`
const actionClass = `${actionBase} border-ink-200 text-brand-blue-400 hover:bg-brand-blue-500/10`
const reminderOptions = [
  ['studyReminders', 'Lembretes de estudo', 'Reserve um momento para continuar seu curso.'],
  ['assessmentReminders', 'Avaliações', 'Confira suas avaliações disponíveis.'],
  ['courseReminders', 'Novos cursos ou trilhas recomendadas', 'Explore novos conteúdos no catálogo.'],
] as const
const inputClass = 'min-h-11 w-full rounded-xl border border-ink-200 bg-panel-alt px-3.5 text-xs text-ink-900 outline-none transition-colors focus-visible:border-brand-blue-400 focus-visible:ring-2 focus-visible:ring-brand-blue-400/20'

function readStudySettings(storageKey: string): StudySettings {
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null')
    if (saved && typeof saved === 'object') {
      const values = saved as Record<string, unknown>
      return {
        videos: typeof values.videos === 'boolean' ? values.videos : defaultStudy.videos,
        articles: typeof values.articles === 'boolean' ? values.articles : defaultStudy.articles,
        exercises: typeof values.exercises === 'boolean' ? values.exercises : defaultStudy.exercises,
        studyReminders: typeof values.studyReminders === 'boolean' ? values.studyReminders : defaultStudy.studyReminders,
        assessmentReminders: typeof values.assessmentReminders === 'boolean' ? values.assessmentReminders : defaultStudy.assessmentReminders,
        courseReminders: typeof values.courseReminders === 'boolean' ? values.courseReminders : defaultStudy.courseReminders,
      }
    }
  } catch {
    // O protótipo continua utilizável quando o armazenamento está indisponível.
  }
  return { ...defaultStudy }
}

export default function ConfiguracoesPage() {
  const { profile, updateProfile, resetProfile } = useProfile()
  const { logout, user } = useAuth()
  const { assessments } = useAssessments()
  const studyStorageKey = `${STORAGE_KEY}:${user?.id}`
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const accessibility = useAccessibility()
  const [confirmation, setConfirmation] = useState<'logout' | 'reset' | null>(null)
  const [feedback, setFeedback] = useState('')
  const requestedSection = searchParams.get('secao')
  const selected = sections.find((section) => section.id === requestedSection)?.id ?? 'estudo'
  function setSelected(section: Section) { setSearchParams({ secao: section }, { replace: true }) }
  const [accountDraftState, setAccount] = useState<Partial<AccountDraft> | null>(null)
  const account: AccountDraft = { name: profile.name, phone: profile.phone, location: profile.location, position: profile.position, ...accountDraftState }
  const [study, setStudy] = useState(() => readStudySettings(studyStorageKey))
  const [learningDraft, setLearningDraft] = useState<Partial<Record<'learningFocus' | 'experienceLevel', { value: string; revision: number }>>>({})
  const learningRevision = useRef(0)
  const [saved, setSaved] = useState(false)
  const [notificationDraft, setNotificationDraft] = useState<boolean | null>(null)
  const [savingAccount, setSavingAccount] = useState(false)
  const [resetting, setResetting] = useState(false)
  const notificationsEnabled = notificationDraft ?? profile.notificationsEnabled
  const [accountError, setAccountError] = useState('')
  const accountDirty = (Object.keys(account) as Array<keyof AccountDraft>).some((key) => account[key].trim() !== profile[key].trim())
  const currentSection = sections.find(section => section.id === selected)!
  const unsavedAnswers = hasUnsavedAnswers(assessments)

  function changeAccount<K extends keyof AccountDraft>(key: K, value: AccountDraft[K]) {
    setAccount(current => ({ ...current, [key]: value }))
    setSaved(false)
    setAccountError('')
  }

  async function changeNotifications(checked: boolean) {
    setNotificationDraft(checked)
    setFeedback('Salvando preferência de notificações...')
    try {
      await updateProfile({ notificationsEnabled: checked })
      setFeedback('Preferência de notificações salva.')
    } catch { setFeedback('Não foi possível salvar a preferência. Tente novamente.') }
    finally { setNotificationDraft(null) }
  }

  function requestLogout() {
    if (accountDirty || unsavedAnswers) setConfirmation('logout')
    else { logout(); navigate('/login', { replace: true }) }
  }

  function changeStudy<K extends keyof StudySettings>(key: K, value: StudySettings[K]) {
    const next = { ...study, [key]: value }
    setStudy(next)
    try {
      window.localStorage.setItem(studyStorageKey, JSON.stringify(next))
      setFeedback('Preferências salvas neste navegador.')
    } catch { setFeedback('Preferências aplicadas nesta sessão; armazenamento indisponível.') }
    setSaved(false)
  }

  async function changeLearning(key: 'learningFocus' | 'experienceLevel', value: string) {
    const revision = ++learningRevision.current
    setLearningDraft((current) => ({ ...current, [key]: { value, revision } }))
    setFeedback('Salvando perfil de aprendizagem...')
    try {
      await updateProfile({ [key]: value })
      if (revision === learningRevision.current) setFeedback('Perfil de aprendizagem salvo.')
    } catch {
      if (revision === learningRevision.current) setFeedback('Não foi possível salvar o perfil de aprendizagem. Tente novamente.')
    } finally {
      setLearningDraft((current) => {
        if (current[key]?.revision !== revision) return current
        const next = { ...current }
        delete next[key]
        return next
      })
    }
  }

  function exportData() {
    try {
      const blob = new Blob([JSON.stringify({ profile, study, accessibility: accessibility.preferences }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'etp-meus-dados.json'
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setFeedback('Download dos dados solicitado.')
    } catch { setFeedback('Não foi possível baixar os dados. Tente novamente.') }
  }

  async function confirmAction() {
    if (confirmation === 'logout') {
      logout()
      navigate('/login', { replace: true })
      return
    }
    setResetting(true)
    try { await resetProfile(); setAccount(null); setLearningDraft({}) }
    catch { setFeedback('Não foi possível limpar o perfil. Tente novamente.'); setConfirmation(null); return }
    finally { setResetting(false) }
    setStudy({ ...defaultStudy })
    accessibility.reset()
    try {
      localStorage.removeItem(studyStorageKey)
      localStorage.removeItem('etp-login-email')
    } catch { /* Restaura a sessão em memória. */ }
    setSaved(false)
    setAccountError('')
    setConfirmation(null)
    setFeedback('Personalizações removidas. Preferências padrão restauradas.')
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accountDirty || savingAccount) return
    const changes = Object.fromEntries(Object.entries(accountDraftState ?? {}).map(([key, value]) => [key, value.trim()]))
    if (!account.name.trim()) { setAccountError('Informe um nome válido para salvar.'); return }
    setSavingAccount(true)
    try { await updateProfile(changes); setAccount(null); setSaved(true); setAccountError('') }
    catch { setAccountError('Não foi possível salvar seus dados. Tente novamente.') }
    finally { setSavingAccount(false) }
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
      <PageHero eyebrow="Sua experiência" icon={Settings} title="Configurações" description="Seu perfil, seu jeito de aprender e os ajustes que fazem diferença no dia a dia." />

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-6">
        <nav aria-label="Seções de configurações" className="min-w-0 rounded-[22px] border border-ink-200/70 bg-panel p-3 xl:p-4">
          <div className="mb-4 hidden border-b border-ink-200/60 pb-4 xl:block">
            <div className="flex items-center gap-3"><Avatar name={profile.name} email={profile.email} className="h-11 w-11 shrink-0" /><div className="min-w-0"><p className="break-words text-sm font-bold text-ink-900">{profile.name}</p><p className="mt-1 text-[11px] text-ink-500">Colaborador</p></div></div>
            <Link to="/perfil" className={`mt-3 flex min-h-11 items-center justify-between gap-2 rounded-lg text-xs font-semibold text-brand-blue-400 ${focusClass}`}>Ver meu perfil<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <label className="flex flex-col gap-2 text-xs font-semibold text-ink-500 sm:hidden">Seção de configurações
            <select className={inputClass} value={selected} onChange={event => { setSelected(event.target.value as Section); setFeedback('') }}>{sections.map(section => <option key={section.id} value={section.id}>{section.label}</option>)}</select>
          </label>
          <div className="hidden grid-cols-3 gap-1 sm:grid xl:flex xl:flex-col">
            {sections.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-current={selected === id ? 'true' : undefined} aria-controls="settings-panel" onClick={() => { setSelected(id); setFeedback('') }} className={`flex min-h-12 min-w-0 items-center gap-2.5 rounded-xl px-3 py-3 text-left text-xs font-semibold transition-colors ${focusClass} ${selected === id ? 'bg-brand-blue-500/15 text-brand-blue-400' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900'}`}><Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" /><span className="min-w-0 flex-1">{label}</span>{selected === id && <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 xl:block" aria-hidden="true" />}</button>)}
          </div>
        </nav>

        <div className="min-w-0 space-y-4">
          <section id="settings-panel" aria-labelledby="settings-title" className="min-w-0 space-y-5">
            <header className="px-1"><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-blue-400">{selected === 'estudo' ? 'Aprendizagem' : selected === 'acessibilidade' ? 'Conforto e leitura' : 'Preferências pessoais'}</p><h2 id="settings-title" className="text-xl font-extrabold tracking-tight text-ink-900">{currentSection.label}</h2><p className="mt-1 text-xs leading-5 text-ink-500">{currentSection.description}</p></header>

            {selected === 'estudo' && <>
              <SettingsPanel className="relative overflow-hidden border-brand-blue-400/20 bg-gradient-to-br from-brand-blue-500/10 via-panel to-panel">
                <SettingsHeading icon={Target} title="Sua direção de aprendizagem">Objetivo e nível ficam salvos na sua conta.</SettingsHeading>
                <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
                  <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-ink-700">Objetivo de aprendizagem
                    <select className={inputClass} value={learningDraft.learningFocus?.value ?? profile.learningFocus} onChange={event => { void changeLearning('learningFocus', event.target.value) }}>
                      <option value="">Não informado</option>
                      {profile.learningFocus && !objectives.includes(profile.learningFocus) && <option>{profile.learningFocus}</option>}
                      {objectives.map(objective => <option key={objective}>{objective}</option>)}
                    </select>
                  </label>
                  <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-ink-700">Nível de dificuldade preferido
                    <select className={inputClass} value={learningDraft.experienceLevel?.value ?? profile.experienceLevel} onChange={event => { void changeLearning('experienceLevel', event.target.value) }}>
                      <option value="">Não informado</option>
                      {profile.experienceLevel && !difficulties.includes(profile.experienceLevel) && <option>{profile.experienceLevel}</option>}
                      {difficulties.map(difficulty => <option key={difficulty}>{difficulty}</option>)}
                    </select>
                  </label>
                </div>
                <p className="mt-4 flex items-center gap-1.5 text-[11px] text-ink-500"><Check className="h-3.5 w-3.5" aria-hidden="true" />As alterações são salvas automaticamente.</p>
              </SettingsPanel>
              <div className="space-y-3">
                <div className="px-1"><h3 className="text-sm font-bold text-ink-900">Como você prefere aprender?</h3><p className="mt-1 text-xs leading-5 text-ink-500">Registre seus formatos preferidos neste navegador. A seleção não altera o catálogo.</p></div>
                <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                  {([
                    ['videos', 'Vídeos', 'Conteúdo audiovisual', Play],
                    ['articles', 'Artigos e textos', 'Leitura e consulta', FileText],
                    ['exercises', 'Exercícios práticos', 'Aplicação de conceitos', PencilLine],
                  ] as const).map(([key, label, detail, Icon]) => <label key={key} className={`grid min-w-0 cursor-pointer grid-cols-[40px_minmax(0,1fr)_44px] items-center gap-3 rounded-2xl border p-4 transition-colors sm:grid-cols-[minmax(0,1fr)_44px] ${study[key] ? 'border-brand-blue-400/40 bg-brand-blue-500/[0.07]' : 'border-ink-200/70 bg-panel hover:border-ink-400'}`}>
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${study[key] ? 'bg-brand-blue-500/15 text-brand-blue-400' : 'bg-panel-alt text-ink-500'}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="min-w-0 sm:col-span-2 sm:row-start-2"><span className="block text-xs font-bold text-ink-900">{label}</span><span className="mt-1 block text-[11px] leading-5 text-ink-500">{detail}</span></span>
                    <span className="sm:col-start-2 sm:row-start-1"><SettingsToggle label={label} checked={study[key]} onChange={checked => changeStudy(key, checked)} /></span>
                  </label>)}
                </div>
              </div>
              <button type="button" onClick={() => setSelected('notificacoes')} className={`group flex w-full items-center gap-3 rounded-2xl border border-ink-200/60 px-4 py-4 text-left hover:bg-panel ${focusClass}`}><Bell className="h-5 w-5 shrink-0 text-brand-blue-400" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-ink-700">Lembretes de aprendizagem</span><span className="mt-1 block text-xs leading-5 text-ink-500">Escolha os tipos de aviso e confira uma prévia em Notificações.</span></span><ArrowUpRight className="h-4 w-4 shrink-0 text-ink-500 group-hover:text-brand-blue-400" aria-hidden="true" /></button>
            </>}

            {selected === 'conta' && <form onSubmit={save} className="overflow-hidden rounded-[22px] border border-ink-200/70 bg-panel">
              <div className="flex items-center gap-4 border-b border-ink-200/60 bg-gradient-to-r from-brand-blue-500/10 to-transparent p-5 sm:p-6"><Avatar name={account.name || profile.name} email={profile.email} className="h-16 w-16 shrink-0" /><div className="min-w-0"><h3 className="break-words text-base font-extrabold text-ink-900">{account.name || profile.name}</h3><p className="mt-1 text-xs text-ink-500">Seu perfil na plataforma</p></div></div>
              <fieldset disabled={savingAccount} className="min-w-0 space-y-5 p-5 sm:p-6">
                <legend className="sr-only">Dados pessoais e profissionais</legend>
                <div className="grid min-w-0 gap-4 md:grid-cols-2">
                  {([
                    ['name', 'Nome completo', 'text', 'name', 'Seu nome'],
                    ['phone', 'Telefone', 'tel', 'tel', '(11) 99999-9999'],
                    ['position', 'Cargo', 'text', 'organization-title', 'Ex.: Analista de operações'],
                    ['location', 'Localização', 'text', 'address-level2', 'Ex.: São Caetano do Sul, SP'],
                  ] as const).map(([key, label, type, autoComplete, placeholder]) => <label key={key} className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-ink-700">{label}{key !== 'name' && <span className="sr-only"> (opcional)</span>}<input className={inputClass} type={type} autoComplete={autoComplete} value={account[key]} onChange={event => changeAccount(key, event.target.value)} required={key === 'name'} pattern={key === 'name' ? '.*\\S.*' : undefined} maxLength={80} placeholder={placeholder} /></label>)}
                </div>
                <p className="text-[11px] text-ink-500">Telefone, cargo e localização são opcionais.</p>
                <dl className="grid min-w-0 gap-4 border-t border-ink-200/60 pt-5 md:grid-cols-2">
                  <div><dt className="flex items-center gap-2 text-[11px] font-semibold text-ink-500"><Mail className="h-3.5 w-3.5" aria-hidden="true" />E-mail de acesso</dt><dd className="mt-2 break-all text-xs text-ink-700">{profile.email}</dd></div>
                  <div><dt className="flex items-center gap-2 text-[11px] font-semibold text-ink-500"><Building2 className="h-3.5 w-3.5" aria-hidden="true" />Empresa vinculada</dt><dd className="mt-2 break-words text-xs text-ink-700">{profile.company || 'Não informada'}</dd></div>
                </dl>
                <SettingsNote>E-mail e empresa são definidos no cadastro e estão disponíveis apenas para consulta.</SettingsNote>
                {accountError && <p role="alert" className="text-xs leading-5 text-rose-400">{accountError}</p>}
              </fieldset>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200/60 bg-panel-alt/30 px-5 py-4 sm:px-6"><p role="status" className={`text-xs ${saved ? 'text-brand-cyan-400' : accountDirty ? 'text-amber-200' : 'text-ink-500'}`}>{saved ? 'Alterações salvas.' : accountDirty ? 'Alterações não salvas' : 'Nenhuma alteração pendente'}</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setAccount(null); setSaved(false); setAccountError('') }} disabled={!accountDirty || savingAccount} className={actionClass}>Cancelar</button><button type="submit" disabled={!accountDirty || savingAccount} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue-600 px-4 py-3 text-xs font-bold text-white hover:bg-brand-blue-700 disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}><Save className="h-4 w-4" aria-hidden="true" />{savingAccount ? 'Salvando…' : 'Salvar alterações'}</button></div></div>
            </form>}

            {selected === 'notificacoes' && <>
              <SettingsPanel><label className="flex cursor-pointer items-center justify-between gap-4"><span className="min-w-0"><span className="block text-sm font-bold text-ink-900">Mostrar avisos no cabeçalho</span><span className="mt-1 block text-xs leading-5 text-ink-500">Preferência vinculada à sua conta, salva automaticamente.</span></span><SettingsToggle label="Mostrar avisos no cabeçalho" checked={notificationsEnabled} disabled={notificationDraft !== null} onChange={checked => { void changeNotifications(checked) }} /></label></SettingsPanel>
              <div className="grid min-w-0 items-start gap-5 md:grid-cols-2">
                <SettingsPanel><h3 className="text-sm font-bold text-ink-900">Tipos de lembrete</h3><p className="mt-1 text-xs leading-5 text-ink-500">Preferências salvas neste navegador.</p><div className="mt-3 divide-y divide-ink-200/60">{reminderOptions.map(([key, label, description]) => <label key={key} className="flex cursor-pointer items-center justify-between gap-4 py-4"><span className="min-w-0"><span className="block text-xs font-semibold text-ink-700">{label}</span><span className="mt-1 block text-xs leading-5 text-ink-500">{description}</span></span><SettingsToggle label={label} checked={study[key]} onChange={checked => changeStudy(key, checked)} /></label>)}</div></SettingsPanel>
                <SettingsPanel className="border-brand-blue-400/20 bg-gradient-to-br from-brand-blue-500/10 to-panel"><div className="flex items-center gap-2"><Monitor className="h-4 w-4 text-brand-blue-400" aria-hidden="true" /><h3 className="text-sm font-bold text-ink-900">Prévia dos avisos</h3></div><p className="mt-2 text-xs leading-5 text-ink-500">Exemplos dos tipos escolhidos. Não há envio de e-mails ou notificações push.</p>{notificationsEnabled && reminderOptions.some(([key]) => study[key]) ? <ul className="mt-4 space-y-3">{reminderOptions.filter(([key]) => study[key]).map(([key, label, message]) => <li key={key} className="flex items-start gap-3 rounded-xl border border-ink-200/70 bg-panel p-4"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-cyan-400" aria-hidden="true" /><div><p className="text-xs font-bold text-ink-700">{label}</p><p className="mt-1 text-xs leading-5 text-ink-500">{message}</p></div></li>)}</ul> : <p className="mt-5 rounded-xl border border-dashed border-ink-400/50 p-4 text-xs leading-5 text-ink-500">{notificationsEnabled ? 'Nenhum tipo de aviso selecionado.' : 'Os avisos estão desativados.'}</p>}</SettingsPanel>
              </div>
            </>}

            {selected === 'acessibilidade' && <>
              <SettingsPanel><div className="divide-y divide-ink-200/60">{([
                ['largerText', 'Texto ampliado', 'Aumenta a escala de leitura e dos controles da plataforma.', Type],
                ['reducedMotion', 'Reduzir animações', 'Diminui os movimentos e as transições durante a navegação.', MousePointer2],
              ] as const).map(([key, label, description, Icon]) => <label key={key} className="flex cursor-pointer items-center gap-3 py-4 first:pt-0 last:pb-0"><Icon className="hidden h-5 w-5 shrink-0 text-brand-blue-400 sm:block" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink-900">{label}</span><span className="mt-1 block text-xs leading-5 text-ink-500">{description}</span></span><SettingsToggle label={label} checked={accessibility.preferences[key]} onChange={checked => { accessibility.update({ [key]: checked }); setFeedback('Ajuste de acessibilidade aplicado.') }} /></label>)}</div></SettingsPanel>
              <SettingsPanel className="border-brand-blue-400/20 bg-gradient-to-br from-brand-blue-500/[0.07] to-panel"><p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue-400">Conforto de leitura</p><h3 className="mt-3 text-lg font-bold text-ink-900">Aprenda no seu ritmo.</h3><p className="mt-2 max-w-xl text-sm leading-7 text-ink-700">Os ajustes são aplicados imediatamente. Experimente o texto ampliado e escolha a apresentação mais confortável para continuar seus estudos.</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-lg border border-ink-200 bg-panel px-3 py-2 text-xs text-ink-500">Texto: {accessibility.preferences.largerText ? 'ampliado' : 'padrão'}</span><span className="rounded-lg border border-ink-200 bg-panel px-3 py-2 text-xs text-ink-500">Movimentos: {accessibility.preferences.reducedMotion ? 'reduzidos' : 'padrão'}</span></div></SettingsPanel>
              <div className="px-1"><SettingsNote>Esses ajustes valem para este navegador. Use Tab para navegar entre os controles e Espaço para ativá-los.</SettingsNote></div>
            </>}

            {selected === 'seguranca' && <>
              <SettingsPanel className="border-brand-cyan-400/20 bg-gradient-to-br from-brand-cyan-400/[0.08] to-panel"><div className="flex flex-wrap items-start justify-between gap-3"><SettingsHeading icon={ShieldCheck} title="Você está conectado">Acesso ao seu espaço de aprendizagem.</SettingsHeading><span className="inline-flex items-center gap-1.5 rounded-full border border-brand-cyan-400/20 px-3 py-1 text-[10px] font-semibold text-brand-cyan-400"><span className="h-1.5 w-1.5 rounded-full bg-brand-cyan-400" aria-hidden="true" />Sessão ativa</span></div><dl className="mt-5 grid gap-4 border-t border-ink-200/60 pt-4 md:grid-cols-2"><div><dt className="text-[11px] text-ink-500">E-mail de acesso</dt><dd className="mt-1.5 break-all text-xs font-semibold text-ink-700">{profile.email}</dd></div><div><dt className="text-[11px] text-ink-500">Perfil de acesso</dt><dd className="mt-1.5 text-xs font-semibold text-ink-700">Colaborador</dd></div></dl></SettingsPanel>
              <SettingsPanel><SettingsHeading icon={LockKeyhole} title="Senha de acesso">A alteração de senha ainda não está disponível nesta versão.</SettingsHeading></SettingsPanel>
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-rose-400/20 bg-rose-400/[0.03] p-5 sm:p-6"><div className="min-w-0 flex-1 basis-52"><h3 className="text-sm font-bold text-ink-900">Encerrar esta sessão</h3><p className="mt-1 text-xs leading-5 text-ink-500">Você sairá da conta nesta aba. Entre novamente para continuar.</p></div><button type="button" onClick={requestLogout} className={`${actionBase} border-rose-400/30 text-rose-300 hover:bg-rose-400/10`}><LogOut className="h-4 w-4" aria-hidden="true" />Sair da conta</button></div>
            </>}

            {selected === 'privacidade' && <>
              <SettingsPanel><SettingsHeading icon={Download} title="Uma cópia do seu perfil">Baixe os dados do perfil e suas preferências em um arquivo JSON.</SettingsHeading><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-ink-200/60 bg-panel-alt/40 p-4"><p className="text-xs font-bold text-ink-700">Incluído no arquivo</p><p className="mt-1 text-xs leading-5 text-ink-500">Dados do perfil, preferências de estudo e ajustes de acessibilidade.</p></div><div className="rounded-xl border border-ink-200/60 bg-panel-alt/40 p-4"><p className="text-xs font-bold text-ink-700">Outros registros</p><p className="mt-1 text-xs leading-5 text-ink-500">Cursos, avaliações e certificados podem ser consultados nas respectivas páginas.</p></div></div><button type="button" onClick={exportData} className={`${actionClass} mt-5`}><Download className="h-4 w-4" aria-hidden="true" />Baixar dados</button></SettingsPanel>
              <div className="rounded-[22px] border border-amber-400/20 bg-amber-400/[0.03] p-5 sm:p-6"><SettingsHeading icon={Trash2} title="Recomeçar suas personalizações">Limpa telefone, cargo, localização, objetivo e nível do perfil. Restaura as preferências de notificações, estudo e acessibilidade.</SettingsHeading><p className="mt-4 text-xs leading-5 text-ink-500">Seu nome, sua conta e seus registros de aprendizagem são preservados.</p><button type="button" onClick={() => setConfirmation('reset')} className={`${actionBase} mt-4 border-amber-400/30 text-amber-200 hover:bg-amber-400/10`}>Limpar personalizações</button></div>
            </>}
          </section>

          <p role="status" className={feedback ? `rounded-xl border px-4 py-3 text-xs leading-5 ${feedback.startsWith('Não foi') ? 'border-rose-400/20 bg-rose-400/5 text-rose-300' : 'border-brand-blue-400/20 bg-brand-blue-400/5 text-brand-blue-400'}` : 'sr-only'}>{feedback}</p>
          {selected !== 'conta' && accountDirty && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3"><p className="text-xs leading-5 text-amber-200">Você tem alterações não salvas nos dados da conta.</p><button type="button" onClick={() => setSelected('conta')} className={actionClass}>Revisar alterações</button></div>}
        </div>
      </div>
      {confirmation && <CertificateDialog title={confirmation === 'logout' ? 'Sair sem salvar?' : 'Limpar personalizações?'} onClose={() => { if (!resetting) setConfirmation(null) }}>
        <p className="text-sm leading-6 text-ink-500">{confirmation === 'logout' ? 'As alterações não salvas da conta e as respostas de avaliações ainda não enviadas serão descartadas.' : 'Os campos opcionais e as preferências de aprendizagem do perfil serão restaurados, assim como os ajustes deste navegador. Sua conta, cursos e certificados serão mantidos.'}</p>
        <div className="flex flex-wrap justify-end gap-2"><button type="button" disabled={resetting} onClick={() => setConfirmation(null)} className={actionClass}>Cancelar</button><button type="button" disabled={resetting} onClick={confirmAction} className={actionClass}>{confirmation === 'logout' ? 'Sair da conta' : resetting ? 'Limpando…' : 'Confirmar limpeza'}</button></div>
      </CertificateDialog>}
    </div>
  )
}
