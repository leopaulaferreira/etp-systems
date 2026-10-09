import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, ClipboardCheck, Play, VideoOff } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useAssessments } from '../../assessments/AssessmentContext'
import PageHero from '../../components/ui/PageHero'
import type { CatalogCourse } from '../../mocks/cursos.mock'
import { fetchCourseDetails } from './courseApi'
import { fetchLessons, type Lesson } from '../Avaliacoes/assessmentApi'
import { latestScore, remainingAttempts } from '../Avaliacoes/assessment'

const panel = 'rounded-[22px] border border-ink-200/70 bg-panel shadow-card'

function VideoSlot({ lesson }: { lesson: Lesson }) {
  const localVideo = lesson.videoUrl && /^\/videos\/[a-z0-9/_-]+\.mp4$/i.test(lesson.videoUrl)
  const embedVideo = lesson.videoUrl && /^https:\/\/www\.youtube-nocookie\.com\/embed\/[a-z0-9_-]{11}$/i.test(lesson.videoUrl)
  if (localVideo) return <video controls preload="metadata" className="aspect-video w-full rounded-2xl bg-navy-950" aria-label={`Vídeo da aula ${lesson.title}`} src={lesson.videoUrl ?? undefined} />
  if (embedVideo) return <iframe title={`Vídeo da aula ${lesson.title}`} src={lesson.videoUrl ?? undefined} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="aspect-video w-full rounded-2xl border-0 bg-navy-950" />
  return <div className="relative flex aspect-video flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-brand-blue-400/15 bg-[radial-gradient(circle_at_50%_40%,rgba(41,104,181,0.18),transparent_55%),linear-gradient(130deg,#13233e,#0b1629)] px-6 text-center">
    <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
    <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-blue-400/30 bg-brand-blue-500/10 text-brand-blue-400"><VideoOff className="h-6 w-6" aria-hidden="true" /></span>
    <span className="relative text-sm font-bold text-ink-900">Vídeo em preparação</span>
    <span className="relative max-w-sm text-xs leading-5 text-ink-500">Enquanto isso, leia o conteúdo da aula e pratique na avaliação.</span>
  </div>
}

export default function CourseStudyPage() {
  const { id } = useParams()
  const [course, setCourse] = useState<CatalogCourse | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [revision, setRevision] = useState(0)
  const { assessments, status: assessmentStatus } = useAssessments()
  const assessment = assessments.find((item) => item.courseId === id)

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    Promise.all([fetchCourseDetails(id, controller.signal), fetchLessons(id, controller.signal)])
      .then(([details, courseLessons]) => {
        setCourse(details)
        setLessons(courseLessons)
        setStatus('ready')
      }).catch(() => { if (!controller.signal.aborted) setStatus('error') })
    return () => controller.abort()
  }, [id, revision])

  return <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
    <PageHero eyebrow="Seu espaço de estudo" icon={BookOpen} artworkIcon={Play}
      title={course?.title ?? 'Aula do curso'}
      description="Revise o conteúdo, assista ao vídeo quando disponível e teste o que aprendeu." />
    <Link to="/meus-cursos" className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl px-2 text-xs font-bold text-brand-blue-400 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar para Meus Cursos</Link>
    {id && status === 'loading' && <p role="status" className={`${panel} p-6 text-sm text-ink-500`}>Carregando aula...</p>}
    {(!id || status === 'error') && <div role="alert" className={`${panel} flex flex-wrap items-center justify-between gap-3 p-6 text-sm text-ink-700`}><span>Não foi possível abrir a aula. Confira sua inscrição e tente novamente.</span><button type="button" onClick={() => { setStatus('loading'); setRevision((value) => value + 1) }} className="rounded-xl bg-brand-blue-700 px-4 py-2 font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Tentar novamente</button></div>}
    {status === 'ready' && <div className={`grid min-w-0 grid-cols-1 items-start gap-5 ${lessons.length ? 'xl:grid-cols-[minmax(0,1fr)_300px]' : ''}`}>
      <section aria-label="Aulas" className="flex min-w-0 flex-col gap-5">
        {lessons.length ? lessons.map((lesson, index) => <article key={lesson.id} className={`${panel} flex flex-col gap-5 p-5 sm:p-7`}>
          <div className="flex flex-col gap-1.5"><span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-blue-400">Aula {index + 1}</span><h2 className="text-xl font-extrabold tracking-tight text-ink-900">{lesson.title}</h2></div>
          <VideoSlot lesson={lesson} />
          <div className="flex flex-col gap-4 border-t border-ink-100 pt-5"><h3 className="text-sm font-extrabold text-ink-900">Resumo da aula</h3>{lesson.content.split(/\n\n/).map((paragraph, position) => <p key={position} className="text-sm leading-7 text-ink-700">{paragraph}</p>)}</div>
        </article>) : <section className={`${panel} p-6 sm:p-8`}><h2 className="text-lg font-extrabold text-ink-900">Conteúdo em preparação</h2><p className="mt-2 text-sm leading-6 text-ink-500">Este curso ainda não tem aula ou avaliação publicada. Você pode acompanhar seu avanço manualmente em Meus Cursos.</p></section>}
      </section>
      {lessons.length > 0 && <aside className="flex min-w-0 flex-col gap-5" aria-label="Roteiro do curso">
        <section className={`${panel} p-5`}><h2 className="text-sm font-extrabold text-ink-900">Roteiro de estudo</h2><ol className="mt-4 flex flex-col gap-4 text-xs text-ink-700"><li className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-blue-500/10 font-extrabold text-brand-blue-400">1</span>Leia o resumo da aula</li><li className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-blue-500/10 font-extrabold text-brand-blue-400">2</span>Assista ao vídeo quando disponível</li><li className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-blue-500/10 font-extrabold text-brand-blue-400">3</span>Faça a avaliação</li></ol></section>
        {lessons.length > 0 && <section className={`${panel} p-5`}><div className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-brand-blue-400" aria-hidden="true" /><h2 className="text-sm font-extrabold text-ink-900">Avaliação do curso</h2></div>{assessment ? <><p className="mt-3 text-xs leading-5 text-ink-500">{assessment.questions.length} questões · Nota mínima {assessment.minimumScore}% · {remainingAttempts(assessment)} tentativas restantes</p>{latestScore(assessment) !== null && <p className="mt-3 text-xs font-bold text-ink-700">Última nota: {latestScore(assessment)}%</p>}<Link to={`/avaliacoes?curso=${encodeURIComponent(assessment.courseId ?? '')}`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Ir para avaliação <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></> : <p className="mt-3 text-xs leading-5 text-ink-500">{assessmentStatus === 'loading' ? 'Carregando avaliação...' : 'A avaliação deste curso ainda não está disponível.'}</p>}</section>}
      </aside>}
    </div>}
  </div>
}
