import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Award, BookCheck, BookOpen, ClipboardCheck, History } from 'lucide-react'
import IllustratedIcon from '../../components/ui/IllustratedIcon'
import { formatCertificateDate } from '../Certificados/certificates'
import type { LearningEvent } from './profileTimeline'

const appearance = {
  enrollment: { icon: BookOpen, tone: 'blue' as const },
  completion: { icon: BookCheck, tone: 'emerald' as const },
  assessment: { icon: ClipboardCheck, tone: 'orange' as const },
  certificate: { icon: Award, tone: 'violet' as const },
}
const filters = [
  { id: 'all', label: 'Tudo' }, { id: 'enrollment', label: 'Inscrições' },
  { id: 'completion', label: 'Conclusões' }, { id: 'assessment', label: 'Avaliações' },
  { id: 'certificate', label: 'Certificados' },
] as const

export default function ProfileTimeline({ events, status, onRetry, className }: {
  events: LearningEvent[]
  status: 'loading' | 'ready' | 'error'
  onRetry: () => void
  className: string
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all')
  const [limit, setLimit] = useState(4)
  const filtered = events.filter(event => filter === 'all' || event.kind === filter)
  return (
    <section className={className} aria-labelledby="learning-timeline-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <IllustratedIcon icon={History} tone="blue" size="compact" />
          <div><h2 id="learning-timeline-title" className="text-[17px] font-extrabold tracking-tight text-ink-900">Sua trajetória</h2>
            <p className="mt-1 text-xs text-ink-500">Cada etapa da sua aprendizagem, em um só lugar.</p></div>
        </div>
        {status === 'ready' && <span className="rounded-lg border border-ink-200 bg-panel-alt px-3 py-1.5 text-xs font-semibold text-ink-500">{events.length} {events.length === 1 ? 'registro' : 'registros'}</span>}
      </div>
      {status === 'loading' && <p role="status" className="mt-5 text-sm text-ink-500">Carregando sua trajetória...</p>}
      {status === 'error' && <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-500"><p>Não foi possível carregar sua trajetória.</p><button type="button" onClick={onRetry} className="min-h-11 rounded-xl border border-ink-200 px-4 text-xs font-bold text-brand-blue-400 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Atualizar trajetória</button></div>}
      {status === 'ready' && <>
        {events.length > 0 && <div className="mt-5 flex flex-wrap gap-2 border-b border-ink-100 pb-4" role="group" aria-label="Filtrar trajetória">
          {filters.map(item => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => { setFilter(item.id); setLimit(4) }} className={`min-h-11 rounded-xl border px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 ${filter === item.id ? 'border-brand-blue-500/40 bg-brand-blue-500/10 text-brand-blue-400' : 'border-ink-200 text-ink-500 hover:bg-panel-alt'}`}>{item.label}</button>)}
        </div>}
        <ol id="learning-timeline-events" className="mt-4">
          {filtered.slice(0, limit).map(event => {
            const { icon, tone } = appearance[event.kind]
            return <li key={event.id} className="group relative flex gap-3 py-3 sm:gap-4">
              <div className="absolute bottom-0 left-5 top-14 w-px bg-ink-200 group-last:hidden" aria-hidden="true" />
              <div className="relative shrink-0"><IllustratedIcon icon={icon} tone={tone} size="compact" /></div>
              <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0"><p className="text-xs font-bold text-ink-500">{event.title}</p>
                  <Link to={event.to} className="mt-1 inline-flex max-w-full items-center gap-2 rounded-md text-sm font-bold text-ink-900 hover:text-brand-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><span className="min-w-0 break-words">{event.course}</span><ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-brand-blue-400" aria-hidden="true" /></Link>
                  <p className="mt-1 text-xs leading-relaxed text-ink-500">{event.detail}</p>
                </div>
                <time dateTime={event.date} className="shrink-0 text-[11px] text-ink-500 sm:pt-1">{formatCertificateDate(event.date)}</time>
              </div>
            </li>
          })}
        </ol>
        {!filtered.length && <div className="rounded-xl bg-panel-alt/50 p-5 text-sm text-ink-500"><p>{events.length ? 'Nenhum registro nesta categoria por enquanto.' : 'Sua trajetória começa com o primeiro curso. Inscrições e conquistas aparecerão aqui.'}</p>{!events.length && <Link to="/cursos" className="mt-3 inline-flex min-h-11 items-center text-xs font-bold text-brand-blue-400 underline underline-offset-4">Explorar cursos</Link>}</div>}
        {filtered.length > 4 && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
          <p className="text-xs text-ink-500" aria-live="polite">Mostrando {Math.min(limit, filtered.length)} de {filtered.length} registros</p>
          <button type="button" aria-controls="learning-timeline-events" onClick={() => setLimit(limit < filtered.length ? limit + 8 : 4)} className="min-h-11 rounded-xl border border-ink-200 px-4 text-xs font-bold text-brand-blue-400 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">{limit < filtered.length ? 'Ver mais registros' : 'Recolher histórico'}</button>
        </div>}
      </>}
    </section>
  )
}
