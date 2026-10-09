import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAssessments } from '../../assessments/AssessmentContext'
import type { Assessment, AssessmentStatus } from '../../types/assessment'
import {
  answerAssessment,
  assessmentSummary,
  initialFilters,
  selectAssessments,
  startAssessment,
  type AssessmentFilters as Filters,
} from './assessment'
import { sendAttempt } from './assessmentApi'
import AssessmentDialog from './components/AssessmentDialog'
import AssessmentFilters from './components/AssessmentFilters'
import AssessmentHero from './components/AssessmentHero'
import AssessmentInsights from './components/AssessmentInsights'
import AssessmentList from './components/AssessmentList'
import AssessmentStats from './components/AssessmentStats'

export default function AvaliacoesPage() {
  const navigate = useNavigate()
  const { assessments: items, setAssessments: setItems, status, reload } = useAssessments()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const filtered = useMemo(() => selectAssessments(items, filters), [items, filters])
  const summary = useMemo(() => assessmentSummary(items), [items])
  const courseId = searchParams.get('curso')
  const lessonNumber = Number(searchParams.get('aula'))
  const lessonQuery = Number.isSafeInteger(lessonNumber) && lessonNumber > 0 ? `?aula=${lessonNumber}` : ''
  const selected = items.find((item) => item.id === selectedId) ??
    (selectedId === null ? items.find((item) => item.courseId === courseId) : undefined)

  function focusSection(id: string) {
    const section = document.getElementById(id)
    section?.focus({ preventScroll: true })
    section?.scrollIntoView({ block: 'nearest' })
  }

  function selectStatus(status: AssessmentStatus) {
    setFilters({ ...initialFilters, status })
    focusSection('assessment-list')
  }

  function updateSelected(update: (item: Assessment) => Assessment) {
    setItems((current) => current.map((item) => (item.id === selected?.id ? update(item) : item)))
  }

  async function handleSubmit() {
    if (!selected || submitting) return
    setSubmitting(true)
    setSubmitError(false)
    try {
      const updated = await sendAttempt(selected)
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch {
      setSubmitError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
      <AssessmentHero />
      {status === 'loading' && <p role="status" className="rounded-[22px] border border-ink-200/70 bg-panel p-6 text-sm text-ink-500">Carregando avaliações...</p>}
      {status === 'error' && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-ink-200/70 bg-panel p-6 text-sm text-ink-700"><span>Não foi possível carregar suas avaliações.</span><button type="button" onClick={reload} className="rounded-xl bg-brand-blue-700 px-4 py-2 font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Tentar novamente</button></div>}
      {status === 'ready' && <>
      <AssessmentStats
        summary={summary}
        selectedStatus={filters.status}
        onSelect={selectStatus}
        onViewPerformance={() => focusSection('assessment-performance')}
      />
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-5">
          <AssessmentFilters
            filters={filters}
            onChange={(update) => setFilters((current) => ({ ...current, ...update }))}
            onReset={() => setFilters(initialFilters)}
          />
          <AssessmentList
            items={filtered}
            total={items.length}
            onOpen={(item) => setSelectedId(item.id)}
            onReset={() => setFilters(initialFilters)}
          />
        </div>
        <AssessmentInsights items={items} onOpen={(item) => setSelectedId(item.id)} />
      </div>
      </>}
      {selected && (
        <AssessmentDialog
          key={selected.id}
          item={selected}
          onClose={() => { setSelectedId(null); if (courseId) setSearchParams({}, { replace: true }) }}
          onReviewLesson={selected.courseId ? () => navigate(`/cursos/${encodeURIComponent(selected.courseId!)}/estudar${lessonQuery}`) : undefined}
          onStart={() => updateSelected(startAssessment)}
          onAnswer={(questionId, option) =>
            updateSelected((item) => answerAssessment(item, questionId, option))
          }
          onSubmit={() => { void handleSubmit() }}
          submitting={submitting}
          submitError={submitError}
        />
      )}
    </div>
  )
}
