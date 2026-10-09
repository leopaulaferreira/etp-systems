import { useState } from 'react'
import { ArrowRight, CalendarDays, TrendingUp } from 'lucide-react'
import type { Assessment } from '../../../types/assessment'
import { calculateScore, formatAssessmentDate } from '../assessment'
import AssessmentIcon from './AssessmentIcon'

const panelClass = 'min-w-0 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card'

export default function AssessmentInsights({
  items,
  onOpen,
}: {
  items: Assessment[]
  onOpen: (item: Assessment) => void
}) {
  const [showAll, setShowAll] = useState(false)
  const upcoming = items
    .filter((item) => item.status !== 'completed' && item.dueAt)
    .sort((a, b) => a.dueAt!.localeCompare(b.dueAt!))
  const questions = items.flatMap((item) => item.questions)
  const multiple = questions.filter((question) => question.kind === 'multiple_choice').length
  const multiplePercent = questions.length ? Math.round((multiple / questions.length) * 100) : 0
  const history = items
    .flatMap((item) =>
      item.attempts.map((attempt) => ({
        id: `${item.id}-${attempt.completedAt}`,
        date: attempt.completedAt,
        score: attempt.score ?? calculateScore(item, attempt.answers),
      })),
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-6)
  const coordinates = history.map((point, index) => ({
    ...point,
    x: history.length === 1 ? 130 : 22 + (index * 216) / (history.length - 1),
    y: 108 - point.score * 0.8,
  }))
  const line = coordinates.map((point) => `${point.x},${point.y}`).join(' ')
  const area = coordinates.length
    ? `M ${coordinates[0].x} 112 L ${coordinates.map((point) => `${point.x} ${point.y}`).join(' L ')} L ${coordinates.at(-1)!.x} 112 Z`
    : ''

  return (
    <aside aria-label="Agenda e desempenho" className="flex min-w-0 flex-col gap-5">
      <section className={panelClass} aria-labelledby="upcoming-title">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-brand-blue-400" aria-hidden="true" />
          <h2 id="upcoming-title" className="text-base font-extrabold tracking-tight text-ink-900">
            Próximas avaliações
          </h2>
        </div>
        {upcoming.length ? (
          <ul className="divide-y divide-ink-100">
            {upcoming.slice(0, showAll ? undefined : 3).map((item) => (
              <li key={item.id} className="py-3 first:pt-0">
                <button
                  type="button"
                  onClick={() => onOpen(item)}
                  aria-label={`Ver avaliação: ${item.title}`}
                  className="group flex w-full items-start gap-2.5 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
                >
                  <AssessmentIcon topic={item.topic} />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-xs font-bold leading-5 text-ink-700 group-hover:text-brand-blue-400">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-ink-500">
                      {item.type} · {item.courseType}
                    </span>
                  </span>
                  <span className="shrink-0 pt-0.5 text-right text-[10px] font-bold text-ink-500">
                    Até
                    <br />
                    <span className="text-ink-700">{formatAssessmentDate(item.dueAt!)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-3 text-sm leading-6 text-ink-500">
            Tudo em dia! Nenhuma avaliação pendente na agenda.
          </p>
        )}
        {upcoming.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            aria-expanded={showAll}
            className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-ink-200 text-xs font-bold text-brand-blue-400 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
          >
            {showAll ? 'Mostrar menos' : `Ver todas (${upcoming.length})`}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </section>
      <section className={panelClass} aria-labelledby="question-types-title">
        <h2
          id="question-types-title"
          className="mb-5 text-base font-extrabold tracking-tight text-ink-900"
        >
          Questões por tipo
        </h2>
        <div className="flex flex-wrap items-center gap-5">
          <div
            aria-hidden="true"
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(var(--color-brand-blue-500) 0% ${multiplePercent}%, var(--color-brand-cyan-400) ${multiplePercent}% 100%)`,
            }}
          >
            <span className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-panel">
              <span className="text-2xl font-extrabold text-ink-900">{questions.length}</span>
              <span className="text-[9px] text-ink-500">questões</span>
            </span>
          </div>
          <ul className="flex flex-1 flex-col gap-3 text-xs text-ink-500">
            <li>
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-blue-500" />
                Múltipla escolha
              </span>
              <strong className="ml-3.5 mt-1 block text-ink-700">
                {multiple} · {multiplePercent}%
              </strong>
            </li>
            <li>
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-cyan-400" />
                Verdadeiro ou falso
              </span>
              <strong className="ml-3.5 mt-1 block text-ink-700">
                {questions.length - multiple} · {questions.length ? 100 - multiplePercent : 0}%
              </strong>
            </li>
          </ul>
        </div>
      </section>
      <section
        id="assessment-performance"
        tabIndex={-1}
        className={`${panelClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400`}
        aria-labelledby="performance-title"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-blue-400" aria-hidden="true" />
          <h2
            id="performance-title"
            className="text-base font-extrabold tracking-tight text-ink-900"
          >
            Seu desempenho
          </h2>
        </div>
        <p className="mt-2 text-xs leading-5 text-ink-500">
          Notas das últimas {history.length} tentativas concluídas.
        </p>
        {history.length ? (
          <svg
            viewBox="0 0 260 144"
            className="mt-3 w-full"
            role="img"
            aria-label={`Evolução das notas: ${history.map((point) => `${formatAssessmentDate(point.date)}: ${point.score}%`).join('; ')}`}
          >
            {[28, 68, 108].map((y) => (
              <line
                key={y}
                x1="12"
                x2="248"
                y1={y}
                y2={y}
                stroke="var(--color-ink-200)"
                strokeDasharray="3 5"
              />
            ))}
            <path d={area} fill="var(--color-brand-blue-500)" opacity="0.08" />
            <polyline
              points={line}
              fill="none"
              stroke="var(--color-brand-blue-400)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {coordinates.map((point) => (
              <g key={point.id}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="var(--color-brand-blue-500)"
                  stroke="var(--color-panel)"
                  strokeWidth="2"
                />
                <text
                  x={point.x}
                  y={point.y - 11}
                  textAnchor="middle"
                  fill="var(--color-ink-700)"
                  fontSize="10"
                  fontWeight="700"
                >
                  {point.score}%
                </text>
                <text
                  x={point.x}
                  y="134"
                  textAnchor="middle"
                  fill="var(--color-ink-500)"
                  fontSize="9"
                >
                  {formatAssessmentDate(point.date)}
                </text>
              </g>
            ))}
          </svg>
        ) : (
          <p className="py-6 text-sm text-ink-500">
            Conclua uma avaliação para acompanhar sua evolução.
          </p>
        )}
      </section>
    </aside>
  )
}
