import AttemptReleasePanel from './AttemptReleasePanel'
import { useState } from 'react'
import { Award, ClipboardCheck, Search } from 'lucide-react'
import PageHero from '../../components/ui/PageHero'
import IllustratedIcon from '../../components/ui/IllustratedIcon'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import CertificateDialog from '../Certificados/components/CertificateDialog'
import { formatCompanyDate } from './company'
import { useCompanyOverview } from './companyOverviewContext'
import CompanyLoadState from './CompanyLoadState'
import CompanyCertificateGallery from './CompanyCertificateGallery'
import CompanyAssessmentResults from './CompanyAssessmentResults'

export default function CompanyRecordsPage({ kind }: { kind: 'assessments' | 'certificates' }) {
  const { data } = useCompanyOverview()
  const [query, setQuery] = useState('')
  const [courseId, setCourseId] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const certificates = kind === 'certificates'
  const records = (data?.employees ?? []).flatMap(employee => employee.courses
    .filter(course => certificates ? Boolean(course.certificateCode) : course.score !== null)
    .map(course => ({ id: `${employee.id}-${course.id}`, employee, course })))
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const visible = records.filter(({ employee, course }) => (!courseId || course.id === courseId) && normalize(`${employee.name} ${employee.email} ${course.title} ${course.certificateCode ?? ''}`).includes(normalize(query.trim())))
  const courses = [...new Map(records.map(({ course }) => [course.id, course.title])).entries()]
  const selected = records.find(record => record.id === selectedId)
  if (!data) return <CompanyLoadState />
  return <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
    <PageHero icon={certificates ? Award : ClipboardCheck} eyebrow="Painel da empresa" title={certificates ? 'Certificados' : 'Avaliações'} description={certificates ? 'Consulte as conquistas dos seus colaboradores.' : 'Acompanhe os resultados de aprendizagem da equipe.'} />
    <section className="min-w-0">
      <div className="mb-5 space-y-4">
        <div><h2 className="text-[17px] font-extrabold text-ink-900">{certificates ? 'Acervo da equipe' : 'Resultados da equipe'}</h2><p className="mt-1 text-xs text-ink-500">{certificates ? 'Busque por colaborador, curso ou código do certificado.' : 'Última nota disponível por colaborador e curso.'}</p></div>
        {certificates && <dl className="flex flex-wrap gap-x-6 gap-y-3 border-y border-ink-200/70 py-3">{[[records.length, 'certificados emitidos'], [new Set(records.map(record => record.employee.id)).size, 'pessoas certificadas'], [courses.length, 'cursos com certificados']].map(([value, label]) => <div key={label} className="flex items-baseline gap-2"><dt className="text-[11px] text-ink-500">{label}</dt><dd className="order-first text-xl font-extrabold tabular-nums text-ink-900">{value}</dd></div>)}</dl>}
        <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
          <Input id="record-search" label="Buscar" type="search" tone="dark" value={query} onChange={event => setQuery(event.target.value)} placeholder={certificates ? "Colaborador, curso ou código..." : "Colaborador ou curso..."} icon={<Search className="h-4 w-4" />} />
          <div className="flex min-w-0 flex-col gap-1.5"><label htmlFor="record-course" className="text-[13px] font-semibold text-ink-700">Curso</label><select id="record-course" value={courseId} onChange={event => setCourseId(event.target.value)} className="min-h-[51px] w-full rounded-xl border border-ink-200 bg-panel-alt px-3 text-xs text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><option value="">Todos os cursos</option>{courses.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2"><p role="status" className="text-xs text-ink-500">{visible.length} de {records.length} registros</p>{(query || courseId) && <Button variant="ghost" onClick={() => { setQuery(''); setCourseId('') }}>Limpar filtros</Button>}</div>
      </div>
      {certificates ? <CompanyCertificateGallery records={visible} onSelect={setSelectedId} /> : <CompanyAssessmentResults records={visible} onSelect={setSelectedId} />}
      {!visible.length && <div className="flex flex-col items-center gap-3 p-8 text-center">
        <IllustratedIcon icon={certificates ? Award : ClipboardCheck} tone={certificates ? 'violet' : 'blue'} size="tile" />
        <p className="text-sm font-bold text-ink-900">{records.length ? 'Nenhum registro encontrado' : certificates ? 'Nenhum certificado emitido' : 'Nenhuma avaliação realizada'}</p>
        <p className="max-w-sm text-sm leading-6 text-ink-500">{records.length ? 'Ajuste a busca ou os filtros para encontrar um registro.' : certificates ? 'Os certificados da equipe aparecerão aqui após a aprovação em cursos habilitados.' : 'Os resultados aparecerão aqui quando os colaboradores enviarem suas avaliações.'}</p>
      </div>}
    </section>
    {selected && <CertificateDialog title={certificates ? 'Detalhes do certificado' : 'Resultado da avaliação'} onClose={() => setSelectedId(null)}>
      <div className="space-y-5 p-5 sm:p-6"><div><p className="text-sm font-bold text-ink-900">{selected.employee.name}</p><p className="mt-1 break-all text-xs text-ink-500">{selected.employee.email}</p></div><div className="rounded-2xl border border-ink-200 bg-panel-alt p-5"><h3 className="font-bold text-ink-900">{selected.course.title}</h3><p className="mt-1 text-xs text-ink-500">{selected.course.category}</p>{certificates ? <><p className="mt-4 break-all text-sm text-brand-cyan-400">{selected.course.certificateCode}</p><p className="mt-2 text-xs text-ink-500">Emissão: {formatCompanyDate(selected.course.certificateIssuedAt)}</p></> : <><p className="mt-4 text-2xl font-extrabold text-brand-blue-300">{selected.course.score}%</p><p className="mt-2 text-xs text-ink-500">Última nota disponível neste curso.</p></>}</div></div>
      {!certificates && <AttemptReleasePanel key={selected.id} employeeId={selected.employee.id} courseId={selected.course.id} />}
    </CertificateDialog>}
  </div>
}
