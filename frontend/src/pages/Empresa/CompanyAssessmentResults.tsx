import { ArrowUpRight, BookOpen, ClipboardCheck } from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import { averageScore, type Employee, type EmployeeCourse } from './company'

type AssessmentRecord = { id: string; employee: Employee; course: EmployeeCourse }

export default function CompanyAssessmentResults({ records, onSelect }: { records: AssessmentRecord[]; onSelect: (id: string) => void }) {
  const average = averageScore(records.map(record => record.course))
  const people = new Set(records.map(record => record.employee.id)).size
  const courses = new Set(records.map(record => record.course.id)).size
  return <div className="space-y-5">
    <div className="flex flex-col gap-4 rounded-2xl border border-brand-blue-400/20 bg-gradient-to-r from-brand-blue-500/10 to-panel p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
      <div className="flex items-center gap-3 sm:border-r sm:border-ink-200/70 sm:pr-6">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-ink-200/70" /><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" pathLength="100" strokeDasharray={`${average ?? 0} 100`} className="text-brand-blue-400" /></svg>
          <strong className="text-base font-extrabold tabular-nums text-ink-900">{average === null ? '—' : `${average}%`}</strong>
        </div>
        <div><p className="text-xs font-bold text-ink-900">Média das notas</p><p className="mt-1 text-[11px] text-ink-500">Nos resultados filtrados</p></div>
      </div>
      <dl className="grid flex-1 grid-cols-3 gap-3">{[[records.length, 'resultados'], [people, 'pessoas'], [courses, 'cursos']].map(([value, label]) => <div key={label}><dt className="text-[11px] text-ink-500">{label}</dt><dd className="mt-1 text-xl font-extrabold tabular-nums text-ink-900">{value}</dd></div>)}</dl>
    </div>
    {records.length > 0 && <div className="overflow-hidden rounded-2xl border border-ink-200/70 bg-panel">
      <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_130px_110px] gap-5 border-b border-ink-200/70 bg-panel-alt/50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-ink-500 xl:grid"><span>Curso avaliado</span><span>Colaborador</span><span>Última nota</span><span className="text-right">Detalhes</span></div>
      <ul className="divide-y divide-ink-200/60">{records.map(({ id, employee, course }) => <li key={id}>
        <button type="button" onClick={() => onSelect(id)} aria-label={`Ver avaliação de ${employee.name}: ${course.title}`} className="group grid w-full min-w-0 grid-cols-1 items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-brand-blue-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-blue-400 sm:px-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_130px_110px] xl:gap-5">
          <span className="flex min-w-0 items-start gap-3"><span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-blue-400/15 bg-brand-blue-500/5 text-brand-blue-400"><BookOpen className="h-4 w-4" /></span><span className="min-w-0"><span className="block break-words text-xs font-bold leading-5 text-ink-900">{course.title}</span><span className="mt-1 block text-[10px] text-ink-500">{course.category}</span></span></span>
          <span className="flex min-w-0 items-center gap-2.5"><Avatar name={employee.name} email={employee.email} className="h-8 w-8 text-[10px]" /><span className="min-w-0"><span className="block break-words text-xs font-semibold text-ink-700">{employee.name}</span><span className="mt-1 block text-[10px] text-ink-500">{employee.department ?? 'Área não informada'}</span></span></span>
          <span className="min-w-0"><span className="flex items-center justify-between gap-2"><span className="text-[10px] text-ink-500 xl:sr-only">Última nota</span><strong className="text-lg font-extrabold tabular-nums text-brand-blue-300">{course.score === null ? '—' : `${course.score}%`}</strong></span><span aria-hidden="true" className="mt-1.5 block h-1 overflow-hidden rounded-full bg-ink-200/60"><span className="block h-full rounded-full bg-brand-blue-400/80" style={{ width: `${course.score ?? 0}%` }} /></span></span>
          <span className="inline-flex items-center justify-end gap-1.5 border-t border-ink-200/50 pt-3 text-[11px] font-semibold text-brand-blue-400 xl:border-0 xl:pt-0">Ver tentativas<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
        </button>
      </li>)}</ul>
      <p className="flex items-start gap-2 border-t border-ink-200/70 bg-panel-alt/30 px-5 py-3 text-[10px] leading-5 text-ink-500"><ClipboardCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />Uma nota por colaborador e curso, referente à última entrega. Selecione um resultado para consultar tentativas e autorizações.</p>
    </div>}
  </div>
}
