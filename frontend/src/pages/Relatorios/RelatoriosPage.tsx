import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import {
  reportCourseStatus,
  reportPopularCourses,
  reportRanking,
  reportCertificates,
} from '../../mocks/relatorios.mock'
import CertificateDialog from '../Certificados/components/CertificateDialog'
import ReportCharts from './components/ReportCharts'
import ReportHeader from './components/ReportHeader'
import ReportOverview from './components/ReportOverview'
import ReportStats from './components/ReportStats'
import { periodDates, selectReport, type ReportPeriod, type ReportTrailFilter } from './report'
import { downloadReportCsv } from './reportCsv'

type Detail = 'evolution' | 'trails' | 'status' | 'ranking' | 'popular'
const trailNames = [...new Set(reportCertificates.map((item) => item.trail))]
const detailTitles: Record<Detail, string> = {
  evolution: 'Evolução de certificados emitidos',
  trails: 'Certificados por trilha',
  status: 'Status de conclusão dos cursos',
  ranking: 'Ranking de aprendizes',
  popular: 'Cursos mais populares',
}

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<ReportPeriod>('year')
  const [trail, setTrail] = useState<ReportTrailFilter>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [exportMessage, setExportMessage] = useState('')
  const data = useMemo(() => selectReport(period, trail), [period, trail])

  return (
    <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
      <ReportHeader
        period={period}
        onPeriodChange={setPeriod}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((current) => !current)}
        filtered={trail !== 'all'}
        onExport={() => {
          try {
            downloadReportCsv(data)
            setExportMessage('Relatório exportado em CSV com os filtros selecionados.')
          } catch {
            setExportMessage('Não foi possível exportar o relatório. Tente novamente.')
          }
        }}
      />
      <p
        role="status"
        className={
          exportMessage
            ? 'rounded-xl border border-brand-blue-500/20 bg-brand-blue-500/5 px-4 py-3 text-xs text-brand-blue-400'
            : 'sr-only'
        }
      >
        {exportMessage}
      </p>
      {filtersOpen && (
        <div
          id="report-filters"
          className="flex flex-wrap items-end gap-3 rounded-[20px] border border-ink-200/70 bg-panel p-4 shadow-card"
        >
          <label className="flex min-w-[190px] flex-1 flex-col gap-1.5 text-xs font-semibold text-ink-500">
            Trilha dos certificados
            <select
              value={trail}
              onChange={(event) => setTrail(event.target.value as ReportTrailFilter)}
              className="min-h-11 rounded-xl border border-ink-200 bg-panel-alt px-3 text-xs text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
            >
              <option value="all">Todas as trilhas</option>
              {trailNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setPeriod('year')
              setTrail('all')
            }}
            className="min-h-11 rounded-xl border border-ink-200 px-4 text-xs font-bold text-brand-blue-400 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
          >
            Limpar filtros
          </button>
          <p className="basis-full text-[11px] text-ink-500">
            Filtre os certificados por trilha. Cursos, horas e trilhas concluídas mostram o total do
            período.
          </p>
        </div>
      )}
      {trail !== 'all' && (
        <button
          type="button"
          onClick={() => setTrail('all')}
          aria-label={`Remover filtro de trilha: ${trail}`}
          className="inline-flex items-center gap-2 self-start rounded-full border border-brand-blue-500/30 bg-brand-blue-500/10 px-3 py-1.5 text-xs font-semibold text-brand-blue-400 hover:bg-brand-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
        >
          Certificados: {trail}
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
      <ReportStats data={data} />
      <ReportCharts key={`${period}-${trail}`} data={data} onDetails={setDetail} />
      <ReportOverview onDetails={setDetail} />
      {detail && (
        <CertificateDialog title={detailTitles[detail]} onClose={() => setDetail(null)}>
          {(detail === 'evolution' || detail === 'trails') && (
            <p className="text-xs text-ink-500">
              {periodDates[period]}
              {trail !== 'all' ? ` · ${trail}` : ''}
            </p>
          )}
          {detail === 'evolution' && (
            <ul className="divide-y divide-ink-100">
              {data.evolution.map((item) => (
                <li key={item.month} className="flex justify-between gap-3 py-2 text-sm">
                  <span>{item.label}/2024</span>
                  <span className="text-ink-500">
                    {item.certificates} no mês ·{' '}
                    <strong className="text-ink-900">{item.value} acumulados</strong>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {detail === 'trails' &&
            (data.byTrail.length ? (
              <ul className="divide-y divide-ink-100">
                {data.byTrail.map((item) => (
                  <li key={item.name} className="flex justify-between gap-3 py-2 text-sm">
                    <span>{item.name}</span>
                    <strong className="text-ink-900">{item.count}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-5 text-sm text-ink-500">
                Nenhum certificado emitido no filtro selecionado.
              </p>
            ))}
          {detail === 'status' && (
            <ul className="divide-y divide-ink-100">
              {reportCourseStatus.map((item) => (
                <li key={item.label} className="flex justify-between gap-3 py-2 text-sm">
                  <span>{item.label}</span>
                  <strong>{item.count} cursos</strong>
                </li>
              ))}
            </ul>
          )}
          {detail === 'ranking' && (
            <ol className="divide-y divide-ink-100">
              {reportRanking.map((item, index) => (
                <li key={item.name} className="flex flex-wrap justify-between gap-3 py-2 text-sm">
                  <span>
                    {index + 1}º · {item.name}
                  </span>
                  <span className="text-ink-500">
                    {item.certificates} certificados · {item.hours}h
                  </span>
                </li>
              ))}
            </ol>
          )}
          {detail === 'popular' && (
            <ol className="divide-y divide-ink-100">
              {reportPopularCourses.map((item, index) => (
                <li key={item.title} className="flex flex-wrap justify-between gap-3 py-2 text-sm">
                  <span>
                    {index + 1}º · {item.title}
                  </span>
                  <span className="text-ink-500">{item.students} aprendizes</span>
                </li>
              ))}
            </ol>
          )}
        </CertificateDialog>
      )}
    </div>
  )
}
