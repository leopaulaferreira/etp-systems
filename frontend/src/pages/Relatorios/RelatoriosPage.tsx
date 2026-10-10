import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyCourses } from '../MeusCursos/myCoursesApi'
import { fetchCertificates } from '../Certificados/certificatesApi'
import { fetchTrails, type LearningPath } from '../Trilhas/trailApi'
import { fetchAssessments } from '../Avaliacoes/assessmentApi'
import CertificateDialog from '../Certificados/components/CertificateDialog'
import type { CourseItem } from '../MeusCursos/courseTypes'
import type { Certificate } from '../../types/certificate'
import type { Assessment } from '../../types/assessment'
import { buildReport, reportCsv, type ReportPeriod } from './reportData'
import ReportHeader from './components/ReportHeader'
import ReportStats from './components/ReportStats'
import ReportCharts from './components/ReportCharts'
import ReportOverview from './components/ReportOverview'

const card = 'rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6'
type Detail = 'evolution' | 'distribution' | 'status' | 'results' | 'courses'
type Source = { courses: CourseItem[]; certificates: Certificate[]; trails: LearningPath[]; assessments: Assessment[] }
const detailTitles: Record<Detail, string> = {
  evolution: 'Evolução das avaliações',
  distribution: 'Avaliações por curso',
  status: 'Status de conclusão dos cursos',
  results: 'Resultados das avaliações',
  courses: 'Seus cursos',
}

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<ReportPeriod>('all')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retry, setRetry] = useState(0)
  const [source, setSource] = useState<Source | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [message, setMessage] = useState('')
  const year = new Date().getFullYear()
  const data = useMemo(() => source
    ? buildReport(source.courses, source.certificates, source.trails, source.assessments, period, year)
    : null, [source, period, year])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      fetchMyCourses(controller.signal),
      fetchCertificates(controller.signal),
      fetchTrails(controller.signal),
      fetchAssessments(controller.signal),
    ]).then(([courses, certificates, trails, assessments]) => {
      if (!controller.signal.aborted) { setSource({ courses, certificates, trails, assessments }); setStatus('ready') }
    }).catch(() => { if (!controller.signal.aborted) setStatus('error') })
    return () => controller.abort()
  }, [retry])

  function exportCsv() {
    if (!data) return
    const url = URL.createObjectURL(new Blob([reportCsv(data, year)], { type: 'text/csv;charset=utf-8;' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `etp-relatorio-${period}-${year}.csv`
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Relatório exportado em CSV.')
  }

  return <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
    <ReportHeader period={period} onPeriodChange={setPeriod} onExport={exportCsv} year={year} canExport={!!data} />
    <p role="status" className={message ? 'rounded-xl border border-brand-blue-500/20 bg-brand-blue-500/5 px-4 py-3 text-xs text-brand-blue-400' : 'sr-only'}>{message}</p>
    {status === 'loading' && <div role="status" className={`${card} py-12 text-center text-sm text-ink-500`}>Carregando relatório...</div>}
    {status === 'error' && <div role="alert" className={`${card} flex flex-wrap items-center justify-between gap-3 text-sm`}><span>Não foi possível consultar seus dados. Verifique a conexão com a API.</span><button type="button" onClick={() => { setStatus('loading'); setRetry((value) => value + 1) }} className="rounded-xl bg-brand-blue-700 px-4 py-2 font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Tentar novamente</button></div>}
    {data && status === 'ready' && <>
      <ReportStats data={data} />
      <ReportCharts key={period} data={data} year={year} onDetails={setDetail} />
      <ReportOverview data={data} onDetails={setDetail} />
      {detail && <CertificateDialog title={detailTitles[detail]} onClose={() => setDetail(null)}>
        {(detail === 'evolution' || detail === 'distribution') && <p className="text-xs text-ink-500">{period === 'year' ? `Ano de ${year}` : 'Todo o período'}</p>}
        {detail === 'evolution' && <ul className="divide-y divide-ink-100">{data.months.map((month) => <li key={month.month} className="flex justify-between gap-3 py-2 text-sm"><span>{month.label}/{year}</span><strong className="text-ink-900">{month.assessments} avaliações</strong></li>)}</ul>}
        {detail === 'distribution' && <ul className="divide-y divide-ink-100">{data.assessmentsByCourse.map((item) => <li key={item.name} className="flex justify-between gap-3 py-2 text-sm"><span>{item.name}</span><strong>{item.count}</strong></li>)}{!data.assessmentsByCourse.length && <li className="py-4 text-sm text-ink-500">Nenhuma avaliação neste período.</li>}</ul>}
        {detail === 'status' && <ul className="divide-y divide-ink-100">{[['Concluídos', data.totalCompleted], ['Em andamento', data.ongoing], ['Não iniciados', data.notStarted]].map(([label, count]) => <li key={label} className="flex justify-between gap-3 py-2 text-sm"><span>{label}</span><strong>{count} cursos</strong></li>)}</ul>}
        {detail === 'results' && <ul className="divide-y divide-ink-100">{data.recentAttempts.map((item) => <li key={item.id} className="flex justify-between gap-3 py-2 text-sm"><span>{item.course}</span><strong>{item.score}% · {item.passed ? 'Aprovado' : 'Não aprovado'}</strong></li>)}{!data.recentAttempts.length && <li className="py-4 text-sm text-ink-500">Nenhuma avaliação neste período.</li>}</ul>}
        {detail === 'courses' && <ul className="divide-y divide-ink-100">{data.courses.map((course) => <li key={course.id} className="flex justify-between gap-3 py-2 text-sm"><Link to={`/cursos/${course.id}/estudar`} className="text-brand-blue-400 hover:underline">{course.title}</Link><strong>{course.progress ?? 0}%</strong></li>)}{!data.courses.length && <li className="py-4 text-sm text-ink-500">Nenhum curso inscrito.</li>}</ul>}
      </CertificateDialog>}
    </>}
  </div>
}
