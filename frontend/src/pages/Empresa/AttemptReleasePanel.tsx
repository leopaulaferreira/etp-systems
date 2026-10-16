import { useEffect, useId, useState } from 'react'
import { fetchAttemptRelease, grantAttempt, type AttemptRelease } from './attemptReleaseApi'

export default function AttemptReleasePanel({ employeeId, courseId }: { employeeId: string; courseId: string }) {
  const [data, setData] = useState<AttemptRelease | null>(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [revision, setRevision] = useState(0)
  const reasonId = useId()
  useEffect(() => {
    const controller = new AbortController()
    fetchAttemptRelease(employeeId, courseId, controller.signal).then(result => {
      if (!controller.signal.aborted) { setData(result); setError('') }
    }).catch(() => { if (!controller.signal.aborted) setError('Não foi possível consultar as tentativas.') })
    return () => controller.abort()
  }, [employeeId, courseId, revision])

  async function grant() {
    if (busy || !data?.canGrant) return
    setBusy(true); setError(''); setSuccess(false)
    try {
      setData(await grantAttempt(employeeId, courseId, reason))
      setReason(''); setSuccess(true)
    } catch {
      setError('Não foi possível confirmar a liberação. Confira o histórico antes de tentar novamente.')
      try { setData(await fetchAttemptRelease(employeeId, courseId)) } catch { /* Mantém o erro e permite consultar novamente. */ }
    } finally { setBusy(false) }
  }
  return <section className="mt-4 space-y-3 border-t border-ink-200 pt-4" aria-label="Tentativas e autorizações">
    <h4 className="text-sm font-bold">Tentativas da avaliação</h4>
    {!data && !error && <p role="status" className="text-sm text-ink-500">Consultando tentativas…</p>}
    {error && <div role="alert" className="text-sm text-rose-400"><p>{error}</p><button type="button" onClick={() => setRevision(v => v + 1)} className="mt-2 min-h-11 underline">Consultar novamente</button></div>}
    {success && <p role="status" className="text-sm text-emerald-400">Uma tentativa extra foi liberada. O colaborador pode atualizar a página de avaliações para utilizá-la.</p>}
    {data && <>
      <p className="text-sm text-ink-500">{data.usedAttempts} de {data.maxAttempts} tentativas utilizadas · {data.remainingAttempts} disponíveis</p>
      {data.canGrant ? <form className="space-y-3" onSubmit={event => { event.preventDefault(); void grant() }}>
        <label htmlFor={reasonId} className="block text-sm font-semibold">Motivo da liberação</label>
        <textarea id={reasonId} value={reason} onChange={event => setReason(event.target.value)} required maxLength={500} disabled={busy} rows={3} className="w-full rounded-xl border border-ink-200 bg-panel-alt p-3 text-base text-ink-900" />
        <p className="text-xs text-ink-500">A liberação acrescenta uma tentativa e preserva todas as notas anteriores. Seu nome, o motivo e a data serão registrados.</p>
        <button type="submit" disabled={busy || !reason.trim()} className="min-h-11 w-full rounded-xl bg-brand-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Liberando…' : 'Liberar uma tentativa extra'}</button>
      </form> : <p className="text-xs text-ink-500">{data.passed ? 'Avaliação aprovada. Não é necessário liberar outra tentativa.' : 'Novas liberações ficam disponíveis quando todas as tentativas forem utilizadas sem aprovação.'}</p>}
      {data.grants.length > 0 && <div><h5 className="text-sm font-bold">Histórico de liberações</h5><ol className="mt-2 space-y-3">{data.grants.map(grant => <li key={grant.id} className="break-words rounded-xl bg-panel-alt p-3 text-xs leading-5"><p className="font-bold">{grant.authorizedBy} · {new Date(grant.createdAt).toLocaleString('pt-BR')}</p><p>Após a tentativa {grant.afterAttempt}: {grant.reason}</p></li>)}</ol></div>}
    </>}
  </section>
}
