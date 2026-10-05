import { Award, BookOpen, CalendarDays, Mail } from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import CertificateDialog from '../Certificados/components/CertificateDialog'
import { averageScore, employeeProgress, formatCompanyDate, type Employee } from './company'

export default function EmployeeDialog({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const score = averageScore(employee.courses)
  return (
    <CertificateDialog title="Resumo do colaborador" onClose={onClose}>
      <div className="flex items-center gap-4">
        <Avatar name={employee.name} className="h-14 w-14 text-lg" />
        <div className="min-w-0"><h3 className="text-lg font-extrabold">{employee.name}</h3><p className="mt-1 text-xs text-brand-blue-400">{employee.department}</p><p className="mt-2 flex items-center gap-1.5 break-all text-xs text-ink-500"><Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{employee.email}</p></div>
      </div>
      <dl className="grid grid-cols-3 gap-2 rounded-2xl border border-ink-200 bg-panel-alt/50 p-4 text-center">
        {[['Progresso médio', `${employeeProgress(employee)}%`], ['Nota média', score === null ? '—' : `${score}%`], ['Certificados', employee.courses.filter((c) => c.certificateCode).length]].map(([label, value]) => <div key={label}><dt className="text-[11px] text-ink-500">{label}</dt><dd className="mt-1 text-xl font-extrabold">{value}</dd></div>)}
      </dl>
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><BookOpen className="h-4 w-4 text-brand-blue-400" aria-hidden="true" />Cursos e trilhas</h3>
        <ul className="flex flex-col gap-3">
          {employee.courses.map((course) => <li key={course.id} className="rounded-2xl border border-ink-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-brand-blue-400">{course.track}</p>
            <h4 className="mt-1 text-sm font-bold">{course.title}</h4>
            <div className="mt-3 flex justify-between text-xs text-ink-500"><span>{course.progress === 100 ? 'Concluído' : course.progress ? 'Em andamento' : 'Não iniciado'}</span><span>{course.progress}%</span></div>
            <div role="progressbar" aria-label={`Progresso em ${course.title}`} aria-valuenow={course.progress} aria-valuemin={0} aria-valuemax={100} className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-gradient-to-r from-brand-blue-600 to-brand-cyan-400" style={{ width: `${course.progress}%` }} /></div>
            <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-ink-500"><span>Última nota: <strong className="text-ink-700">{course.score === null ? 'Sem avaliação entregue' : `${course.score}%`}</strong></span><span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{formatCompanyDate(course.updatedAt)}</span></div>
            {course.certificateCode && <p className="mt-3 flex items-center gap-2 border-t border-ink-100 pt-3 text-xs text-brand-cyan-400"><Award className="h-4 w-4 shrink-0" aria-hidden="true" /><span>Certificado {course.certificateCode} · {formatCompanyDate(course.completedAt)}</span></p>}
          </li>)}
        </ul>
        {!employee.courses.length && <p className="text-sm text-ink-500">Nenhum curso atribuído a este colaborador.</p>}
      </div>
    </CertificateDialog>
  )
}
