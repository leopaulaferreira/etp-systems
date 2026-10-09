import { Search, X } from 'lucide-react'
import { statusLabels, type AssessmentFilters as Filters } from '../assessment'
import type { AssessmentStatus } from '../../../types/assessment'

type AssessmentFiltersProps = {
  filters: Filters
  onChange: (update: Partial<Filters>) => void
  onReset: () => void
}
const selectClass =
  'min-h-10 w-full min-w-0 rounded-xl border border-ink-200 bg-panel-alt px-2.5 py-2 text-xs font-semibold text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400'

export default function AssessmentFilters({ filters, onChange, onReset }: AssessmentFiltersProps) {
  const active =
    filters.query.trim() ||
    filters.status !== 'all'
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-ink-200/70 bg-panel p-4 shadow-card">
      <div
        role="search"
        className="flex min-h-11 items-center gap-2.5 rounded-xl border border-ink-200 bg-panel-alt px-3.5 focus-within:border-brand-blue-500 focus-within:ring-2 focus-within:ring-brand-blue-500/20"
      >
        <Search className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ query: event.target.value })}
          aria-label="Buscar avaliações"
          placeholder="Buscar avaliação ou curso..."
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-500"
        />
      </div>
      <div className="sm:w-56">
        <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-semibold text-ink-500">
          Status
          <select
            aria-label="Status da avaliação"
            value={filters.status}
            onChange={(event) => onChange({ status: event.target.value as Filters['status'] })}
            className={selectClass}
          >
            <option value="all">Todos os status</option>
            {(['pending', 'in_progress', 'completed'] as AssessmentStatus[]).map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {active && (
        <button
          type="button"
          onClick={onReset}
          className="flex min-h-9 items-center gap-1.5 self-start rounded-lg px-2 text-xs font-bold text-brand-blue-400 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Limpar filtros
        </button>
      )}
    </div>
  )
}
