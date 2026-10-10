import { useEffect, useMemo, useState } from 'react'
import { Award, BarChart3, BookCheck, Clock3, Download, Route } from 'lucide-react'
import PageHero from '../../components/ui/PageHero'
import IllustratedIcon from '../../components/ui/IllustratedIcon'
import { fetchMyCourses } from '../MeusCursos/myCoursesApi'
import { fetchCertificates } from '../Certificados/certificatesApi'
import { fetchTrails, type LearningPath } from '../Trilhas/trailApi'
import type { CourseItem } from '../MeusCursos/courseTypes'
import type { Certificate } from '../../types/certificate'
import { buildReport, reportCsv, type ReportPeriod } from './reportData'

const card = 'rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6'

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<ReportPeriod>('all')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retry, setRetry] = useState(0)
  const [source, setSource] = useState<{ courses: CourseItem[]; certificates: Certificate[]; trails: LearningPath[] } | null>(null)
  const [message, setMessage] = useState('')
  const year = new Date().getFullYear()
  const data = useMemo(() => source ? buildReport(source.courses, source.certificates, source.trails, period, year) : null, [source, period, year])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([fetchMyCourses(controller.signal), fetchCertificates(controller.signal), fetchTrails(controller.signal)])
      .then(([courses, certificates, trails]) => { if (!controller.signal.aborted) { setSource({ courses, certificates, trails }); setStatus('ready') } })
      .catch(() => { if (!controller.signal.aborted) setStatus('error') })
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
    <PageHero eyebrow="Seu desenvolvimento" icon={BarChart3} title="Relatórios" description="Acompanhe sua evolução." />
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-lg font-extrabold text-ink-900">Seu panorama de aprendizado</h2><p className="mt-1 text-xs text-ink-500">Dados da sua conta, atualizados pelo progresso dos cursos.</p></div>
      <div className="flex flex-wrap gap-2"><select aria-label="Período do relatório" value={period} onChange={(event) => setPeriod(event.target.value as ReportPeriod)} className="min-h-10 rounded-xl border border-ink-200 bg-panel px-3 text-xs font-semibold text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><option value="all">Todo o período</option><option value="year">{year}</option></select><button type="button" disabled={!data} onClick={exportCsv} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-blue-700 px-4 text-xs font-bold text-white hover:bg-brand-blue-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><Download className="h-4 w-4" aria-hidden="true" />Exportar CSV</button></div>
    </div>
    {message && <p role="status" className="text-xs text-brand-blue-400">{message}</p>}
    {status === 'loading' && <div role="status" className={`${card} py-12 text-center text-sm text-ink-500`}>Carregando relatório...</div>}
    {status === 'error' && <div role="alert" className={`${card} flex flex-wrap items-center justify-between gap-3 text-sm`}><span>Não foi possível carregar o relatório.</span><button type="button" onClick={() => { setStatus('loading'); setRetry((value) => value + 1) }} className="rounded-xl bg-brand-blue-700 px-4 py-2 font-bold text-white hover:bg-brand-blue-600">Tentar novamente</button></div>}
    {data && status === 'ready' && <>
      <section aria-label="Indicadores" className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[
        { label: 'Cursos concluídos', value: data.completed, icon: BookCheck, tone: 'emerald' as const },
        { label: 'Certificados emitidos', value: data.certificates, icon: Award, tone: 'violet' as const },
        { label: 'Horas certificadas', value: `${data.certifiedHours}h`, icon: Clock3, tone: 'orange' as const },
        { label: 'Trilhas concluídas', value: data.completedTrails, icon: Route, tone: 'blue' as const },
      ].map(({ label, value, icon, tone }) => <div key={label} className={card}><IllustratedIcon icon={icon} tone={tone} size="compact" /><p className="mt-4 text-xs text-ink-500">{label}</p><strong className="mt-2 block text-3xl font-extrabold text-ink-900">{value}</strong></div>)}</section>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className={card}><h3 className="text-base font-extrabold text-ink-900">Status dos cursos</h3><p className="mt-1 text-xs text-ink-500">{data.enrolled} inscrições no total</p><div className="mt-5 flex h-3 overflow-hidden rounded-full bg-ink-100"><span style={{ width: `${data.enrolled ? data.completed / data.enrolled * 100 : 0}%` }} className="bg-emerald-500" /><span style={{ width: `${data.enrolled ? data.ongoing / data.enrolled * 100 : 0}%` }} className="bg-brand-blue-600" /></div><dl className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">{[['Concluídos', data.completed], ['Em andamento', data.ongoing], ['Não iniciados', data.notStarted]].map(([label, value]) => <div key={label} className="rounded-xl bg-panel-alt p-3"><dt className="text-ink-500">{label}</dt><dd className="mt-1 text-lg font-extrabold text-ink-900">{value}</dd></div>)}</dl></section>
        <section className={card}><h3 className="text-base font-extrabold text-ink-900">Atividade em {year}</h3><p className="mt-1 text-xs text-ink-500">Cursos concluídos e certificados emitidos por mês</p><div className="mt-6 flex h-40 items-end gap-1.5" role="img" aria-label={data.months.map((m) => `${m.label}: ${m.courses} cursos e ${m.certificates} certificados`).join('; ')}>{data.months.map((month) => <div key={month.month} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1"><div className="flex h-[85%] items-end justify-center gap-0.5"><span className="w-2/5 rounded-t bg-brand-blue-600" style={{ height: `${Math.max(month.courses ? 10 : 0, month.courses * 20)}%` }} /><span className="w-2/5 rounded-t bg-brand-cyan-400" style={{ height: `${Math.max(month.certificates ? 10 : 0, month.certificates * 20)}%` }} /></div><span className="truncate text-center text-[10px] text-ink-500">{month.label}</span></div>)}</div><p className="mt-3 text-[11px] text-ink-500"><span className="text-brand-blue-400">●</span> Cursos &nbsp; <span className="text-brand-cyan-400">●</span> Certificados</p></section>
        <section className={card}><h3 className="text-base font-extrabold text-ink-900">Cursos concluídos</h3><ul className="mt-4 divide-y divide-ink-100">{data.recentCourses.map((course) => <li key={course.id} className="flex justify-between gap-3 py-3 text-xs"><span className="font-semibold text-ink-700">{course.title}</span><span className="shrink-0 text-ink-500">{course.completedAt}</span></li>)}{!data.recentCourses.length && <li className="py-4 text-xs text-ink-500">Nenhum curso concluído neste período.</li>}</ul></section>
        <section className={card}><h3 className="text-base font-extrabold text-ink-900">Minhas trilhas</h3><ul className="mt-4 divide-y divide-ink-100">{data.trails.map((trail) => <li key={trail.id} className="py-3 text-xs"><div className="mb-2 flex justify-between gap-3"><span className="font-semibold text-ink-700">{trail.title}</span><strong className="text-brand-blue-400">{trail.progress}%</strong></div><div role="progressbar" aria-label={`Progresso de ${trail.title}`} aria-valuenow={trail.progress} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-ink-100"><div style={{ width: `${trail.progress}%` }} className="h-full bg-brand-blue-600" /></div></li>)}{!data.trails.length && <li className="py-4 text-xs text-ink-500">Você ainda não se inscreveu em trilhas.</li>}</ul></section>
      </div>
    </>}
  </div>
}
