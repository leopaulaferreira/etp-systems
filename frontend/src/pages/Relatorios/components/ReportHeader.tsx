import {
  Award,
  BarChart3,
  CalendarDays,
  Download,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
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
      <section className="relative isolate flex min-h-[206px] items-center overflow-hidden rounded-[24px] border border-brand-blue-500/20 bg-gradient-to-br from-navy-800 via-panel to-navy-900 px-6 py-8 shadow-card sm:px-8 lg:min-h-[226px] lg:px-10 lg:py-9">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute -right-12 -top-48 h-[520px] w-[520px] rounded-full border border-brand-blue-400/10 bg-brand-blue-500/5" />
          <span className="absolute right-10 top-[-140px] h-[390px] w-[390px] rounded-full border border-brand-cyan-400/10" />
          <span className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-blue-400/40 to-transparent" />
        </div>
        <div className="relative flex w-full items-center justify-between gap-10">
          <div className="max-w-xl">
            <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-blue-400/20 bg-brand-blue-500/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-brand-blue-400">
              <BarChart3 className="h-3.5 w-3.5 text-brand-cyan-400" aria-hidden="true" /> Seu
              desenvolvimento
            </span>
            <h1 className="text-[31px] font-extrabold leading-[1.12] tracking-[-0.025em] text-ink-900 sm:text-[34px] lg:text-[36px]">
              Relatórios
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-7 text-ink-500 sm:text-[15px]">
              Acompanhe sua evolução.
            </p>
            <span className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-brand-cyan-400">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Conhecimento que se transforma
              em evolução
            </span>
          </div>
          <div aria-hidden="true" className="absolute right-2 top-1/2 hidden h-44 w-56 -translate-y-1/2 xl:block">
            <div className="absolute inset-x-2 inset-y-3 rotate-[-6deg] rounded-2xl border border-brand-blue-400/20 bg-panel-alt/80 p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="h-1.5 w-14 rounded-full bg-brand-blue-400/25" />
                <TrendingUp className="h-5 w-5 text-brand-cyan-400" />
              </div>
              <div className="mt-6 flex h-16 items-end gap-3">
                {[30, 45, 38, 65, 78, 100].map((height, index) => (
                  <span
                    key={index}
                    className="flex-1 rounded-t bg-gradient-to-t from-brand-blue-600/20 to-brand-blue-400/70"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-4 flex h-17 w-17 items-center justify-center rounded-2xl border border-brand-cyan-400/30 bg-navy-800 shadow-card">
              <Award className="h-10 w-10 text-brand-cyan-400" strokeWidth={1.4} />
            </span>
          </div>
        </div>
      </section>
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
