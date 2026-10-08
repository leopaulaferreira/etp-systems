import { useState } from 'react'
import { ChevronRight, Search, SearchX, UsersRound } from 'lucide-react'
import PageHero from '../../components/ui/PageHero'
import Avatar from '../../components/ui/Avatar'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useCompanySettings } from './companySettings'
import { useAuth } from '../../auth/AuthContext'
import { employees, company } from '../../mocks/company.mock'
import { averageScore, companyEmployees, employeeProgress, employeeStatus, filterEmployees, statusLabels, type EmployeeStatus } from './company'
import EmployeeDialog from './EmployeeDialog'

const statusClasses = { not_started: 'border-ink-200 bg-ink-100 text-ink-500', in_progress: 'border-brand-blue-400/20 bg-brand-blue-500/10 text-brand-blue-400', completed: 'border-brand-cyan-400/20 bg-brand-cyan-400/10 text-brand-cyan-400' }

export default function ColaboradoresPage() {
  const { companyId } = useAuth()
  const { settings } = useCompanySettings(companyId)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<EmployeeStatus | 'all'>('all')
  const [department, setDepartment] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const team = companyEmployees(employees, company.id)
  const visible = filterEmployees(team, query, status, department)
  const selected = team.find((employee) => employee.id === selectedId)
  const filtered = Boolean(query || status !== 'all' || department)
  const departments = [...new Set(team.map((employee) => employee.department))].sort()
  function resetFilters() { setQuery(''); setStatus('all'); setDepartment('') }
  return <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
    <PageHero eyebrow={settings.name} icon={UsersRound} title="Colaboradores" description="Consulte o desenvolvimento de cada pessoa da equipe." />
      <section className="min-w-0 overflow-hidden rounded-[22px] border border-ink-200/70 bg-panel shadow-card" aria-labelledby="company-team-title">
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 id="company-team-title" className="text-[17px] font-extrabold text-ink-900">Colaboradores</h2><p className="mt-1 text-xs text-ink-500">Selecione uma pessoa para consultar cursos, notas e certificados.</p></div>{filtered && <Button type="button" variant="ghost" onClick={resetFilters}>Limpar filtros</Button>}</div>
          <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_180px_190px]">
            <Input id="company-search" type="search" tone="dark" label="Buscar colaborador" placeholder="Nome ou e-mail..." value={query} onChange={(event) => setQuery(event.target.value)} icon={<Search className="h-4 w-4" aria-hidden="true" />} />
            <div className="flex flex-col gap-1.5"><label htmlFor="company-status" className="text-[13px] font-semibold text-ink-700">Situação</label><select id="company-status" value={status} onChange={(event) => setStatus(event.target.value as EmployeeStatus | 'all')} className="min-h-[51px] rounded-xl border border-ink-200 bg-panel-alt px-3 text-xs text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><option value="all">Todas as situações</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            <div className="flex flex-col gap-1.5"><label htmlFor="company-department" className="text-[13px] font-semibold text-ink-700">Área</label><select id="company-department" value={department} onChange={(event) => setDepartment(event.target.value)} className="min-h-[51px] rounded-xl border border-ink-200 bg-panel-alt px-3 text-xs text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><option value="">Todas as áreas</option>{departments.map((item) => <option key={item}>{item}</option>)}</select></div>
          </div>
          <p role="status" className="text-[11px] text-ink-500">{visible.length} de {team.length} colaboradores</p>
        </div>
        <div aria-hidden="true" className="hidden grid-cols-[minmax(180px,1.7fr)_0.65fr_1fr_0.6fr_0.6fr_24px] gap-4 border-y border-ink-200 bg-panel-alt/40 px-6 py-3 text-[11px] font-semibold text-ink-500 lg:grid"><span>Colaborador</span><span>Conclusões</span><span>Progresso médio</span><span>Nota média</span><span>Certificados</span><span /></div>
        <ul className="divide-y divide-ink-100">
          {visible.map((employee) => {
            const state = employeeStatus(employee)
            const score = averageScore(employee.courses)
            const progress = employeeProgress(employee)
            return <li key={employee.id}><button type="button" onClick={() => setSelectedId(employee.id)} aria-label={`Ver resumo de ${employee.name}`} className="grid w-full grid-cols-2 items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-brand-blue-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-blue-400 sm:px-6 lg:grid-cols-[minmax(180px,1.7fr)_0.65fr_1fr_0.6fr_0.6fr_24px]">
              <span className="col-span-2 flex min-w-0 items-center gap-3 lg:col-span-1"><Avatar name={employee.name} className="h-10 w-10" /><span className="min-w-0"><span className="block text-sm font-bold text-ink-900">{employee.name}</span><span className="mt-1 block text-[11px] text-ink-500">{employee.department}</span><span className={`mt-1.5 inline-flex rounded-md border px-1.5 py-0.5 text-[9px] font-semibold ${statusClasses[state]}`}>{statusLabels[state]}</span></span></span>
              <span className="text-xs text-ink-700"><span className="mb-1 block text-[10px] text-ink-500 lg:hidden">Conclusões</span><strong>{employee.courses.filter((course) => course.progress === 100).length}</strong> de {employee.courses.length} cursos</span>
              <span className="min-w-0 text-xs font-bold text-ink-700"><span className="mb-1 block text-[10px] font-normal text-ink-500 lg:hidden">Progresso médio</span>{progress}%<span aria-hidden="true" className="mt-2 block h-1.5 overflow-hidden rounded-full bg-ink-100"><span className="block h-full rounded-full bg-gradient-to-r from-brand-blue-600 to-brand-cyan-400" style={{ width: `${progress}%` }} /></span></span>
              <span className="text-sm font-semibold text-ink-700"><span className="mb-1 block text-[10px] font-normal text-ink-500 lg:hidden">Nota média</span>{score === null ? <span aria-label="Sem avaliação entregue">—</span> : `${score}%`}</span>
              <span className="text-sm font-semibold text-ink-700"><span className="mb-1 block text-[10px] font-normal text-ink-500 lg:hidden">Certificados</span>{employee.courses.filter((course) => course.certificateCode).length}</span>
              <ChevronRight className="hidden h-4 w-4 text-brand-blue-400 lg:block" aria-hidden="true" />
            </button></li>
          })}
        </ul>
        {!visible.length && <div className="flex flex-col items-center gap-3 px-5 py-10 text-center"><SearchX className="h-8 w-8 text-brand-blue-400" aria-hidden="true" /><h3 className="text-sm font-bold text-ink-900">{team.length ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador vinculado'}</h3><p className="text-xs text-ink-500">{team.length ? 'Tente outro nome ou ajuste os filtros.' : 'Os colaboradores da empresa aparecerão aqui quando forem vinculados.'}</p></div>}
      </section>
    {selected && <EmployeeDialog employee={selected} onClose={() => setSelectedId(null)} />}
  </div>
}
