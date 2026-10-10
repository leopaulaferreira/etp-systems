import { BarChart3, CalendarDays, Download } from 'lucide-react'
import PageHero from '../../../components/ui/PageHero'
import type { ReportPeriod } from '../reportData'

export default function ReportHeader({ period, onPeriodChange, onExport, year, canExport }: {
  period: ReportPeriod
  onPeriodChange: (value: ReportPeriod) => void
  onExport: () => void
  year: number
  canExport: boolean
}) {
  return <div className="flex min-w-0 flex-col gap-5">
    <PageHero eyebrow="Seu desenvolvimento" icon={BarChart3} title="Relatórios" description="Acompanhe sua evolução." />
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink-200 bg-panel text-ink-500"><CalendarDays className="h-4 w-4" aria-hidden="true" /></span>
        <div><p className="text-xs font-bold text-ink-900">Seu desempenho no período</p><p className="mt-1 text-[11px] text-ink-500">{period === 'year' ? `01/01/${year} – 31/12/${year}` : 'Todo o histórico da sua conta'}</p></div>
      </div>
      <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto sm:flex-wrap">
        <select aria-label="Período do relatório" value={period} onChange={(event) => onPeriodChange(event.target.value as ReportPeriod)} className="col-span-2 min-h-10 min-w-0 rounded-xl border border-ink-200 bg-panel px-3 text-xs font-semibold text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">
          <option value="all">Todo o período</option><option value="year">Ano de {year}</option>
        </select>
        <button type="button" disabled={!canExport} onClick={onExport} className="col-span-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-brand-blue-500/40 bg-brand-blue-700 px-3 text-xs font-bold text-white transition-colors hover:bg-brand-blue-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><Download className="h-3.5 w-3.5" aria-hidden="true" />Exportar CSV</button>
      </div>
    </div>
  </div>
}
