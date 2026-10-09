import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { fetchCourses } from '../Cursos/courseApi'
import type { CourseItem } from '../../mocks/meus-cursos.mock'
import CourseListCard from './components/CourseListCard'
import CourseTabs, { type CourseTab } from './components/CourseTabs'
import SideCourseCard from './components/SideCourseCard'
import MeusCursosHero from './components/MeusCursosHero'
import CourseDetailsDialog from './components/CourseDetailsDialog'
import ContinueCourseCard from './components/ContinueCourseCard'
import { courseThumbnail, fetchMyCourses, formatCourseDuration, updateCourseProgress } from './myCoursesApi'
import './meus-cursos.css'

export default function MeusCursosPage() {
  const [activeTab, setActiveTab] = useState<CourseTab>('ongoing')
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [suggestions, setSuggestions] = useState<CourseItem[]>([])
  const [saved, setSaved] = useState<CourseItem[]>([])
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reload, setReload] = useState(0)
  const savedIds = new Set(saved.map((course) => course.id))
  const courseIds = new Set(courses.map((course) => course.id))
  const explore = suggestions.filter((course) => !courseIds.has(course.id)).slice(0, 3)
  const ongoingCourses = courses.filter((course) => course.progress !== 100)
  const completedCourses = courses.filter((course) => course.progress === 100)
  const continueCourse = ongoingCourses.find((course) => (course.progress ?? 0) > 0)

  useEffect(() => {
    const controller = new AbortController()
    fetchMyCourses(controller.signal).then((items) => {
      setCourses(items)
      setStatus('ready')
    }).catch(() => {
      if (!controller.signal.aborted) setStatus('error')
    })
    fetchCourses(controller.signal).then((catalog) => {
      setSuggestions(catalog.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        type: 'CURSO',
        thumbnail: courseThumbnail(course.icon),
        duration: formatCourseDuration(course.durationHours),
      })))
    }).catch(() => {
      if (!controller.signal.aborted) setSuggestions([])
    })
    return () => controller.abort()
  }, [reload])

  function toggleSave(course: CourseItem) {
    const alreadySaved = savedIds.has(course.id)
    setSaved((current) =>
      alreadySaved ? current.filter((item) => item.id !== course.id) : [...current, course],
    )
    setAnnouncement(`${course.title}: ${alreadySaved ? 'removido dos salvos' : 'adicionado aos salvos'}.`)
  }

  function showSaved() {
    setActiveTab('saved')
    document.getElementById('course-tab-saved')?.focus()
  }

  async function handleUpdateProgress(course: CourseItem, percentual: number) {
    const updated = await updateCourseProgress(course.id, percentual)
    setCourses((current) => current.map((item) => item.id === course.id ? updated : item))
    setSaved((current) => current.map((item) => item.id === course.id ? updated : item))
    setSelectedCourse(updated)
    setAnnouncement(`${updated.title}: progresso atualizado para ${percentual}%.`)
  }

  const listProps = { savedIds, onOpen: setSelectedCourse, onToggleSave: toggleSave }
  return (
    <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
      <MeusCursosHero />
      <CourseTabs activeTab={activeTab} onChange={setActiveTab} />
      <p role="status" className="sr-only">{announcement}</p>
      <div id="my-courses-panel" role="tabpanel" aria-labelledby={`course-tab-${activeTab}`} tabIndex={0}
        className="min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">
        {status === 'loading' ? (
          <div role="status" className="rounded-[22px] border border-ink-200/70 bg-panel px-6 py-14 text-center text-sm text-ink-500">Carregando seus cursos...</div>
        ) : status === 'error' ? (
          <div role="alert" className="flex flex-col items-center gap-4 rounded-[22px] border border-ink-200/70 bg-panel px-6 py-12 text-center">
            <p className="text-sm text-ink-700">Não foi possível carregar seus cursos.</p>
            <button type="button" onClick={() => { setStatus('loading'); setReload((current) => current + 1) }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Tentar novamente
            </button>
          </div>
        ) : activeTab === 'ongoing' ? (
          <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex min-w-0 flex-col gap-5">
              {continueCourse && <ContinueCourseCard course={continueCourse} isSaved={savedIds.has(continueCourse.id)}
                onOpen={setSelectedCourse} onToggleSave={toggleSave} />}
              <CourseListCard title="Cursos a estudar" courses={ongoingCourses}
                emptyMessage={courses.length ? 'Você concluiu todos os cursos inscritos.'
                  : 'Inscreva-se em um curso no catálogo para começar a estudar.'} {...listProps} />
            </div>
            <aside className="flex min-w-0 flex-col gap-5" aria-label="Cursos salvos e sugestões">
              <SideCourseCard title="Cursos salvos" actionLabel="Ver todos os salvos" courses={saved}
                onOpen={setSelectedCourse} onAction={showSaved} />
              <SideCourseCard title="Continue explorando" actionLabel="Explorar mais cursos" courses={explore}
                emptyMessage="Explore o catálogo para encontrar mais cursos." onOpen={setSelectedCourse} to="/cursos" />
            </aside>
          </div>
        ) : activeTab === 'completed' ? (
          <CourseListCard title="Cursos concluídos" courses={completedCourses}
            emptyMessage="Você ainda não concluiu nenhum curso." {...listProps} />
        ) : (
          <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <CourseListCard title="Cursos salvos" courses={saved} {...listProps} />
            <SideCourseCard title="Continue explorando" actionLabel="Explorar mais cursos" courses={explore}
              emptyMessage="Explore o catálogo para encontrar mais cursos." onOpen={setSelectedCourse} to="/cursos" />
          </div>
        )}
      </div>
      {selectedCourse && (
        <CourseDetailsDialog key={selectedCourse.id} course={selectedCourse}
          editable={courseIds.has(selectedCourse.id)} isSaved={savedIds.has(selectedCourse.id)}
          onClose={() => setSelectedCourse(null)} onToggleSave={toggleSave}
          onUpdateProgress={handleUpdateProgress} />
      )}
    </div>
  )
}
