import { useEffect, useMemo, useState } from 'react'
import { Award, BarChart3, BookOpen, CheckCheck, Download, Route } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../../components/ui/PageHero'
import IllustratedIcon, { type IconTone } from '../../components/ui/IllustratedIcon'
import { fetchMyCourses } from '../MeusCursos/myCoursesApi'
import { fetchCertificates } from '../Certificados/certificatesApi'
import { fetchTrails, type LearningPath } from '../Trilhas/trailApi'
import { fetchAssessments } from '../Avaliacoes/assessmentApi'
import type { CourseItem } from '../MeusCursos/courseTypes'
import type { Certificate } from '../../types/certificate'
import type { Assessment } from '../../types/assessment'
import { buildReport, reportCsv, type ReportPeriod } from './reportData'

const card = 'rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6'

type Source = {
  courses: CourseItem[]
  certificates: Certificate[]
  trails: LearningPath[]
  assessments: Assessment[]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<ReportPeriod>('all')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retry, setRetry] = useState(0)
  const [source, setSource] = useState<Source | null>(null)
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
      if (!controller.signal.aborted) {
        setSource({ courses, certificates, trails, assessments })
        setStatus('ready')
      }
    }).catch(() => {
      if (!controller.signal.aborted) setStatus('error')
    })
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

  const activity = data?.months.some((month) => month.courses || month.certificates || month.assessments) ?? false
  const maxActivity = Math.max(1, ...(data?.months.map((month) => Math.max(month.courses, month.certificates, month.assessments)) ?? []))

  return (
    <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
      <PageHero eyebrow="Seu desenvolvimento" icon={BarChart3} title="Relatórios" description="Acompanhe sua evolução." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-ink-900">Seu panorama de aprendizado</h2>
          <p className="mt-1 text-xs text-ink-500">Inscrições, progresso, avaliações e conquistas da sua conta.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Período do relatório" value={period} onChange={(event) => setPeriod(event.target.value as ReportPeriod)} className="min-h-10 rounded-xl border border-ink-200 bg-panel px-3 text-xs font-semibold text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">
            <option value="all">Todo o período</option>
            <option value="year">{year}</option>
          </select>
          <button type="button" disabled={!data} onClick={exportCsv} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-blue-700 px-4 text-xs font-bold text-white hover:bg-brand-blue-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">
            <Download className="h-4 w-4" aria-hidden="true" />Exportar CSV
          </button>
        </div>
      </div>
      {message && <p role="status" className="text-xs text-brand-blue-400">{message}</p>}
      {status === 'loading' && <div role="status" className={`${card} py-12 text-center text-sm text-ink-500`}>Carregando relatório...</div>}
      {status === 'error' && <div role="alert" className={`${card} flex flex-wrap items-center justify-between gap-3 text-sm`}>
        <span>Não foi possível consultar seus dados. Verifique a conexão com a API.</span>
        <button type="button" onClick={() => { setStatus('loading'); setRetry((value) => value + 1) }} className="rounded-xl bg-brand-blue-700 px-4 py-2 font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Tentar novamente</button>
      </div>}
      {data && status === 'ready' && <>
        <section aria-label="Indicadores" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {([
            { label: 'Cursos inscritos', value: data.enrolled, detail: `${data.totalCompleted} concluídos`, icon: BookOpen, tone: 'blue' as IconTone },
            { label: 'Avaliações realizadas', value: data.attempts, detail: `${data.passedAssessments} aprovadas`, icon: CheckCheck, tone: 'emerald' as IconTone },
            { label: 'Certificados emitidos', value: data.certificates, detail: `${data.certifiedHours}h certificadas`, icon: Award, tone: 'violet' as IconTone },
            { label: 'Trilhas concluídas', value: data.completedTrails, detail: `${data.trails.length} inscritas`, icon: Route, tone: 'orange' as IconTone },
          ]).map(({ label, value, detail, icon, tone }) => (
            <div key={label} className={card}>
              <IllustratedIcon icon={icon} tone={tone} size="compact" />
              <p className="mt-4 text-xs text-ink-500">{label}</p>
              <strong className="mt-2 block text-3xl font-extrabold text-ink-900">{value}</strong>
              <p className="mt-2 text-[11px] text-ink-500">{detail}</p>
            </div>
          ))}
        </section>
        <div className="grid gap-5 lg:grid-cols-2">
          <section className={card}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-base font-extrabold text-ink-900">Progresso dos cursos</h3>
              <span className="text-xs text-ink-500">{data.enrolled} inscrições</span>
            </div>
            {data.courses.length ? <ul className="mt-3 divide-y divide-ink-100">
              {data.courses.map((course) => (
                <li key={course.id} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <Link to={`/cursos/${course.id}/estudar`} className="font-bold text-ink-700 hover:text-brand-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">{course.title}</Link>
                    <strong className="text-brand-blue-400">{course.progress ?? 0}%</strong>
                  </div>
                  <div role="progressbar" aria-label={`Progresso de ${course.title}`} aria-valuenow={course.progress ?? 0} aria-valuemin={0} aria-valuemax={100} className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full bg-gradient-to-r from-brand-blue-600 to-brand-cyan-400" style={{ width: `${course.progress ?? 0}%` }} />
                  </div>
                </li>
              ))}
            </ul> : <p className="mt-5 text-xs text-ink-500">Você ainda não se inscreveu em cursos. <Link to="/cursos" className="font-bold text-brand-blue-400 hover:underline">Explorar cursos</Link></p>}
          </section>
          <section className={card}>
            <h3 className="text-base font-extrabold text-ink-900">Atividade em {year}</h3>
            <p className="mt-1 text-xs text-ink-500">Cursos concluídos, avaliações realizadas e certificados emitidos.</p>
            {activity ? <>
              <div className="mt-6 flex h-40 items-end gap-1.5" role="img" aria-label={data.months.map((month) => `${month.label}: ${month.courses} cursos, ${month.assessments} avaliações e ${month.certificates} certificados`).join('; ')}>
                {data.months.map((month) => <div key={month.month} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1">
                  <div className="flex h-[85%] items-end justify-center gap-0.5">
                    <span className="w-1/4 rounded-t bg-brand-blue-600" style={{ height: `${month.courses / maxActivity * 100}%` }} />
                    <span className="w-1/4 rounded-t bg-brand-cyan-400" style={{ height: `${month.assessments / maxActivity * 100}%` }} />
                    <span className="w-1/4 rounded-t bg-violet-500" style={{ height: `${month.certificates / maxActivity * 100}%` }} />
                  </div>
                  <span className="truncate text-center text-[10px] text-ink-500">{month.label}</span>
                </div>)}
              </div>
              <p className="mt-3 text-[11px] text-ink-500"><span className="text-brand-blue-400">●</span> Cursos &nbsp; <span className="text-brand-cyan-400">●</span> Avaliações &nbsp; <span className="text-violet-400">●</span> Certificados</p>
            </> : <p className="mt-6 rounded-xl bg-panel-alt p-4 text-xs leading-5 text-ink-500">Ainda não há cursos concluídos, avaliações ou certificados em {year}. Suas inscrições e progresso aparecem ao lado.</p>}
          </section>
          <section className={card}>
            <h3 className="text-base font-extrabold text-ink-900">Resultados das avaliações</h3>
            <ul className="mt-3 divide-y divide-ink-100">
              {data.recentAttempts.map((attempt) => <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs">
                <div><p className="font-bold text-ink-700">{attempt.course}</p><p className="mt-1 text-ink-500">{formatDate(attempt.completedAt)} · {attempt.passed ? 'Aprovado' : 'Não aprovado'}</p></div>
                <strong className={attempt.passed ? 'text-emerald-400' : 'text-ink-700'}>{attempt.score}%</strong>
              </li>)}
              {!data.recentAttempts.length && <li className="py-4 text-xs text-ink-500">Nenhuma avaliação realizada neste período.</li>}
            </ul>
            <Link to="/avaliacoes" className="mt-3 inline-flex text-xs font-bold text-brand-blue-400 hover:underline">Ver avaliações</Link>
          </section>
          <section className={card}>
            <h3 className="text-base font-extrabold text-ink-900">Minhas trilhas</h3>
            <ul className="mt-3 divide-y divide-ink-100">
              {data.trails.map((trail) => <li key={trail.id} className="py-3 text-xs">
                <div className="mb-2 flex justify-between gap-3"><span className="font-semibold text-ink-700">{trail.title}</span><strong className="text-brand-blue-400">{trail.progress}%</strong></div>
                <div role="progressbar" aria-label={`Progresso de ${trail.title}`} aria-valuenow={trail.progress} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-ink-100"><div style={{ width: `${trail.progress}%` }} className="h-full bg-brand-blue-600" /></div>
              </li>)}
              {!data.trails.length && <li className="py-4 text-xs text-ink-500">Você ainda não se inscreveu em trilhas.</li>}
            </ul>
            <Link to="/trilhas" className="mt-3 inline-flex text-xs font-bold text-brand-blue-400 hover:underline">Explorar trilhas</Link>
          </section>
        </div>
      </>}
    </div>
  )
}
