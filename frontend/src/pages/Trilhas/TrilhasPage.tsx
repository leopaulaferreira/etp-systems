import { useEffect, useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import CertificateDialog from '../Certificados/components/CertificateDialog'
import TrilhasHero from './components/TrilhasHero'
import TrilhasFilters from './components/TrilhasFilters'
import FeaturedTrailCard from './components/FeaturedTrailCard'
import TrailGrid from './components/TrailGrid'
import { enrollTrail, fetchTrails, type LearningPath } from './trailApi'

export default function TrilhasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') ?? 'Todas')
  const [selectedLevel, setSelectedLevel] = useState('Todos')
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retry, setRetry] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState(false)
  const selected = paths.find((path) => path.id === selectedId)
  const categories = useMemo(() => ['Todas', ...new Set(paths.map((path) => path.category))], [paths])
  const levels = useMemo(() => ['Todos', ...new Set(paths.map((path) => path.level))], [paths])
  const filteredPaths = useMemo(() => paths.filter((path) =>
    (selectedCategory === 'Todas' || path.category === selectedCategory) &&
    (selectedLevel === 'Todos' || path.level === selectedLevel),
  ), [paths, selectedCategory, selectedLevel])
  const featured = paths.find((path) => path.featured)

  useEffect(() => {
    const controller = new AbortController()
    fetchTrails(controller.signal).then((data) => {
      if (!controller.signal.aborted) { setPaths(data); setStatus('ready') }
    }).catch(() => { if (!controller.signal.aborted) setStatus('error') })
    return () => controller.abort()
  }, [retry])

  async function join(path: LearningPath) {
    setEnrolling(true)
    setEnrollError(false)
    try {
      const updated = await enrollTrail(path.id)
      setPaths((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch {
      setEnrollError(true)
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <TrilhasHero />
      {status === 'loading' && <div role="status" className="rounded-[22px] border border-ink-200 bg-panel p-10 text-center text-sm text-ink-500">Carregando trilhas...</div>}
      {status === 'error' && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-ink-200 bg-panel p-5 text-sm text-ink-700"><span>Não foi possível carregar as trilhas.</span><button type="button" onClick={() => { setStatus('loading'); setRetry((value) => value + 1) }} className="rounded-xl bg-brand-blue-700 px-4 py-2 font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Tentar novamente</button></div>}
      {status === 'ready' && <>
        <TrilhasFilters categories={categories} levels={levels} selectedCategory={selectedCategory} selectedLevel={selectedLevel} onSelectCategory={setSelectedCategory} onSelectLevel={setSelectedLevel} />
        {featured && selectedCategory === 'Todas' && selectedLevel === 'Todos' && <FeaturedTrailCard data={featured} onOpen={(path) => setSelectedId(path.id)} />}
        <TrailGrid paths={filteredPaths} onOpen={(path) => setSelectedId(path.id)} />
        {(selectedCategory !== 'Todas' || selectedLevel !== 'Todos') && <div className="flex justify-center pb-1 pt-0.5"><button type="button" onClick={() => { setSelectedCategory('Todas'); setSelectedLevel('Todos'); setSearchParams({}, { replace: true }) }} className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-brand-blue-400 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30">Ver todas as trilhas <ArrowRight className="h-4 w-4" aria-hidden="true" /></button></div>}
      </>}
      {selected && <CertificateDialog title={selected.title} onClose={() => { setSelectedId(null); setEnrollError(false) }}>
        <p className="text-sm leading-6 text-ink-500">{selected.description}</p>
        <p className="text-xs font-semibold text-ink-700">{selected.courseCount} cursos · {Number(selected.durationHours.toFixed(1)).toLocaleString('pt-BR')}h · {selected.level}{selected.enrolled ? ` · ${selected.progress}% concluído` : ''}</p>
        <ul className="divide-y divide-ink-100 rounded-xl border border-ink-200 bg-panel-alt px-4">
          {selected.courses.map((course) => <li key={course.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span className="font-semibold text-ink-700">{course.title}</span>{selected.enrolled && <Link to={`/cursos/${course.id}/estudar`} className="text-xs font-bold text-brand-blue-400 hover:underline">Estudar</Link>}</li>)}
        </ul>
        {enrollError && <p role="alert" className="text-sm text-red-400">Não foi possível fazer a inscrição. Tente novamente.</p>}
        {selected.enrolled ? <Link to="/meus-cursos" className="self-start rounded-xl bg-brand-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-brand-blue-600">Ver meus cursos</Link> : <button type="button" disabled={enrolling} onClick={() => join(selected)} className="self-start rounded-xl bg-brand-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-brand-blue-600 disabled:opacity-60">{enrolling ? 'Inscrevendo...' : 'Inscrever-se na trilha'}</button>}
      </CertificateDialog>}
    </div>
  )
}
