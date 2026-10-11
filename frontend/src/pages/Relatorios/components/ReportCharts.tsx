import IllustratedIcon from '../../../components/ui/IllustratedIcon'
import { useId, useState } from 'react'
import { ClipboardCheck, TrendingUp } from 'lucide-react'
import type { ReportData } from '../reportData'
import ReportPanel from './ReportPanel'

export default function ReportCharts({ data, year, onDetails }: {
  data: ReportData
  year: number
  onDetails: (kind: 'evolution' | 'distribution') => void
}) {
  const [mode, setMode] = useState<'cumulative' | 'monthly'>('cumulative')
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const gradientId = useId()
  const series = data.months.map((month, index) => ({
    ...month,
    value: data.months.slice(0, index + 1).reduce((total, item) => total + item.assessments, 0),
  }))
  const highest = Math.max(1, ...series.map((month) => mode === 'cumulative' ? month.value : month.assessments))
  const maximum = highest <= 4 ? highest : Math.ceil(highest / 4) * 4
  const tickCount = Math.min(4, maximum)
  const points = series.map((month, index) => {
    const plotted = mode === 'cumulative' ? month.value : month.assessments
    return { ...month, plotted, x: 28 + index * 544 / 11, y: 194 - plotted / maximum * 154 }
  })
  const selected = points.find((point) => point.month === selectedMonth)
    ?? [...points].reverse().find((point) => point.assessments > 0)
    ?? points.at(-1)!
  const line = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const area = `M ${points[0].x} 194 L ${points.map(({ x, y }) => `${x} ${y}`).join(' L ')} L ${points.at(-1)!.x} 194 Z`
  const maximumByCourse = Math.max(1, ...data.assessmentsByCourse.map((item) => item.count))
  const colors = ['bg-brand-blue-500', 'bg-brand-cyan-400', 'bg-violet-400', 'bg-emerald-400', 'bg-orange-400']

  return <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
    <ReportPanel title="Evolução das avaliações" eyebrow="Sua atividade ao longo do tempo" onDetails={() => onDetails('evolution')}>
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 sm:px-6">
        <div><p className="text-[11px] font-semibold text-ink-500">{selected.label} / {year}</p><p className="mt-1 flex items-baseline gap-2"><strong className="text-3xl font-extrabold tracking-tight text-ink-900">{selected.plotted}</strong><span className="text-[11px] text-ink-500">{mode === 'cumulative' ? 'realizadas até este mês' : 'realizadas no mês'}</span></p></div>
        <div role="group" aria-label="Visualização da evolução" className="inline-flex rounded-xl border border-ink-200/70 bg-surface-alt p-1">
          {(['cumulative', 'monthly'] as const).map((value) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)} className={`min-h-8 rounded-lg px-3 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 ${mode === value ? 'bg-panel-alt text-brand-blue-400 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}>{value === 'cumulative' ? 'Acumulado' : 'Mensal'}</button>)}
        </div>
      </div>
      <label className="mx-5 mt-4 flex items-center justify-between gap-3 text-[11px] text-ink-500 sm:hidden">Mês em destaque<select value={selected.month} onChange={(event) => setSelectedMonth(Number(event.target.value))} className="min-h-10 rounded-xl border border-ink-200 bg-panel-alt px-3 text-xs font-semibold text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">{points.map((point) => <option key={point.month} value={point.month}>{point.label} / {year}</option>)}</select></label>
      <div className="mt-3 px-3 sm:px-5">
        <svg viewBox="0 0 600 240" className="w-full overflow-visible" role="group" aria-label={`Evolução de avaliações ${mode === 'cumulative' ? 'acumuladas' : 'por mês'}. Selecione um mês para ver o valor.`}>
          <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-brand-blue-500)" stopOpacity="0.26" /><stop offset="100%" stopColor="var(--color-brand-blue-500)" stopOpacity="0.01" /></linearGradient></defs>
          {Array.from({ length: tickCount + 1 }, (_, tick) => { const value = tick * maximum / tickCount; const y = 194 - value / maximum * 154; return <g key={tick} aria-hidden="true"><line x1="28" x2="572" y1={y} y2={y} stroke="var(--color-ink-200)" strokeDasharray="3 5" opacity="0.75" /><text x="6" y={y + 4} fill="var(--color-ink-500)" fontSize="12">{value}</text></g> })}
          <path d={area} fill={`url(#${gradientId})`} /><polyline points={line} fill="none" stroke="var(--color-brand-blue-400)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          <line x1={selected.x} x2={selected.x} y1="30" y2="194" stroke="var(--color-brand-cyan-400)" strokeDasharray="3 5" opacity="0.35" />
          {points.map((point, index) => <g key={point.month} role="button" tabIndex={0} aria-label={`${point.label} de ${year}: ${point.plotted} avaliações ${mode === 'cumulative' ? 'acumuladas' : 'realizadas'}`} aria-pressed={selected.month === point.month} onFocus={() => setSelectedMonth(point.month)} onMouseEnter={() => setSelectedMonth(point.month)} onClick={() => setSelectedMonth(point.month)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedMonth(point.month) } }} className="cursor-pointer outline-none [&:focus-visible>circle:first-of-type]:stroke-brand-cyan-400">
            <circle cx={point.x} cy={point.y} r="15" fill="transparent" stroke="transparent" strokeWidth="2" /><circle cx={point.x} cy={point.y} r={selected.month === point.month ? 8 : 4} fill={selected.month === point.month ? 'var(--color-brand-cyan-400)' : 'var(--color-brand-blue-400)'} stroke="var(--color-panel)" strokeWidth="3" />
            <text aria-hidden="true" x={point.x} y="226" textAnchor="middle" fill={selected.month === point.month ? 'var(--color-ink-900)' : 'var(--color-ink-500)'} fontSize="13" className={index % 3 !== 0 && index !== points.length - 1 ? 'hidden sm:block' : ''}>{point.label}</text>
          </g>)}
        </svg>
      </div>
      <div className="mt-auto flex items-center gap-2 border-t border-ink-100 px-5 py-4 text-[11px] text-ink-500 sm:px-6"><TrendingUp className="h-4 w-4 shrink-0 text-brand-cyan-400" aria-hidden="true" /><span><strong className="font-bold text-ink-700">{data.months.reduce((total, month) => total + month.assessments, 0)} avaliações</strong> realizadas em {year}. Selecione um ponto para explorar.</span></div>
    </ReportPanel>
    <ReportPanel title="Avaliações por curso" eyebrow="Distribuição das tentativas" onDetails={() => onDetails('distribution')}>
      {data.assessmentsByCourse.length ? <div className="flex flex-1 flex-col gap-5 px-5 pb-6 sm:px-6">{data.assessmentsByCourse.map((item, index) => <div key={item.name}><div className="mb-2 flex items-center gap-2 text-xs"><span className="flex-1 font-semibold text-ink-700">{item.name}</span><strong className="text-ink-900">{item.count}</strong></div><div role="meter" aria-label={`Avaliações em ${item.name}`} aria-valuemin={0} aria-valuemax={maximumByCourse} aria-valuenow={item.count} className="h-2 overflow-hidden rounded-full bg-ink-100"><span className={`block h-full rounded-full ${colors[index % colors.length]}`} style={{ width: `${item.count / maximumByCourse * 100}%` }} /></div></div>)}</div> : <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center"><IllustratedIcon icon={ClipboardCheck} tone="blue" size="tile" /><p className="text-sm font-bold text-ink-700">Nenhuma avaliação neste recorte</p><p className="text-xs leading-5 text-ink-500">Os resultados aparecerão aqui quando você realizar uma avaliação.</p></div>}
      <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-5 py-4 text-[11px] text-ink-500 sm:px-6"><span>Cursos avaliados</span><strong className="text-ink-700">{data.assessmentsByCourse.length}</strong></div>
    </ReportPanel>
  </div>
}
