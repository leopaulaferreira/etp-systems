import {
  BarChart3,
  CalendarDays,
  Download,
  SlidersHorizontal,
} from 'lucide-react'
import PageHero from '../../../components/ui/PageHero'
import { periodDates, periodLabels, type ReportPeriod } from '../report'

type Props = {
  period: ReportPeriod
  onPeriodChange: (value: ReportPeriod) => void
  filtersOpen: boolean
  onToggleFilters: () => void
  onExport: () => void
  filtered: boolean
}

export default function ReportHeader({
  period,
  onPeriodChange,
  filtersOpen,
  onToggleFilters,
  onExport,
  filtered,
}: Props) {
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <PageHero
        eyebrow="Seu desenvolvimento"
        icon={BarChart3}
        title="Relatórios"
        description="Acompanhe sua evolução."
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink-200 bg-panel text-ink-500">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold text-ink-900">Seu desempenho no período</p>
            <p className="mt-1 text-[11px] text-ink-500">{periodDates[period]}</p>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <select
            aria-label="Período do relatório"
            value={period}
            onChange={(event) => onPeriodChange(event.target.value as ReportPeriod)}
            className="col-span-2 min-h-10 min-w-0 rounded-xl border border-ink-200 bg-panel px-3 text-xs font-semibold text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
          >
            {(Object.keys(periodLabels) as ReportPeriod[]).map((key) => (
              <option key={key} value={key}>
                {periodLabels[key]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onToggleFilters}
            aria-expanded={filtersOpen}
            aria-controls="report-filters"
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 ${filtersOpen || filtered ? 'border-brand-blue-400/40 bg-brand-blue-500/10 text-brand-blue-400' : 'border-ink-200 bg-panel text-ink-700 hover:border-brand-blue-400/40'}`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Filtros
            {filtered && (
              <span
                className="h-1.5 w-1.5 rounded-full bg-brand-cyan-400"
                aria-label="Filtro ativo"
              />
            )}
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-brand-blue-500/40 bg-brand-blue-700 px-3 text-xs font-bold text-white transition-colors hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Exportar CSV
          </button>
        </div>
      </div>
    </div>
  )
}
