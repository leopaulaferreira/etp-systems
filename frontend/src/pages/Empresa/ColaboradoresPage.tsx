import IllustratedIcon from '../../components/ui/IllustratedIcon'
import { useState } from 'react'
import { Award, ChevronRight, ClipboardCheck, Search, SearchX, UsersRound } from 'lucide-react'
import PageHero from '../../components/ui/PageHero'
import Avatar from '../../components/ui/Avatar'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useCompanySettings } from './companySettings'
import { useAuth } from '../../auth/AuthContext'
import { averageScore, employeeProgress, employeeStatus, filterEmployees, statusLabels, type EmployeeStatus } from './company'
import { useCompanyOverview } from './companyOverviewContext'
import CompanyLoadState from './CompanyLoadState'
import EmployeeDialog from './EmployeeDialog'

const statusClasses = { not_started: 'bg-ink-400', in_progress: 'bg-brand-blue-400', completed: 'bg-brand-cyan-400' }
const selectClass = 'min-h-[51px] w-full rounded-xl border border-ink-200 bg-panel-alt px-3 text-xs text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400'

export default function ColaboradoresPage() {
  const { companyId } = useAuth()
  const { data } = useCompanyOverview()
  const { settings } = useCompanySettings(companyId, data?.companyName)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<EmployeeStatus | 'all'>('all')
  const [department, setDepartment] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const team = data?.employees ?? []
  const visible = filterEmployees(team, query, status, department)
  const selected = team.find((employee) => employee.id === selectedId)
  const filtered = Boolean(query || status !== 'all' || department)
  const departments = [...new Set(team.map((employee) => employee.department).filter((value): value is string => Boolean(value)))].sort()
  function resetFilters() { setQuery(''); setStatus('all'); setDepartment('') }
  if (!data) return <CompanyLoadState />
  return <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
    <PageHero eyebrow={settings.name} icon={UsersRound} title="Colaboradores" description="Conheça a equipe e acompanhe cada jornada de aprendizagem." />
    <section aria-labelledby="company-team-title" className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 id="company-team-title" className="flex items-center gap-2 text-lg font-extrabold text-ink-900">Sua equipe<span className="rounded-md border border-ink-200 px-2 py-0.5 text-xs font-semibold text-ink-500">{team.length}</span></h2><p className="mt-1 text-xs leading-5 text-ink-500">Cursos, resultados e conquistas de cada pessoa, em um só lugar.</p></div>
        {filtered && <Button type="button" variant="ghost" onClick={resetFilters}>Limpar filtros</Button>}
      </div>
      <div className="my-5 grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_180px_190px]">
        <Input id="company-search" type="search" tone="dark" label="Buscar colaborador" placeholder="Nome ou e-mail..." value={query} onChange={(event) => setQuery(event.target.value)} icon={<Search className="h-4 w-4" aria-hidden="true" />} />
        <div className="flex min-w-0 flex-col gap-1.5"><label htmlFor="company-status" className="text-[13px] font-semibold text-ink-700">Situação</label><select id="company-status" value={status} onChange={(event) => setStatus(event.target.value as EmployeeStatus | 'all')} className={selectClass}><option value="all">Todas as situações</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div className="flex min-w-0 flex-col gap-1.5"><label htmlFor="company-department" className="text-[13px] font-semibold text-ink-700">Área</label><select id="company-department" value={department} onChange={(event) => setDepartment(event.target.value)} className={selectClass}><option value="">Todas as áreas</option>{departments.map((item) => <option key={item}>{item}</option>)}</select></div>
      </div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink-200/70 pt-4"><p role="status" className="text-[11px] text-ink-500">{visible.length} de {team.length} colaboradores</p><p className="text-[11px] text-ink-500">Selecione uma pessoa para ver os detalhes</p></div>
      <ul className="space-y-3">
        {visible.map(employee => {
          const state = employeeStatus(employee)
          const score = averageScore(employee.courses)
          const progress = employeeProgress(employee)
          const completed = employee.courses.filter(course => course.progress === 100).length
          const certificates = employee.courses.filter(course => course.certificateCode).length
          return <li key={employee.id}>
            <button type="button" onClick={() => setSelectedId(employee.id)} aria-label={`Ver resumo de ${employee.name}`} className="group grid w-full min-w-0 items-center gap-4 rounded-2xl border border-ink-200/70 bg-panel p-4 text-left transition-colors hover:border-brand-blue-400/40 hover:bg-panel-alt/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 sm:p-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_auto] xl:gap-6">
              <span className="flex min-w-0 items-start gap-3"><Avatar name={employee.name} email={employee.email} className="h-11 w-11 ring-4 ring-brand-blue-500/5" /><span className="min-w-0"><span className="block break-words text-sm font-bold text-ink-900">{employee.name}</span><span className="mt-1 block break-all text-[11px] text-ink-500">{employee.email}</span><span className="mt-2 block text-[10px] font-semibold text-brand-blue-400">{employee.department ?? 'Área não informada'}</span></span></span>
              <span className="min-w-0"><span className="flex flex-wrap items-center justify-between gap-2 text-[11px]"><span className="inline-flex items-center gap-1.5 text-ink-700"><span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${statusClasses[state]}`} />{statusLabels[state]}</span><strong className="text-ink-900">{progress}%</strong></span><span className="sr-only">Progresso médio</span><span aria-hidden="true" className="my-2.5 block h-1.5 overflow-hidden rounded-full bg-ink-200/60"><span className="block h-full rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-cyan-400" style={{ width: `${progress}%` }} /></span><span className="block text-[10px] text-ink-500"><strong className="font-semibold text-ink-700">{completed} de {employee.courses.length}</strong> cursos concluídos</span></span>
              <span className="flex items-center gap-4 border-t border-ink-200/60 pt-3 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                <span className="flex-1 xl:min-w-16"><span className="flex items-center gap-1.5 text-[10px] text-ink-500"><ClipboardCheck className="h-3 w-3" aria-hidden="true" />Nota média</span><span className="mt-1 block text-sm font-bold tabular-nums text-ink-900">{score === null ? <span aria-label="Sem avaliação entregue">—</span> : `${score}%`}</span></span>
                <span className="flex-1 xl:min-w-16"><span className="flex items-center gap-1.5 text-[10px] text-ink-500"><Award className="h-3 w-3" aria-hidden="true" />Certificados</span><span className="mt-1 block text-sm font-bold tabular-nums text-ink-900">{certificates}</span></span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-500 group-hover:text-brand-blue-400" aria-hidden="true" />
              </span>
            </button>
          </li>
        })}
      </ul>
      {!visible.length && <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-200 px-5 py-10 text-center"><IllustratedIcon icon={SearchX} tone="blue" size="tile" /><h3 className="text-sm font-bold text-ink-900">{team.length ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador vinculado'}</h3><p className="text-xs text-ink-500">{team.length ? 'Tente outro nome ou ajuste os filtros.' : 'Os colaboradores da empresa aparecerão aqui quando forem vinculados.'}</p></div>}
    </section>
    {selected && <EmployeeDialog employee={selected} onClose={() => setSelectedId(null)} />}
  </div>
}
