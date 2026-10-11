import IllustratedIcon from '../../../components/ui/IllustratedIcon'
import { ArrowRight, CheckCircle2, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Assessment } from '../../../types/assessment'
import { latestScore } from '../assessment'
import AssessmentBadge from './AssessmentBadge'
import AssessmentIcon from './AssessmentIcon'

type AssessmentListProps = {
  items: Assessment[]
  total: number
  onOpen: (item: Assessment) => void
  onReset: () => void
}
const actionLabels = {
  pending: 'Iniciar',
  in_progress: 'Continuar',
  completed: 'Ver resultado',
  scheduled: 'Ver detalhes',
}

function AssessmentAction({
  item,
  onOpen,
}: {
  item: Assessment
  onOpen: (item: Assessment) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      aria-label={`${actionLabels[item.status]}: ${item.title}`}
      className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 ${item.status === 'pending' || item.status === 'in_progress' ? 'bg-brand-blue-700 text-white hover:bg-brand-blue-600' : 'border border-ink-200 bg-panel-alt text-brand-blue-400 hover:bg-brand-blue-500/10'}`}
    >
      {actionLabels[item.status]}
      <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    </button>
  )
}

function AssessmentIdentity({ item }: { item: Assessment }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <AssessmentIcon topic={item.topic} />
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[13px] font-extrabold leading-snug text-ink-900">{item.title}</span>
        <span className="text-[11px] leading-5 text-ink-500">
          {item.courseType} · {item.course}
        </span>
      </div>
    </div>
  )
}

function AssessmentResult({ item }: { item: Assessment }) {
  const score = latestScore(item)
  return (
    <div className="flex flex-col items-start gap-2">
      <AssessmentBadge status={item.status} />
      {item.status === 'completed' && score !== null && (
        <span
          className={`flex items-center gap-1 text-[11px] font-bold ${score >= item.minimumScore ? 'text-emerald-400' : 'text-amber-300'}`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          {score}% · {score >= item.minimumScore ? 'Aprovado' : 'Revisar'}
        </span>
      )}
      {item.status === 'in_progress' && (
        <span className="text-[11px] text-ink-500">
          {Object.keys(item.answers).length}/{item.questions.length} respondidas
        </span>
      )}
    </div>
  )
}

export default function AssessmentList({ items, total, onOpen, onReset }: AssessmentListProps) {
  return (
    <section
      id="assessment-list"
      tabIndex={-1}
      aria-labelledby="assessment-list-title"
      className="min-w-0 overflow-hidden rounded-[22px] border border-ink-200/70 bg-panel shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-5">
        <h2
          id="assessment-list-title"
          className="text-[18px] font-extrabold tracking-tight text-ink-900"
        >
          Minhas avaliações
        </h2>
        <p role="status" className="text-xs font-semibold text-ink-500">
          {items.length} de {total} avaliações
        </p>
      </div>
      {items.length ? (
        <>
          <div className="hidden md:block">
            <table className="w-full table-fixed text-left">
              <caption className="sr-only">
                Avaliações, formato, situação e ações disponíveis
              </caption>
              <thead className="border-b border-ink-100 bg-panel-alt/50 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th scope="col" className="w-[43%] px-5 py-3">
                    Avaliação
                  </th>
                  <th scope="col" className="w-[18%] px-2 py-3">
                    Formato
                  </th>
                  <th scope="col" className="w-[19%] px-2 py-3">
                    Status
                  </th>
                  <th scope="col" className="w-[20%] py-3 pl-2 pr-5">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-panel-alt/40">
                    <td className="px-5 py-5">
                      <AssessmentIdentity item={item} />
                    </td>
                    <td className="px-2 py-5">
                      <div className="flex flex-col gap-1 text-[11px] leading-5 text-ink-500">
                        <span className="font-bold text-ink-700">{item.type}</span>
                        <span>
                          {item.questions.length} questões · {item.estimatedMinutes} min
                        </span>
                        <span>Mínima {item.minimumScore}%</span>
                      </div>
                    </td>
                    <td className="px-2 py-5">
                      <AssessmentResult item={item} />
                    </td>
                    <td className="py-5 pl-2 pr-5">
                      <AssessmentAction item={item} onOpen={onOpen} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-ink-100 md:hidden">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-4 p-5">
                <AssessmentIdentity item={item} />
                <p className="text-xs leading-6 text-ink-500">
                  {item.type} · {item.questions.length} questões · {item.estimatedMinutes} min
                  estimados · Mínima {item.minimumScore}%
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <AssessmentResult item={item} />
                  <AssessmentAction item={item} onOpen={onOpen} />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <IllustratedIcon icon={SearchX} tone="blue" size="tile" />
          <h3 className="text-base font-bold text-ink-900">{total ? 'Nenhuma avaliação encontrada' : 'Nenhuma avaliação disponível'}</h3>
          <p className="text-sm leading-6 text-ink-500">{total ? 'Tente outro termo ou ajuste os filtros.' : 'Inscreva-se em um curso piloto para estudar a aula e fazer sua avaliação.'}</p>
          {total ? <button
            type="button"
            onClick={onReset}
            className="mt-1 min-h-10 rounded-xl bg-brand-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
          >
            Ver todas as avaliações
          </button> : <Link to="/cursos" className="mt-1 inline-flex min-h-10 items-center rounded-xl bg-brand-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Explorar cursos</Link>}
        </div>
      )}
    </section>
  )
}
