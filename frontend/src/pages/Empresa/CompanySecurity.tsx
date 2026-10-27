import { KeyRound, LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export default function CompanySecurity({ email }: { email: string }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function endSession() {
    logout()
    navigate('/login', { replace: true })
  }

  return <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.55fr)] xl:gap-6">
    <aside aria-label="Sessão atual" className="relative overflow-hidden rounded-[22px] border border-brand-cyan-400/20 bg-gradient-to-br from-brand-cyan-400/10 via-panel to-panel p-5 sm:p-6">
      <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full border border-brand-cyan-400/10" />
      <div className="relative flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-cyan-400">Sessão atual</p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-cyan-400/20 bg-brand-cyan-400/5 px-2.5 py-1 text-[10px] font-semibold text-brand-cyan-400"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-cyan-400" />Ativa</span>
      </div>
      <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-cyan-400/20 bg-brand-cyan-400/10 text-brand-cyan-400"><ShieldCheck className="h-8 w-8" aria-hidden="true" /></div>
      <h2 className="mt-5 text-xl font-extrabold tracking-tight text-ink-900">Você está conectado</h2>
      <p className="mt-2 text-xs leading-5 text-ink-500">Acesso ao painel da sua organização com o perfil Empresa / RH.</p>
      <div className="mt-6 border-t border-ink-200/60 pt-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Conta em uso</p><p className="mt-2 break-all text-xs font-semibold text-ink-700">{email}</p></div>
    </aside>

    <div className="min-w-0 space-y-5">
      <section aria-labelledby="security-access-title" className="rounded-[22px] border border-ink-200/70 bg-panel p-5 sm:p-6">
        <h2 id="security-access-title" className="text-base font-extrabold text-ink-900">Informações de acesso</h2>
        <p className="mt-1 text-xs leading-5 text-ink-500">Os dados que identificam sua conta na plataforma.</p>
        <dl className="mt-5 divide-y divide-ink-200/60">
          <div className="flex items-start gap-3 py-4"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue-400" aria-hidden="true" /><div className="min-w-0 flex-1"><dt className="text-xs font-semibold text-ink-700">E-mail de acesso</dt><dd className="mt-1.5 break-all text-xs text-ink-900">{email}</dd><dd className="mt-1.5 text-[11px] leading-5 text-ink-500">Definido no cadastro. A edição não está disponível neste painel.</dd></div></div>
          <div className="flex items-start gap-3 py-4"><UserRound className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue-400" aria-hidden="true" /><div><dt className="text-xs font-semibold text-ink-700">Perfil de acesso</dt><dd className="mt-1.5 text-xs text-ink-900">Empresa / RH</dd><dd className="mt-1.5 text-[11px] leading-5 text-ink-500">Acompanhamento dos colaboradores vinculados à sua organização.</dd></div></div>
          <div className="flex items-start gap-3 pb-1 pt-4"><KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue-400" aria-hidden="true" /><div><dt className="text-xs font-semibold text-ink-700">Senha</dt><dd className="mt-1.5 text-[11px] leading-5 text-ink-500">A alteração de senha ainda não está disponível na plataforma.</dd></div></div>
        </dl>
      </section>

      <section aria-labelledby="security-logout-title" className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-rose-400/20 bg-rose-400/[0.03] p-5 sm:p-6">
        <div className="min-w-0 flex-1 basis-52"><h2 id="security-logout-title" className="text-sm font-bold text-ink-900">Encerrar esta sessão</h2><p className="mt-1 text-xs leading-5 text-ink-500">Você sairá da conta nesta aba. Para voltar ao painel, entre novamente.</p></div>
        <button type="button" onClick={endSession} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-400/30 px-4 py-3 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"><LogOut className="h-4 w-4" aria-hidden="true" />Sair da conta</button>
      </section>
    </div>
  </div>
}
