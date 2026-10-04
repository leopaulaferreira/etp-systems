import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Accessibility, Bell, BookOpen, Check, ChevronRight, LockKeyhole, Target, Play, FileText, PencilLine,
  Mail, Settings, ShieldCheck, UserRound, LogOut, Download, Trash2,
  type LucideIcon,
} from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import IllustratedIcon from '../../components/ui/IllustratedIcon'
import PageHero from '../../components/ui/PageHero'
import { useProfile } from '../../profile/ProfileContext'
import { useAuth } from '../../auth/AuthContext'
import { useAccessibility } from '../../preferences/accessibility'
import { currentUser } from '../../mocks/user.mock'
import CertificateDialog from '../Certificados/components/CertificateDialog'

type Section = 'conta' | 'seguranca' | 'notificacoes' | 'estudo' | 'acessibilidade' | 'privacidade'
type AccountDraft = {
  name: string
  email: string
  phone: string
  location: string
  position: string
  company: string
  notificationsEnabled: boolean
}
type StudySettings = {
  objective: string
  difficulty: string
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
  objective: objectives[0],
  difficulty: difficulties[1],
  videos: true,
  articles: true,
  exercises: true,
  studyReminders: true,
  assessmentReminders: false,
  courseReminders: false,
}
const sections: Array<{ id: Section; label: string; icon: LucideIcon }> = [
  { id: 'conta', label: 'Conta', icon: UserRound },
  { id: 'seguranca', label: 'Segurança', icon: ShieldCheck },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'estudo', label: 'Preferências de estudo', icon: BookOpen },
  { id: 'acessibilidade', label: 'Acessibilidade', icon: Accessibility },
  { id: 'privacidade', label: 'Privacidade', icon: LockKeyhole },
]

const cardClass = 'min-w-0 rounded-[22px] border border-ink-200/70 bg-panel p-3 shadow-card sm:p-5 xl:p-6'
const actionClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-ink-200 px-3 text-xs font-bold text-brand-blue-400 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400'
const reminderOptions = [
  ['studyReminders', 'Lembretes de estudo', 'Reserve um momento para continuar seu curso.'],
  ['assessmentReminders', 'Avaliações', 'Confira suas avaliações disponíveis.'],
  ['courseReminders', 'Novos cursos ou trilhas recomendadas', 'Explore novos conteúdos no catálogo.'],
] as const
const inputClass = 'min-h-11 w-full rounded-xl border border-ink-200 bg-panel-alt px-3.5 text-xs text-ink-900 outline-none transition-colors focus-visible:border-brand-blue-400 focus-visible:ring-2 focus-visible:ring-brand-blue-400/20'

function SettingsToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <span className="relative inline-flex shrink-0 flex-col items-center gap-1">
      <input type="checkbox" role="switch" aria-label={label} checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span aria-hidden="true" className={`relative block h-6 w-11 rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-cyan-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-panel ${checked ? 'border-emerald-500 bg-emerald-600' : 'border-ink-400 bg-ink-200'}`}>
        <span className={`absolute left-1 top-1 block h-4 w-4 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </span>
      <span aria-hidden="true" className={`text-[9px] font-semibold leading-none ${checked ? 'text-emerald-400' : 'text-ink-500'}`}>{checked ? 'Ativado' : 'Desativado'}</span>
    </span>
  )
}

function accountDraft(profile: AccountDraft): AccountDraft {
  return {
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    position: profile.position,
    company: profile.company,
    notificationsEnabled: profile.notificationsEnabled,
  }
}

function readStudySettings(): StudySettings {
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (saved && typeof saved === 'object') {
      const values = saved as Record<string, unknown>
      return {
        objective: objectives.includes(values.objective as string) ? values.objective as string : defaultStudy.objective,
        difficulty: difficulties.includes(values.difficulty as string) ? values.difficulty as string : defaultStudy.difficulty,
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
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const accessibility = useAccessibility()
  const [confirmation, setConfirmation] = useState<'logout' | 'reset' | null>(null)
  const [feedback, setFeedback] = useState('')
  const requestedSection = searchParams.get('secao')
  const selected = sections.find((section) => section.id === requestedSection)?.id ?? 'estudo'
  function setSelected(section: Section) { setSearchParams({ secao: section }, { replace: true }) }
  const [account, setAccount] = useState(() => accountDraft(profile))
  const [study, setStudy] = useState(readStudySettings)
  const [saved, setSaved] = useState(false)
  const [securityNotice, setSecurityNotice] = useState(false)
  const [accountError, setAccountError] = useState('')
  const accountDirty = (Object.keys(account) as Array<keyof AccountDraft>).some((key) => account[key] !== profile[key])
  const dirty = accountDirty
  const editable = selected === 'conta'

  function changeAccount<K extends keyof AccountDraft>(key: K, value: AccountDraft[K]) {
    setAccount((current) => ({ ...current, [key]: value }))
    if (key === 'notificationsEnabled') {
      updateProfile({ notificationsEnabled: value as boolean })
      setFeedback('Preferência de notificações aplicada.')
    }
    setSaved(false)
    setAccountError('')
  }

  function changeStudy<K extends keyof StudySettings>(key: K, value: StudySettings[K]) {
    const next = { ...study, [key]: value }
    setStudy(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setFeedback('Preferências salvas automaticamente.')
    } catch { setFeedback('Preferências aplicadas nesta sessão; armazenamento indisponível.') }
    setSaved(false)
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

  function confirmAction() {
    if (confirmation === 'logout') {
      logout()
      navigate('/login', { replace: true })
      return
    }
    resetProfile()
    setAccount(accountDraft(currentUser))
    setStudy({ ...defaultStudy })
    accessibility.reset()
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('etp-login-email')
    } catch { /* Restaura a sessão em memória. */ }
    setSaved(false)
    setAccountError('')
    setConfirmation(null)
    setFeedback('Personalizações removidas. Dados demonstrativos restaurados.')
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (accountDirty) {
      const changes = {
        ...account,
        name: account.name.trim(),
        email: account.email.trim(),
        phone: account.phone.trim(),
        location: account.location.trim(),
        position: account.position.trim(),
        company: account.company.trim(),
      }
      if (!changes.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(changes.email)) {
        setAccountError('Informe um nome e um e-mail válidos para salvar.')
        setSelected('conta')
        return
      }
      updateProfile(changes)
      setAccount(changes)
    }
    setSaved(true)
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
      <PageHero
        eyebrow="Sua conta"
        icon={Settings}
        title="Configurações"
        description="Gerencie sua conta e ajuste sua experiência de aprendizagem."
      />

      <div className="grid min-w-0 grid-cols-[52px_minmax(0,1fr)] items-start gap-2 sm:gap-4 md:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        <nav aria-label="Seções de configurações" className="flex min-w-0 flex-col gap-1 rounded-[22px] border border-ink-200/70 bg-panel p-1 sm:p-2 md:p-3 shadow-card">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              title={label}
              aria-label={label}
              aria-current={selected === id ? 'true' : undefined}
              aria-controls="settings-panel"
              onClick={() => { setSelected(id); setSecurityNotice(false); setFeedback('') }}
              className={`relative flex min-h-11 min-w-0 items-center gap-3 rounded-xl px-2.5 py-2.5 text-left md:px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 ${selected === id ? 'bg-brand-blue-500/15 text-brand-blue-400' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900'}`}
            >
              {selected === id && <span aria-hidden="true" className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-brand-blue-400" />}
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="hidden md:inline">{label}</span>
              {selected === id && <ChevronRight className="ml-auto hidden h-3.5 w-3.5 shrink-0 md:block" aria-hidden="true" />}
            </button>
          ))}
        </nav>

        <form onSubmit={save} className="flex w-full min-w-0 max-w-[820px] flex-col gap-3">
          <section id="settings-panel" className={cardClass} aria-labelledby="settings-title">
            {selected === 'conta' && (
              <>
                <h2 id="settings-title" className="text-lg font-extrabold text-ink-900">Conta</h2>
                <p className="mt-1 text-xs leading-5 text-ink-500">Atualize os dados exibidos no seu perfil.</p>
                <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-ink-200 bg-panel-alt/60 p-3.5">
                  <Avatar name={account.name || profile.name} className="h-12 w-12 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink-900">{account.name || profile.name}</p>
                    <p className="truncate text-xs text-ink-500">{account.email || profile.email}</p>
                  </div>
                  <Link to="/perfil" className="ml-auto shrink-0 rounded-lg px-2 py-1.5 text-xs font-bold text-brand-blue-400 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Ver perfil</Link>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {([
                    ['name', 'Nome completo', 'text', 'name'],
                    ['email', 'E-mail', 'email', 'email'],
                    ['phone', 'Telefone', 'tel', 'tel'],
                    ['location', 'Localização', 'text', 'address-level2'],
                    ['position', 'Cargo', 'text', 'organization-title'],
                    ['company', 'Empresa', 'text', 'organization'],
                  ] as const).map(([key, label, type, autoComplete]) => (
                    <label key={key} className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-ink-700">
                      {label}
                      <input
                        className={inputClass}
                        type={type}
                        autoComplete={autoComplete}
                        value={account[key]}
                        onChange={(event) => changeAccount(key, event.target.value)}
                        required={key === 'name' || key === 'email'}
                        pattern={key === 'name' ? '.*\\S.*' : undefined}
                        title={key === 'name' ? 'Informe um nome válido.' : undefined}
                        maxLength={key === 'email' ? 120 : 80}
                      />
                    </label>
                  ))}
                </div>
                {accountError && <p role="alert" className="mt-4 text-xs text-red-400">{accountError}</p>}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 pt-4">
                  <p className="text-xs text-ink-500">Encerre seu acesso neste navegador.</p>
                  <button type="button" className={actionClass} onClick={() => { if (accountDirty) setConfirmation('logout'); else { logout(); navigate('/login', { replace: true }) } }}><LogOut className="h-4 w-4" aria-hidden="true" />Sair da conta</button>
                </div>
              </>
            )}

            {selected === 'seguranca' && (
              <>
                <h2 id="settings-title" className="text-lg font-extrabold text-ink-900">Segurança</h2>
                <p className="mt-1 text-xs leading-5 text-ink-500">Informações básicas de acesso à conta.</p>
                <div className="mt-5 divide-y divide-ink-100">
                  <div className="flex flex-wrap items-center gap-3 py-4 first:pt-0">
                    <Mail className="h-5 w-5 shrink-0 text-brand-blue-400" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink-900">E-mail da conta</p>
                      <p className="break-all text-xs text-ink-500">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 py-4 last:pb-0">
                    <LockKeyhole className="h-5 w-5 shrink-0 text-brand-blue-400" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink-900">Senha</p>
                      <p className="text-xs text-ink-500">A autenticação atual é demonstrativa.</p>
                    </div>
                    <button type="button" onClick={() => setSecurityNotice(true)} className="min-h-9 rounded-xl border border-ink-200 px-3 text-xs font-bold text-brand-blue-400 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Alterar senha</button>
                  </div>
                </div>
                {securityNotice && <p role="status" className="mt-5 rounded-xl border border-brand-blue-500/20 bg-brand-blue-500/10 p-3 text-xs leading-5 text-ink-700">A alteração de senha estará disponível após a integração da autenticação.</p>}
              </>
            )}

            {selected === 'notificacoes' && (
              <>
                <h2 id="settings-title" className="text-lg font-extrabold text-ink-900">Notificações</h2>
                <p className="mt-1 text-xs leading-5 text-ink-500">Escolha seus avisos. As alterações são salvas automaticamente.</p>
                <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-ink-200 bg-panel-alt/60 p-3">
                  <span className="min-w-0 text-xs font-semibold text-ink-900">Mostrar avisos no cabeçalho</span>
                  <SettingsToggle label="Mostrar avisos no cabeçalho" checked={account.notificationsEnabled} onChange={(checked) => changeAccount('notificationsEnabled', checked)} />
                </label>
                <div className="mt-4 divide-y divide-ink-200/50">
                  {reminderOptions.map(([key, label]) => (
                    <label key={key} className="flex min-h-14 cursor-pointer items-center justify-between gap-3 py-3 text-xs text-ink-700">
                      <span>{label}</span><SettingsToggle label={label} checked={study[key]} onChange={(checked) => changeStudy(key, checked)} />
                    </label>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-brand-blue-500/20 bg-brand-blue-500/5 p-3">
                  <h3 className="text-xs font-bold text-ink-900">Prévia dos avisos</h3>
                  <p className="mt-1 text-[11px] leading-4 text-ink-500">Exemplos dos tipos escolhidos; não há envio de e-mails ou notificações push.</p>
                  {account.notificationsEnabled && reminderOptions.some(([key]) => study[key]) ? (
                    <ul className="mt-3 space-y-2">
                      {reminderOptions.filter(([key]) => study[key]).map(([key, label, message]) => <li key={key} className="rounded-lg border border-ink-200 bg-panel p-3"><p className="text-xs font-bold text-ink-700">{label}</p><p className="mt-1 text-xs text-ink-500">{message}</p></li>)}
                    </ul>
                  ) : <p className="mt-3 text-xs text-ink-500">{account.notificationsEnabled ? 'Nenhum tipo de aviso selecionado.' : 'Os avisos estão desativados.'}</p>}
                </div>
              </>
            )}

            {selected === 'estudo' && (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <IllustratedIcon icon={BookOpen} tone="blue" size="compact" />
                  <div>
                    <h2 id="settings-title" className="text-[17px] font-extrabold tracking-tight text-ink-900">Preferências de estudo</h2>
                    <p className="mt-0.5 text-xs leading-5 text-ink-500">Ajuste seu perfil de aprendizagem.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="rounded-[20px] border border-brand-blue-500/20 bg-gradient-to-br from-brand-blue-500/10 to-panel-alt/40 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-[13px] font-extrabold text-ink-900"><Target className="h-4 w-4 text-brand-cyan-400" aria-hidden="true" />Perfil de aprendizagem</h3>
                    <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-2">
                      <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-semibold text-ink-500">
                        Objetivo de aprendizagem
                        <select className={`${inputClass} min-w-0`} value={study.objective} onChange={(event) => changeStudy('objective', event.target.value)}>
                          {objectives.map((objective) => <option key={objective}>{objective}</option>)}
                        </select>
                      </label>
                      <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-semibold text-ink-500">
                        Nível de dificuldade preferido
                        <select className={`${inputClass} min-w-0`} value={study.difficulty} onChange={(event) => changeStudy('difficulty', event.target.value)}>
                          {difficulties.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
                        </select>
                      </label>
                    </div>
                  </div>
                  <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-2">
                    <div className="min-w-0 rounded-[20px] border border-ink-200/80 bg-panel-alt/40 p-4">
                      <h3 className="mb-2 flex items-center gap-2 text-[13px] font-extrabold text-ink-900"><BookOpen className="h-4 w-4 text-brand-blue-400" aria-hidden="true" />Formatos de conteúdo</h3>
                      <div className="divide-y divide-ink-200/50">
                        {([
                          ['videos', 'Vídeos', Play],
                          ['articles', 'Artigos e textos', FileText],
                          ['exercises', 'Exercícios práticos', PencilLine],
                        ] as const).map(([key, label, Icon]) => (
                          <label key={key} className="group flex min-h-12 cursor-pointer items-center gap-2 rounded-lg px-1 py-2 text-xs font-medium text-ink-700 transition-colors hover:bg-brand-blue-500/5 hover:text-ink-900">
                            <Icon className="h-4 w-4 shrink-0 text-ink-500 group-hover:text-brand-blue-400" aria-hidden="true" />
                            <span className="min-w-0 flex-1">{label}</span>
                            <SettingsToggle label={label} checked={study[key]} onChange={(checked) => changeStudy(key, checked)} />
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="min-w-0 rounded-[20px] border border-ink-200/80 bg-panel-alt/40 p-4">
                      <h3 className="mb-2 flex items-center gap-2 text-[13px] font-extrabold text-ink-900"><Bell className="h-4 w-4 text-brand-blue-400" aria-hidden="true" />Lembretes</h3>
                      <div className="divide-y divide-ink-200/50">
                        {([
                          ['studyReminders', 'Lembretes de estudo'],
                          ['assessmentReminders', 'Avaliações'],
                          ['courseReminders', 'Novos cursos ou trilhas recomendadas'],
                        ] as const).map(([key, label]) => (
                          <label key={key} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-1 py-2 text-xs font-medium leading-4 text-ink-700 transition-colors hover:bg-brand-blue-500/5 hover:text-ink-900">
                            <span className="min-w-0 flex-1">{label}</span>
                            <SettingsToggle label={label} checked={study[key]} onChange={(checked) => changeStudy(key, checked)} />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-4 text-ink-500">Salvo automaticamente neste navegador. Os lembretes podem ser conferidos na prévia de Notificações.</p>
              </>
            )}

            {selected === 'acessibilidade' && (
              <>
                <h2 id="settings-title" className="text-lg font-extrabold text-ink-900">Acessibilidade</h2>
                <p className="mt-1 text-xs leading-5 text-ink-500">Os ajustes são aplicados imediatamente em toda a plataforma.</p>
                <div className="mt-4 divide-y divide-ink-200/50">
                  {([
                    ['largerText', 'Texto ampliado', 'Aumenta os textos e controles para facilitar a leitura.'],
                    ['reducedMotion', 'Reduzir animações', 'Reduz movimentos e transições da interface.'],
                  ] as const).map(([key, label, description]) => <label key={key} className="flex cursor-pointer items-center justify-between gap-3 py-4"><span className="min-w-0"><span className="block text-sm font-bold text-ink-900">{label}</span><span className="mt-1 block text-xs leading-5 text-ink-500">{description}</span></span><SettingsToggle label={label} checked={accessibility.preferences[key]} onChange={(checked) => { accessibility.update({ [key]: checked }); setFeedback('Ajuste de acessibilidade aplicado.') }} /></label>)}
                </div>
                <p className="mt-3 text-xs leading-5 text-ink-500">Use Tab para navegar e Espaço para ativar ou desativar os controles.</p>
              </>
            )}

            {selected === 'privacidade' && (
              <>
                <h2 id="settings-title" className="text-lg font-extrabold text-ink-900">Privacidade</h2>
                <p className="mt-1 text-xs leading-5 text-ink-500">Controle os dados salvos neste navegador.</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-ink-200 bg-panel-alt/60 p-4">
                    <h3 className="text-sm font-bold text-ink-900">Baixar meus dados</h3>
                    <p className="my-3 text-xs leading-5 text-ink-500">Baixe um arquivo JSON com seu perfil salvo e suas preferências.</p>
                    <button type="button" onClick={exportData} className={actionClass}><Download className="h-4 w-4" aria-hidden="true" />Baixar dados</button>
                  </div>
                  <div className="rounded-xl border border-ink-200 bg-panel-alt/60 p-4">
                    <h3 className="text-sm font-bold text-ink-900">Limpar personalizações</h3>
                    <p className="my-3 text-xs leading-5 text-ink-500">Remove seus dados pessoais e ajustes locais, restaurando o perfil demonstrativo. Não exclui uma conta no servidor.</p>
                    <button type="button" onClick={() => setConfirmation('reset')} className={actionClass}><Trash2 className="h-4 w-4" aria-hidden="true" />Limpar dados locais</button>
                  </div>
                </div>
              </>
            )}
          </section>

          <p role="status" className={feedback ? "rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400" : "sr-only"}>{feedback}</p>
          {(editable || dirty) && (
            <div className="flex flex-wrap items-center justify-end gap-3 rounded-[22px] border border-ink-200/70 bg-panel px-4 py-3 shadow-card sm:px-5">
              <p role="status" className={saved ? 'mr-auto inline-flex min-h-5 items-center gap-1.5 text-xs text-emerald-400' : 'sr-only'}>
                {saved && <><Check className="h-4 w-4" aria-hidden="true" />Alterações salvas.</>}
              </p>
              <button type="button" onClick={() => { setAccount(accountDraft(profile)); setSaved(false); setAccountError('') }} disabled={!dirty} className="min-h-10 rounded-xl border border-ink-200 px-4 text-sm font-bold text-ink-700 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 disabled:cursor-not-allowed disabled:opacity-40">Cancelar</button>
              <button type="submit" disabled={!dirty} className="min-h-10 rounded-xl bg-brand-blue-600 px-5 text-sm font-bold text-white hover:bg-brand-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 disabled:cursor-not-allowed disabled:opacity-40">Salvar alterações</button>
            </div>
          )}
        </form>
      </div>
      {confirmation && <CertificateDialog title={confirmation === 'logout' ? 'Sair sem salvar?' : 'Limpar dados deste navegador?'} onClose={() => setConfirmation(null)}>
        <p className="text-sm leading-6 text-ink-500">{confirmation === 'logout' ? 'As alterações não salvas nos dados da conta serão descartadas.' : 'Seu perfil personalizado e suas preferências serão substituídos pelos dados demonstrativos. Essa ação não pode ser desfeita; você pode baixar uma cópia antes de continuar.'}</p>
        <div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setConfirmation(null)} className={actionClass}>Cancelar</button><button type="button" onClick={confirmAction} className={actionClass}>{confirmation === 'logout' ? 'Sair da conta' : 'Confirmar limpeza'}</button></div>
      </CertificateDialog>}
    </div>
  )
}
