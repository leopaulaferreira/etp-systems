import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, ChevronDown, RefreshCw, SearchX } from 'lucide-react'
import { catalogCourses, courseCategories, featuredCourse, type CatalogCourse } from '../../mocks/cursos.mock'
import { initialFilters, selectCourses, type CatalogFilters } from './catalog'
import { fetchCourseDetails, fetchCourses } from './courseApi'
import { ApiError } from '../../api/client'
import { enrollCourse, fetchMyCourses } from '../MeusCursos/myCoursesApi'
import { useAssessments } from '../../assessments/AssessmentContext'
import CatalogCourseCard from './components/CatalogCourseCard'
import CatalogToolbar from './components/CatalogToolbar'
import CourseCatalogDialog from './components/CourseCatalogDialog'
import CursosHero from './components/CursosHero'
import FeaturedCourseCard from './components/FeaturedCourseCard'

const PAGE_SIZE = 8

export default function CursosPage() {
  const [searchParams] = useSearchParams()
  const { reload: reloadAssessments } = useAssessments()
  const [filters, setFilters] = useState<CatalogFilters>(() => ({
    ...initialFilters,
    query: searchParams.get('busca') ?? '',
    category: searchParams.get('categoria') ?? 'Todas',
  }))
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [courses, setCourses] = useState<CatalogCourse[]>([])
  const [source, setSource] = useState<'loading' | 'api' | 'fallback'>('loading')
  const [reload, setReload] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [details, setDetails] = useState<CatalogCourse | null>(null)
  const [detailStatus, setDetailStatus] = useState<'ready' | 'loading' | 'error'>('ready')
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set())
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [enrollError, setEnrollError] = useState(false)
  const filteredCourses = useMemo(() => selectCourses(courses, filters), [courses, filters])
  const visibleCourses = filteredCourses.slice(0, visibleCount)
  const selectedCourse = details?.id === selectedId ? details : courses.find((course) => course.id === selectedId)
  const featured = source === 'api' ? courses.find((course) => course.featured) : featuredCourse
  const categories = source === 'api'
    ? [...new Set(courses.map((course) => course.category))]
    : [...courseCategories]
  const isFiltered =
    filters.query.trim() !== '' || filters.category !== 'Todas' || filters.level !== 'Todos'

  useEffect(() => {
    const controller = new AbortController()
    fetchCourses(controller.signal).then((data) => {
      setCourses(data)
      setSource('api')
      setFilters((current) => current.order === 'popular' ? { ...current, order: 'relevance' } : current)
    }).catch((error) => {
      if (controller.signal.aborted) return
      if (error instanceof ApiError && error.status === 401) return
      setCourses(catalogCourses)
      setSource('fallback')
    })
    return () => controller.abort()
  }, [reload])

  useEffect(() => {
    if (!selectedId || source !== 'api') return
    const controller = new AbortController()
    fetchCourseDetails(selectedId, controller.signal).then((course) => {
      setDetails(course)
      setDetailStatus('ready')
    }).catch(() => {
      if (!controller.signal.aborted) setDetailStatus('error')
    })
    return () => controller.abort()
  }, [selectedId, source])

  useEffect(() => {
    if (source !== 'api') return
    const controller = new AbortController()
    fetchMyCourses(controller.signal)
      .then((items) => setEnrolledIds((current) => new Set([...current, ...items.map((item) => item.id)])))
      .catch(() => { /* A inscrição continua disponível se a consulta inicial falhar. */ })
    return () => controller.abort()
  }, [source])

  function updateFilters(update: Partial<CatalogFilters>) {
    setFilters((current) => ({ ...current, ...update }))
    setVisibleCount(PAGE_SIZE)
  }

  function openCourse(course: CatalogCourse) {
    setDetails(null)
    setEnrollError(false)
    setDetailStatus(source === 'api' ? 'loading' : 'ready')
    setSelectedId(course.id)
  }

  async function handleEnroll(course: CatalogCourse) {
    setEnrollingId(course.id)
    setEnrollError(false)
    try {
      await enrollCourse(course.id)
      setEnrolledIds((current) => new Set([...current, course.id]))
      reloadAssessments()
    } catch {
      setEnrollError(true)
    } finally {
      setEnrollingId(null)
    }
  }

  function resetFilters() {
    setFilters(initialFilters)
    setVisibleCount(PAGE_SIZE)
  }

  function showMore() {
    const firstNewCourse = filteredCourses[visibleCount]
    setVisibleCount((current) => current + PAGE_SIZE)
    if (firstNewCourse) {
      requestAnimationFrame(() =>
        document
          .getElementById(`course-title-${firstNewCourse.id}`)
          ?.focus({ preventScroll: true }),
      )
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
      <CursosHero />
      <CatalogToolbar
        filters={filters}
        expanded={filtersExpanded}
        onToggle={() => setFiltersExpanded((current) => !current)}
        onChange={updateFilters}
        onReset={resetFilters}
        categories={categories}
        showPopular={source !== 'api'}
      />
      {source === 'fallback' && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-panel p-4 text-xs text-ink-700"><span>Não foi possível carregar a API. Exibindo os cursos locais.</span><button type="button" onClick={() => { setSelectedId(null); setSource('loading'); setReload((current) => current + 1) }} className="inline-flex items-center gap-2 font-bold text-brand-blue-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><RefreshCw className="h-4 w-4" aria-hidden="true" />Tentar novamente</button></div>}
      {source !== 'loading' && !isFiltered && featured && <FeaturedCourseCard course={featured} onOpen={openCourse} />}
      <section aria-labelledby="catalog-title" className="flex min-w-0 flex-col gap-5">
        <h2 id="catalog-title" className="sr-only">
          Catálogo de cursos
        </h2>
        {source === 'loading' ? (
          <div role="status" className="rounded-[22px] border border-ink-200/70 bg-panel px-6 py-14 text-center text-sm text-ink-500">Carregando cursos...</div>
        ) : visibleCourses.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visibleCourses.map((course) => (
              <li key={course.id} className="min-w-0">
                <CatalogCourseCard course={course} onOpen={openCourse} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-[22px] border border-ink-200/70 bg-panel px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-500/10">
              <SearchX className="h-7 w-7 text-brand-blue-400" aria-hidden="true" />
            </span>
            <h3 className="text-lg font-extrabold text-ink-900">Nenhum curso encontrado</h3>
            <p className="max-w-sm text-sm leading-6 text-ink-500">
              Tente outro termo ou ajuste os filtros para encontrar seu próximo aprendizado.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 min-h-11 rounded-xl bg-brand-blue-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
            >
              Ver todos os cursos
            </button>
          </div>
        )}
        {source !== 'loading' && <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 pb-1">
          <p
            role="status"
            aria-atomic="true"
            className="flex items-center gap-2 text-xs font-semibold text-ink-500"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            {filteredCourses.length === 0
              ? 'Nenhum resultado'
              : `Mostrando 1–${visibleCourses.length} de ${filteredCourses.length} ${filteredCourses.length === 1 ? 'curso' : 'cursos'}`}
          </p>
          {visibleCount < filteredCourses.length && (
            <button
              type="button"
              onClick={showMore}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-panel px-4 py-2.5 text-xs font-bold text-ink-700 hover:border-brand-blue-500/40 hover:bg-brand-blue-500/10 hover:text-brand-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
            >
              Ver mais cursos <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>}
      </section>
      {selectedCourse && (
        <CourseCatalogDialog
          course={selectedCourse}
          loading={detailStatus === 'loading'}
          error={detailStatus === 'error'}
          enrollmentAvailable={source === 'api'}
          enrolled={enrolledIds.has(selectedCourse.id)}
          enrolling={enrollingId === selectedCourse.id}
          enrollError={enrollError}
          onEnroll={() => handleEnroll(selectedCourse)}
          onClose={() => { setSelectedId(null); setDetails(null); setDetailStatus('ready') }}
        />
      )}
    </div>
  )
}
