import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Award, Building2, Check, ClipboardCheck, Info, LockKeyhole, Mail, PencilLine, Save, UsersRound } from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../auth/AuthContext'
import type { CompanySettings } from './companySettings'

const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400'
const capabilities = [
  { icon: UsersRound, title: 'Acompanhar pessoas', detail: 'Cursos e progresso de cada colaborador.', to: '/empresa/colaboradores' },
  { icon: ClipboardCheck, title: 'Consultar avaliações', detail: 'Resultados e autorização de tentativas extras.', to: '/empresa/avaliacoes' },
  { icon: Award, title: 'Explorar conquistas', detail: 'Certificados emitidos para a equipe.', to: '/empresa/certificados' },
]

type EditableField = 'name' | 'contactEmail' | 'contactName'
type Props = {
  section: 'dados' | 'conta'
  settings: CompanySettings
  save: (settings: Partial<CompanySettings>) => void
  employees: number
  departments: number
  organization: string
}

export default function CompanySettingsForm({ section, settings, save, employees, departments, organization }: Props) {
  const { user } = useAuth()
  const [changes, setChanges] = useState<Partial<Pick<CompanySettings, EditableField>>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const isCompany = section === 'dados'
  const fields: EditableField[] = isCompany ? ['name', 'contactEmail'] : ['contactName']
  const draft = { ...settings, ...changes }
  const dirty = fields.some(key => draft[key].trim() !== settings[key].trim())
  const companyName = draft.name.trim() || 'Sua empresa'
  const responsibleName = draft.contactName.trim() || 'Responsável pela conta'
  const initials = companyName.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase('pt-BR')

  function update(key: EditableField, value: string) {
    setChanges(current => ({ ...current, [key]: value }))
    setMessage(''); setError('')
  }
  function reset() { setChanges({}); setMessage(''); setError('') }
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!dirty) return
    const next: Partial<CompanySettings> = {}
    for (const key of fields) next[key] = draft[key].trim()
    if (fields.some(key => !next[key])) { setError('Preencha os campos sem deixar apenas espaços.'); return }
    try {
      save(next)
      setChanges({}); setMessage('Alterações salvas neste navegador.'); setError('')
    } catch {
      setMessage(''); setError('Não foi possível salvar. Verifique se o armazenamento do navegador está disponível.')
    }
  }

  return <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.55fr)] xl:gap-6">
    <aside aria-label={isCompany ? 'Identidade da empresa' : 'Identidade do responsável'} className="min-w-0 overflow-hidden rounded-[22px] border border-ink-200/70 bg-panel">
      <div className={`relative overflow-hidden border-b border-ink-200/50 p-5 sm:p-6 ${isCompany ? 'bg-gradient-to-br from-brand-blue-500/15 via-panel to-panel' : 'bg-gradient-to-br from-brand-cyan-400/10 via-panel to-panel'}`}>
        <span aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-brand-blue-400/10" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-5 -top-5 h-32 w-32 rounded-full border border-brand-blue-400/10" />
        <div className="relative flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-blue-400">{isCompany ? 'Sua organização' : 'Seu perfil'}</p>
          {isCompany ? <Building2 className="h-5 w-5 text-brand-blue-400" aria-hidden="true" /> : <span className="rounded-full border border-brand-cyan-400/20 bg-brand-cyan-400/5 px-2.5 py-1 text-[10px] font-semibold text-brand-cyan-400">Empresa / RH</span>}
        </div>
        <div className="relative mt-6">
          {isCompany
            ? <div aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-2xl border border-brand-blue-400/25 bg-gradient-to-br from-brand-blue-500/20 to-brand-blue-500/5 text-2xl font-extrabold tracking-tight text-blue-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">{initials}</div>
            : <Avatar name={responsibleName} email={user?.email} className="h-20 w-20 text-2xl ring-4 ring-brand-cyan-400/10" />}
          <h2 className="mt-5 break-words text-xl font-extrabold leading-snug tracking-tight text-ink-900">{isCompany ? companyName : responsibleName}</h2>
          <p className="mt-2 text-xs leading-5 text-ink-500">{isCompany ? 'Aprendizagem e desenvolvimento da equipe.' : 'Responsável pelo acompanhamento da equipe.'}</p>
        </div>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        {isCompany ? <>
          <div><p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Contato da organização</p><p className="mt-2 flex items-start gap-2 text-xs text-ink-700"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue-400" aria-hidden="true" /><span className="min-w-0 break-all">{draft.contactEmail.trim() || 'Adicione um e-mail de contato'}</span></p></div>
          <dl className="grid grid-cols-2 gap-4 border-t border-ink-200/60 pt-4"><div><dt className="text-[11px] text-ink-500">Colaboradores</dt><dd className="mt-1 text-2xl font-extrabold tabular-nums text-ink-900">{employees}</dd></div><div><dt className="text-[11px] text-ink-500">Áreas informadas</dt><dd className="mt-1 text-2xl font-extrabold tabular-nums text-ink-900">{departments}</dd></div></dl>
          <Link to="/empresa/colaboradores" className={`flex min-h-11 items-center justify-between gap-2 rounded-lg text-xs font-semibold text-brand-blue-400 hover:text-blue-200 ${focus}`}>Conhecer a equipe<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </> : <>
          <div><p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Organização vinculada</p><p className="mt-2 flex items-start gap-2 text-xs font-semibold text-ink-700"><Building2 className="h-4 w-4 shrink-0 text-brand-blue-400" aria-hidden="true" /><span className="min-w-0 break-words">{organization}</span></p></div>
          <div className="border-t border-ink-200/60 pt-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">E-mail de acesso</p><p className="mt-2 break-all text-xs text-ink-700">{settings.accountEmail}</p><p className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-ink-500"><LockKeyhole className="h-3 w-3" aria-hidden="true" />Somente leitura</p></div>
          <Link to="/empresa/configuracoes/seguranca" className={`flex min-h-11 items-center justify-between gap-2 rounded-lg text-xs font-semibold text-brand-blue-400 hover:text-blue-200 ${focus}`}>Gerenciar meu acesso<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </>}
      </div>
    </aside>

    <div className="min-w-0 space-y-5">
      <form onSubmit={submit} className="overflow-hidden rounded-[22px] border border-ink-200/70 bg-panel">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink-200 bg-panel-alt text-brand-blue-400"><PencilLine className="h-4 w-4" aria-hidden="true" /></span><div><h2 className="text-base font-extrabold text-ink-900">{isCompany ? 'Informações da organização' : 'Identificação do responsável'}</h2><p className="mt-1 text-xs leading-5 text-ink-500">{isCompany ? 'Defina o nome de exibição e o contato da empresa.' : 'Escolha como seu nome aparece no painel da empresa.'}</p></div></div>
          <div className="mt-6 space-y-5">
            {isCompany ? <>
              <div><Input id="settings-name" label="Nome da empresa" tone="dark" required maxLength={100} autoComplete="organization" value={draft.name} onChange={event => update('name', event.target.value)} aria-describedby="company-name-help" /><p id="company-name-help" className="mt-2 text-[11px] leading-5 text-ink-500">Nome exibido no painel da empresa neste navegador.</p></div>
              <div><Input id="settings-contactEmail" label="E-mail de contato" type="email" tone="dark" required maxLength={254} autoComplete="email" placeholder="contato@empresa.com.br" value={draft.contactEmail} onChange={event => update('contactEmail', event.target.value)} aria-describedby="company-email-help" /><p id="company-email-help" className="mt-2 text-[11px] leading-5 text-ink-500">Contato da organização. O e-mail utilizado para entrar continua o mesmo.</p></div>
            </> : <div><Input id="settings-contactName" label="Nome do responsável" tone="dark" required maxLength={100} autoComplete="name" value={draft.contactName} onChange={event => update('contactName', event.target.value)} aria-describedby="account-name-help" /><p id="account-name-help" className="mt-2 text-[11px] leading-5 text-ink-500">Use o nome pelo qual você prefere ser identificado.</p></div>}
          </div>
          <p className="mt-6 flex items-start gap-2 border-t border-ink-200/60 pt-4 text-[11px] leading-5 text-ink-500"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>Estas preferências ficam salvas neste navegador e não alteram seu cadastro.</span></p>
          {error && <p role="alert" className="mt-3 text-xs leading-5 text-rose-400">{error}</p>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200/60 bg-panel-alt/35 px-5 py-4 sm:px-6">
          <p role="status" className={`flex items-center gap-1.5 text-[11px] ${message ? 'text-brand-cyan-400' : dirty ? 'text-amber-200' : 'text-ink-500'}`}>{message ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : dirty ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-200" /> : null}{message || (dirty ? 'Alterações não salvas' : 'Nenhuma alteração pendente')}</p>
          <div className="flex flex-wrap items-center gap-2"><Button type="button" variant="ghost" disabled={!dirty && !error} onClick={reset}>Cancelar</Button><Button type="submit" disabled={!dirty} icon={<Save className="h-4 w-4" aria-hidden="true" />}>Salvar alterações</Button></div>
        </div>
      </form>

      {isCompany ? <div className="flex items-start gap-3 px-1 py-2"><Building2 className="mt-0.5 h-5 w-5 shrink-0 text-ink-500" aria-hidden="true" /><div><h3 className="text-xs font-bold text-ink-700">Um espaço para sua organização</h3><p className="mt-1 text-xs leading-5 text-ink-500">O painel reúne os colaboradores vinculados à empresa e seus resultados de aprendizagem.</p></div></div> : <section aria-labelledby="account-access-title" className="px-1 pt-1">
        <h2 id="account-access-title" className="text-sm font-extrabold text-ink-900">Seu acesso na plataforma</h2>
        <p className="mt-1 text-xs leading-5 text-ink-500">Recursos disponíveis para o perfil Empresa / RH.</p>
        <ul className="mt-3 divide-y divide-ink-200/60">{capabilities.map(({ icon: Icon, title, detail, to }) => <li key={to}><Link to={to} className={`group flex min-h-16 items-center gap-3 rounded-lg py-3 ${focus}`}><Icon className="h-4 w-4 shrink-0 text-brand-blue-400" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-ink-700 group-hover:text-brand-blue-400">{title}</span><span className="mt-1 block text-[11px] leading-5 text-ink-500">{detail}</span></span><ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ink-500" aria-hidden="true" /></Link></li>)}</ul>
      </section>}
    </div>
  </div>
}
