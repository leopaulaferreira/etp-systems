import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Building2, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import PageHero from '../../components/ui/PageHero'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../auth/AuthContext'
import { useCompanySettings, type CompanySettings } from './companySettings'
import { useCompanyOverview } from './companyOverviewContext'
import CompanyLoadState from './CompanyLoadState'

export default function CompanySettingsPage() {
  const { section } = useParams()
  const { companyId, logout } = useAuth()
  const { data } = useCompanyOverview()
  const { settings, save } = useCompanySettings(companyId, data?.companyName)
  const navigate = useNavigate()
  if (!section || !['dados', 'conta', 'seguranca'].includes(section)) return <Navigate to="/empresa/configuracoes/dados" replace />
  if (section === 'dados' && !data) return <CompanyLoadState />
  const title = section === 'dados' ? 'Dados da empresa' : section === 'conta' ? 'Minha conta' : 'Segurança'
  return <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
    <PageHero eyebrow="Configurações" title={title} icon={section === 'dados' ? Building2 : section === 'conta' ? UserRound : ShieldCheck} description="Gerencie as informações da organização e da sua conta." />
    {section === 'seguranca' ? <section className="max-w-3xl space-y-5 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6"><h2 className="text-[17px] font-extrabold text-ink-900">Acesso à conta</h2><Input id="security-email" label="E-mail da conta" tone="dark" value={settings.accountEmail} readOnly /><div className="rounded-xl border border-ink-200 bg-panel-alt p-4"><h3 className="text-sm font-bold text-ink-900">Senha</h3><p className="mt-2 text-xs leading-5 text-ink-500">A alteração de senha ainda não está disponível. Nenhuma senha é armazenada nas configurações locais.</p></div><Button icon={<LogOut className="h-4 w-4" />} onClick={() => { logout(); navigate('/login', { replace: true }) }}>Sair da conta</Button></section> : <SettingsForm key={section} section={section} settings={settings} save={save} />}
  </div>
}
function SettingsForm({ section, settings, save }: { section: string; settings: CompanySettings; save: (settings: CompanySettings) => void }) {
  const [draft, setDraft] = useState(settings)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const fields: { key: keyof CompanySettings; label: string; type: string }[] = section === 'dados'
    ? [{ key: 'name', label: 'Nome da empresa', type: 'text' }, { key: 'contactEmail', label: 'E-mail de contato', type: 'email' }]
    : [{ key: 'contactName', label: 'Nome do responsável', type: 'text' }, { key: 'accountEmail', label: 'E-mail da conta', type: 'email' }]
  function submit(event: FormEvent) {
    event.preventDefault()
    const next = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()])) as CompanySettings
    if (fields.some(({ key }) => !next[key])) { setError('Preencha os campos sem deixar apenas espaços.'); return }
    try { save(next); setMessage('Alterações salvas neste navegador.'); setError('') } catch { setError('Não foi possível salvar. Verifique se o armazenamento do navegador está disponível.') }
  }
  return <form onSubmit={submit} className="max-w-3xl space-y-5 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6">
    <div><h2 className="text-[17px] font-extrabold text-ink-900">{section === 'dados' ? 'Informações da organização' : 'Responsável pela conta'}</h2><p className="mt-1 text-xs leading-5 text-ink-500">{section === 'dados' ? 'Mantenha os dados de contato atualizados.' : 'Identifique quem acompanha a equipe na plataforma. O e-mail de acesso é exibido apenas para consulta.'}</p></div>
    <div className="grid gap-4 sm:grid-cols-2">{fields.map(({ key, label, type }) => <Input key={key} id={`settings-${key}`} label={label} type={type} tone="dark" required readOnly={key === 'accountEmail'} maxLength={key.includes('Email') ? 254 : 100} value={draft[key]} onChange={event => { setDraft({ ...draft, [key]: event.target.value }); setMessage(''); setError('') }} />)}</div>
    {section === 'conta' && <p className="text-xs text-ink-500">Perfil de acesso: Empresa / RH</p>}
    {error && <p role="alert" className="text-sm text-red-400">{error}</p>}{message && <p role="status" className="text-sm text-brand-cyan-400">{message}</p>}
    <div className="flex flex-wrap justify-end gap-2 border-t border-ink-100 pt-4"><Button type="button" variant="ghost" onClick={() => { setDraft(settings); setMessage(''); setError('') }}>Cancelar</Button><Button type="submit">Salvar alterações</Button></div>
  </form>
}
