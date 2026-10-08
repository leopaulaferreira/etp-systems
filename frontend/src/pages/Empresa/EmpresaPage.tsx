import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, BookCheck, Building2, ChevronRight, ClipboardCheck, GraduationCap, UsersRound } from 'lucide-react'
import PageHero from '../../components/ui/PageHero'
import IllustratedIcon, { type IconTone } from '../../components/ui/IllustratedIcon'
import Avatar from '../../components/ui/Avatar'
import { useCompanySettings } from './companySettings'
import { useAuth } from '../../auth/AuthContext'
import { employees, company } from '../../mocks/company.mock'
import { companyEmployees, companySummary, formatCompanyDate, recentCompletions } from './company'
import EmployeeDialog from './EmployeeDialog'

const cardClass = 'min-w-0 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6'

export default function EmpresaPage() {
  const { companyId } = useAuth()
  const { settings } = useCompanySettings(companyId)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // O painel ainda usa dados sintéticos até a integração do domínio Empresa/RH.
  const team = companyEmployees(employees, company.id)
  const summary = companySummary(team)
  const recent = recentCompletions(team)
  const selected = team.find((employee) => employee.id === selectedId)
  const metrics = [
    { label: 'Colaboradores', value: summary.total, detail: 'Pessoas vinculadas à empresa', icon: UsersRound, tone: 'blue' },
    { label: 'Em aprendizagem', value: summary.learning, detail: 'Com cursos em andamento', icon: GraduationCap, tone: 'teal' },
    { label: 'Cursos concluídos', value: summary.completed, detail: `${summary.certificates} certificados emitidos`, icon: BookCheck, tone: 'violet' },
    { label: 'Média nas avaliações', value: summary.average === null ? '—' : `${summary.average}%`, detail: `${summary.assessments} notas · última entrega por curso`, icon: ClipboardCheck, tone: 'orange' },
  ]


  return (
    <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
      <PageHero eyebrow={settings.name} icon={Building2} title="Painel da empresa" description="Acompanhe o desenvolvimento dos seus colaboradores." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon, tone }) => <div key={label} className="relative overflow-hidden rounded-[20px] border border-ink-200/70 bg-panel p-5 shadow-card">
          <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-blue-500/5" />
          <div className="flex items-center gap-3"><IllustratedIcon icon={icon} tone={tone as IconTone} size="metric" /><div><p className="text-xs font-semibold text-ink-500">{label}</p><p className="mt-1 text-[30px] font-extrabold leading-tight tracking-tight text-ink-900">{value}</p></div></div>
          <p className="mt-4 border-t border-ink-100 pt-3 text-[11px] text-ink-500">{detail}</p>
        </div>)}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className={cardClass} aria-labelledby="company-progress-title">
          <h2 id="company-progress-title" className="text-[17px] font-extrabold text-ink-900">Progresso da equipe</h2>
          <p className="mt-1 text-xs leading-5 text-ink-500">Distribuição das {summary.courses} inscrições em cursos.</p>
          <div aria-hidden="true" className="mt-6 flex h-4 overflow-hidden rounded-full bg-ink-100">
            {summary.distribution.map((item) => <div key={item.label} className={item.color} style={{ width: `${summary.courses ? item.count / summary.courses * 100 : 0}%` }} />)}
          </div>
          <ul className="mt-5 flex flex-col gap-3">
            {summary.distribution.map((item) => <li key={item.label} className="flex items-center gap-2.5 text-xs"><span aria-hidden="true" className={`h-2 w-2 rounded-full ${item.color}`} /><span className="flex-1 text-ink-700">{item.label}</span><strong className="text-ink-900">{item.count}</strong><span className="w-10 text-right text-ink-500">{summary.courses ? Math.round(item.count / summary.courses * 100) : 0}%</span></li>)}
          </ul>
          {!summary.courses && <p className="mt-4 text-xs text-ink-500">Ainda não há inscrições para acompanhar.</p>}
        </section>
        <section className={cardClass} aria-labelledby="company-recent-title">
          <div className="flex items-center justify-between gap-2"><h2 id="company-recent-title" className="text-[17px] font-extrabold text-ink-900">Conclusões recentes</h2><Award className="h-5 w-5 text-brand-cyan-400" aria-hidden="true" /></div>
          <p className="mt-1 text-xs leading-5 text-ink-500">Os últimos passos da equipe na jornada de aprendizagem.</p>
          <ul className="mt-3 divide-y divide-ink-100">
            {recent.map(({ employee, course }) => <li key={`${employee.id}-${course.id}`}><button type="button" onClick={() => setSelectedId(employee.id)} aria-label={`Ver resumo de ${employee.name}`} className="flex w-full items-center gap-3 rounded-xl py-3 text-left transition-colors hover:bg-ink-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><Avatar name={employee.name} className="h-9 w-9 text-xs" /><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-ink-900">{employee.name}</span><span className="mt-1 block truncate text-[11px] text-ink-500" title={course.title}>{course.title}</span></span><span className="shrink-0 text-[10px] text-ink-500">{formatCompanyDate(course.completedAt)}</span><ChevronRight className="h-3.5 w-3.5 shrink-0 text-brand-blue-400" aria-hidden="true" /></button></li>)}
          </ul>
          {!recent.length && <p className="mt-6 text-sm text-ink-500">As conclusões dos cursos aparecerão aqui.</p>}
        </section>
      </div>
      <Link to="/empresa/colaboradores" className="flex items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-panel p-5 text-sm font-semibold text-brand-blue-400 transition-colors hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Explorar colaboradores e progresso individual<ChevronRight className="h-5 w-5 shrink-0" /></Link>
      {selected && <EmployeeDialog employee={selected} onClose={() => setSelectedId(null)} />}
    </div>
  )
}
