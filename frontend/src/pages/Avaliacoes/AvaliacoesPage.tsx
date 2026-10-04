import { useMemo, useState } from 'react'
import { useAssessments } from '../../assessments/AssessmentContext'
import type { Assessment, AssessmentStatus } from '../../types/assessment'
import {
  answerAssessment,
  assessmentSummary,
  initialFilters,
  selectAssessments,
  startAssessment,
  submitAssessment,
  type AssessmentFilters as Filters,
} from './assessment'
import AssessmentDialog from './components/AssessmentDialog'
import AssessmentFilters from './components/AssessmentFilters'
import AssessmentHero from './components/AssessmentHero'
import AssessmentInsights from './components/AssessmentInsights'
import AssessmentList from './components/AssessmentList'
import AssessmentStats from './components/AssessmentStats'

export default function AvaliacoesPage() {
  const { assessments: items, setAssessments: setItems } = useAssessments()
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const filtered = useMemo(() => selectAssessments(items, filters), [items, filters])
  const summary = useMemo(() => assessmentSummary(items), [items])
  const selected = items.find((item) => item.id === selectedId)

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
    setItems((current) => current.map((item) => (item.id === selectedId ? update(item) : item)))
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
      <AssessmentHero />
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
      {selected && (
        <AssessmentDialog
          key={selected.id}
          item={selected}
          onClose={() => setSelectedId(null)}
          onStart={() => updateSelected(startAssessment)}
          onAnswer={(questionId, option) =>
            updateSelected((item) => answerAssessment(item, questionId, option))
          }
          onSubmit={() => {
            const completedAt = new Date().toISOString()
            updateSelected((item) => submitAssessment(item, completedAt))
          }}
        />
      )}
    </div>
  )
}
