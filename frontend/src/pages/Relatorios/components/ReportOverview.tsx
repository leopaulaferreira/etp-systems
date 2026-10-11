import IllustratedIcon from '../../../components/ui/IllustratedIcon'
import { ClipboardCheck, GraduationCap, Medal } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '../../../components/ui/Avatar'
import CourseThumbnail from '../../MeusCursos/components/CourseThumbnail'
import type { ReportData } from '../reportData'
import ReportPanel from './ReportPanel'

const statusColors = [
  { label: 'Concluídos', color: 'var(--color-emerald-500, #10b981)', dot: 'bg-emerald-500' },
  { label: 'Em andamento', color: 'var(--color-brand-blue-600)', dot: 'bg-brand-blue-600' },
  { label: 'Não iniciados', color: 'var(--color-orange-500, #f97316)', dot: 'bg-orange-500' },
]

export default function ReportOverview({ data, onDetails }: {
  data: ReportData
  onDetails: (kind: 'status' | 'results' | 'courses') => void
}) {
  const status = [data.totalCompleted, data.ongoing, data.notStarted]
  const total = data.enrolled
  const average = total ? Math.round(data.courses.reduce((sum, course) => sum + (course.progress ?? 0), 0) / total) : 0
  return <div className="flex min-w-0 flex-col gap-4">
    <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-lg font-extrabold tracking-tight text-ink-900">Seu panorama de aprendizado</h2><span className="text-[11px] text-ink-500">Visão geral · dados da sua conta</span></div>
    <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <ReportPanel title="Status de conclusão" eyebrow="Seu avanço nos cursos" onDetails={() => onDetails('status')}>
        <div className="relative mx-auto mb-4 h-48 w-48">
          <svg viewBox="0 0 192 192" className="h-full w-full -rotate-90" role="img" aria-label={statusColors.map((item, index) => `${item.label}: ${status[index]} cursos`).join('; ')}>
            <circle cx="96" cy="96" r="62" fill="var(--color-panel-alt)" stroke="var(--color-ink-100)" strokeWidth="1" />
            <circle cx="96" cy="96" r="80" pathLength="100" fill="none" stroke="var(--color-ink-100)" strokeWidth="18" />
            {total > 0 && statusColors.map((item, index) => {
              const start = status.slice(0, index).reduce((sum, count) => sum + count, 0) / total * 100
              const portion = status[index] / total * 100
              return portion > 0 && <circle key={item.label} cx="96" cy="96" r="80" pathLength="100" fill="none" stroke={item.color} strokeWidth="18" strokeDasharray={`${portion} ${100 - portion}`} strokeDashoffset={-start} strokeLinecap="butt" />
            })}
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center"><span className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-ink-500">Seu progresso</span><strong className="flex items-baseline gap-0.5 text-[38px] font-extrabold leading-none tracking-[-0.04em] text-ink-900">{average}<span className="text-lg font-semibold text-ink-500">%</span></strong><span className="mt-2 text-[10px] font-medium text-ink-500">{data.totalCompleted} de {total} concluídos</span></span>
        </div>
        <ul className="flex flex-1 flex-col gap-3 px-5 pb-5 sm:px-6">{statusColors.map((item, index) => <li key={item.label} className="flex items-center justify-between gap-3 text-xs"><span className="flex items-center gap-2 text-ink-500"><span aria-hidden="true" className={`h-2 w-2 rounded-full ${item.dot}`} />{item.label}</span><span className="font-semibold text-ink-700">{status[index]}<span className="ml-3 inline-block w-8 text-right text-[10px] font-normal text-ink-500">{total ? Math.round(status[index] / total * 100) : 0}%</span></span></li>)}</ul>
        <p className="border-t border-ink-100 px-5 py-4 text-center text-[11px] text-ink-500"><strong className="font-semibold text-ink-700">{data.totalCompleted} de {total} cursos</strong> concluídos na sua jornada</p>
      </ReportPanel>
      <ReportPanel title="Resultados das avaliações" eyebrow="Seu desempenho nas atividades" actionLabel="Ver avaliações" onDetails={() => onDetails('results')}>
        <ol className="flex flex-1 flex-col gap-1 px-3 pb-3 sm:px-4">
          {data.recentAttempts.map((item, index) => <li key={item.id} className={`flex items-center gap-2.5 rounded-xl px-2 py-3 ${index === 0 ? 'border border-brand-blue-500/20 bg-brand-blue-500/10' : 'border border-transparent'}`}>
            <span className="flex w-5 shrink-0 items-center justify-center text-[11px] font-bold text-ink-500">{index + 1}º</span>
            <Avatar name={item.course} className="h-8 w-8 text-[10px]" />
            <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold leading-5 text-ink-900" title={item.course}>{item.course}</span><span className="block text-[10px] text-ink-500">{new Intl.DateTimeFormat('pt-BR').format(new Date(item.completedAt))} · {item.passed ? 'Aprovado' : 'Não aprovado'}</span></span>
            <span className="flex shrink-0 flex-col items-center text-sm font-extrabold text-ink-700">{item.score}%<Medal className="mt-1 h-3 w-3 text-ink-500" aria-hidden="true" /></span>
          </li>)}
          {!data.recentAttempts.length && <li className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-9 text-center text-xs text-ink-500"><IllustratedIcon icon={ClipboardCheck} tone="blue" size="compact" />Nenhuma avaliação realizada neste período.</li>}
        </ol>
        <p className="border-t border-ink-100 px-5 py-4 text-center text-[11px] text-ink-500">{data.attempts} tentativas registradas · {data.passedAssessments} aprovadas</p>
      </ReportPanel>
      <ReportPanel title="Seus cursos" eyebrow="Continue de onde parou" actionLabel="Ver meus cursos" onDetails={() => onDetails('courses')} className="md:col-span-2 xl:col-span-1">
        <ol className="flex flex-1 flex-col gap-4 px-5 pb-5 sm:px-6">
          {data.courses.slice(0, 5).map((course, index) => <li key={course.id} className="flex min-w-0 items-center gap-3"><CourseThumbnail thumbnail={course.thumbnail} size="small" /><div className="min-w-0 flex-1"><Link to={`/cursos/${course.id}/estudar`} className="text-[11px] font-bold leading-5 text-ink-900 hover:text-brand-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">{course.title}</Link><div className="mt-1.5 flex items-center gap-2"><div role="progressbar" aria-label={`Progresso de ${course.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={course.progress ?? 0} className="h-1 flex-1 overflow-hidden rounded-full bg-ink-100"><span className={`block h-full rounded-full ${index === 0 ? 'bg-brand-cyan-400' : 'bg-brand-blue-500/70'}`} style={{ width: `${course.progress ?? 0}%` }} /></div><span className="flex w-8 shrink-0 items-center justify-end gap-1 text-[10px] text-ink-500">{course.progress ?? 0}%</span></div></div></li>)}
          {!data.courses.length && <li className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-9 text-center text-xs text-ink-500"><IllustratedIcon icon={GraduationCap} tone="blue" size="compact" />Você ainda não se inscreveu em cursos.</li>}
        </ol>
        <p className="border-t border-ink-100 px-5 py-4 text-center text-[11px] text-ink-500">Progresso dos cursos em que você se inscreveu</p>
      </ReportPanel>
    </div>
  </div>
}
