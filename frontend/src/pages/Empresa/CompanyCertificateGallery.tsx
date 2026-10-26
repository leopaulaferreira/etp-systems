import { ArrowUpRight, Award, CalendarDays } from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import { formatCompanyDate, type Employee, type EmployeeCourse } from './company'

type CertificateRecord = { id: string; employee: Employee; course: EmployeeCourse }

export default function CompanyCertificateGallery({ records, onSelect }: { records: CertificateRecord[]; onSelect: (id: string) => void }) {
  return <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{records.map(({ id, employee, course }) => <li key={id} className="min-w-0">
    <button type="button" onClick={() => onSelect(id)} aria-label={`Ver certificado de ${employee.name}: ${course.title}`} className="group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-panel text-left transition-colors hover:border-violet-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">
      <span aria-hidden="true" className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-violet-400/60 via-violet-400/20 to-transparent" />
      <span className="flex w-full flex-1 flex-col p-5">
        <span className="flex items-start justify-between gap-4"><span className="min-w-0"><span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-violet-300">Certificado de conclusão</span><span className="mt-2 block text-[11px] text-ink-500">{course.category}</span></span><span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/5 text-violet-300"><Award className="h-6 w-6" strokeWidth={1.5} /></span></span>
        <span className="mb-5 mt-3 block flex-1 break-words text-base font-bold leading-6 text-ink-900">{course.title}</span>
        <span className="flex min-w-0 items-center gap-2.5"><Avatar name={employee.name} email={employee.email} className="h-8 w-8 text-[10px]" /><span className="min-w-0"><span className="block break-words text-xs font-bold text-ink-700">{employee.name}</span><span className="mt-0.5 block text-[10px] text-ink-500">{employee.department ?? 'Área não informada'}</span></span></span>
      </span>
      <span className="block w-full border-t border-ink-200/60 bg-panel-alt/40 px-5 py-3"><span className="flex flex-wrap items-center justify-between gap-2"><span className="inline-flex items-center gap-1.5 text-[10px] text-ink-500"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{course.certificateIssuedAt ? `Emitido em ${formatCompanyDate(course.certificateIssuedAt)}` : 'Data de emissão não informada'}</span><span className="inline-flex min-h-6 items-center gap-1 text-[10px] font-semibold text-violet-300">Ver detalhes<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></span></span><span className="mt-2 block break-all font-mono text-[9px] leading-4 text-ink-500">{course.certificateCode}</span></span>
    </button>
  </li>)}</ul>
}
