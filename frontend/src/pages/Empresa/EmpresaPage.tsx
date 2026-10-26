import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Award, BookCheck, Building2, ChevronRight, ClipboardCheck, GraduationCap, UsersRound } from 'lucide-react'
import IllustratedIcon, { type IconTone } from '../../components/ui/IllustratedIcon'
import Avatar from '../../components/ui/Avatar'
import PageHero from '../../components/ui/PageHero'
import { useCompanySettings } from './companySettings'
import { useAuth } from '../../auth/AuthContext'
import { companySummary, formatCompanyDate, recentCompletions } from './company'
import { useCompanyOverview } from './companyOverviewContext'
import CompanyLoadState from './CompanyLoadState'
import EmployeeDialog from './EmployeeDialog'

const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400'

export default function EmpresaPage() {
  const { companyId } = useAuth()
  const { data } = useCompanyOverview()
  const { settings } = useCompanySettings(companyId, data?.companyName)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const team = data?.employees ?? []
  const summary = companySummary(team)
  const recent = recentCompletions(team)
  const selected = team.find((employee) => employee.id === selectedId)
  const metrics = [
    { label: 'Colaboradores', value: summary.total, detail: 'Pessoas vinculadas à empresa', icon: UsersRound, tone: 'blue' },
    { label: 'Em aprendizagem', value: summary.learning, detail: 'Com cursos em andamento', icon: GraduationCap, tone: 'teal' },
    { label: 'Cursos concluídos', value: summary.completed, detail: `${summary.certificates} certificados emitidos`, icon: BookCheck, tone: 'violet' },
    { label: 'Média nas avaliações', value: summary.average === null ? '—' : `${summary.average}%`, detail: `${summary.assessments} notas · última entrega por curso`, icon: ClipboardCheck, tone: 'orange' },
  ]

  if (!data) return <CompanyLoadState />

  return (
    <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
      <PageHero eyebrow={settings.name} icon={Building2} title="Desenvolvimento da equipe" description="Uma visão das pessoas, do aprendizado e das conquistas da empresa." />

      <section aria-label="Indicadores da empresa" className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-ink-200/70 bg-ink-200/70 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon, tone }) => <div key={label} className="min-w-0 bg-panel p-4">
          <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-ink-500">{label}</p><IllustratedIcon icon={icon} tone={tone as IconTone} size="compact" finish="relief" /></div>
          <p className="mt-1 text-[28px] font-extrabold leading-tight tracking-tight text-ink-900">{value}</p>
          <p className="mt-2 text-[11px] leading-4 text-ink-500">{detail}</p>
        </div>)}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <section className="min-w-0 rounded-[22px] border border-brand-blue-400/20 bg-gradient-to-br from-brand-blue-500/10 via-panel to-panel p-5 sm:p-6" aria-labelledby="company-progress-title">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-blue-400">Aprendizagem</p>
          <h2 id="company-progress-title" className="mt-2 text-lg font-extrabold text-ink-900">Progresso da equipe</h2>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-4xl font-extrabold tracking-tight text-ink-900">{summary.courses}</p><p className="mt-1 text-xs text-ink-500">inscrições em cursos</p></div>
            <p className="text-right text-xs text-ink-500"><strong className="block text-2xl font-extrabold text-brand-cyan-400">{summary.courses ? `${Math.round(summary.completed / summary.courses * 100)}%` : '—'}</strong>das inscrições concluídas</p>
          </div>
          <div aria-hidden="true" className="mt-5 flex h-3 overflow-hidden rounded-full bg-ink-100">
            {summary.distribution.map((item) => <div key={item.label} className={item.color} style={{ width: `${summary.courses ? item.count / summary.courses * 100 : 0}%` }} />)}
          </div>
          <ul className="mt-5 divide-y divide-ink-200/50">
            {summary.distribution.map((item) => <li key={item.label} className="flex items-center gap-2.5 py-2.5 text-xs"><span aria-hidden="true" className={`h-2 w-2 rounded-full ${item.color}`} /><span className="flex-1 text-ink-700">{item.label}</span><strong className="text-ink-900">{item.count}</strong><span className="w-10 text-right text-ink-500">{summary.courses ? Math.round(item.count / summary.courses * 100) : 0}%</span></li>)}
          </ul>
          {!summary.courses && <p className="mt-3 text-xs text-ink-500">Ainda não há inscrições para acompanhar.</p>}
        </section>

        <section className="min-w-0 py-2 xl:pl-2" aria-labelledby="company-recent-title">
          <div className="flex items-center gap-2"><Award className="h-4 w-4 text-brand-cyan-400" aria-hidden="true" /><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-cyan-400">Conquistas</p></div>
          <h2 id="company-recent-title" className="mt-2 text-lg font-extrabold text-ink-900">Conclusões recentes</h2>
          <p className="mt-1 text-xs leading-5 text-ink-500">Os últimos cursos concluídos pela equipe.</p>
          <ul className="mt-5">
            {recent.map(({ employee, course }, index) => <li key={`${employee.id}-${course.id}`} className="relative">
              {index < recent.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[25px] top-12 w-px bg-ink-200" />}
              <button type="button" onClick={() => setSelectedId(employee.id)} aria-label={`Ver resumo de ${employee.name}`} className={`relative flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-panel-alt ${focusClass}`}>
                <Avatar name={employee.name} email={employee.email} className="h-8 w-8 shrink-0 text-xs" />
                <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-ink-900">{employee.name}</span><span className="mt-1 block text-xs leading-5 text-ink-500">Concluiu <span className="text-ink-700">{course.title}</span></span><span className="mt-2 block text-[10px] text-ink-500">{formatCompanyDate(course.completedAt)}</span></span>
                <ChevronRight className="mt-2 h-3.5 w-3.5 shrink-0 text-brand-blue-400" aria-hidden="true" />
              </button>
            </li>)}
          </ul>
          {!recent.length && <div className="mt-5 rounded-xl border border-dashed border-ink-200 p-5"><p className="text-sm font-semibold text-ink-700">As próximas conquistas começam aqui</p><p className="mt-2 text-xs leading-5 text-ink-500">Quando a equipe concluir cursos, as atividades aparecerão neste espaço.</p></div>}
        </section>
      </div>

      <nav aria-label="Acompanhamento da equipe" className="grid gap-3 border-t border-ink-200/70 pt-5 md:grid-cols-3">
        <Link to="/empresa/colaboradores" className={`group flex min-w-0 items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-panel ${focusClass}`}>
          <IllustratedIcon icon={UsersRound} tone="blue" size="compact" />
          <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink-900">Ver colaboradores</span><span className="mt-1 block text-xs leading-5 text-ink-500">Explore o progresso individual da equipe.</span></span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-500 group-hover:text-brand-blue-400" aria-hidden="true" />
        </Link>
        <Link to="/empresa/avaliacoes" className={`group flex min-w-0 items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-panel ${focusClass}`}>
          <IllustratedIcon icon={ClipboardCheck} tone="orange" size="compact" />
          <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink-900">Resultados das avaliações</span><span className="mt-1 block text-xs leading-5 text-ink-500">Consulte notas, tentativas e autorizações.</span></span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-500 group-hover:text-brand-blue-400" aria-hidden="true" />
        </Link>
        <Link to="/empresa/certificados" className={`group flex min-w-0 items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-panel ${focusClass}`}>
          <IllustratedIcon icon={Award} tone="violet" size="compact" />
          <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink-900">Certificados da equipe</span><span className="mt-1 block text-xs leading-5 text-ink-500">Explore os certificados e suas datas de emissão.</span></span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-500 group-hover:text-brand-blue-400" aria-hidden="true" />
        </Link>
      </nav>
      {selected && <EmployeeDialog employee={selected} onClose={() => setSelectedId(null)} />}
    </div>
  )
}
