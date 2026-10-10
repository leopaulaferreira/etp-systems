import { ArrowRight, Bookmark, Clock3, History } from 'lucide-react'
import { type CourseItem } from '../courseTypes'
import CourseThumbnail from './CourseThumbnail'
import CourseBadge from './CourseBadge'
import CourseProgress from './CourseProgress'

type ContinueCourseCardProps = {
  course: CourseItem
  isSaved: boolean
  onOpen: (course: CourseItem) => void
  onToggleSave: (course: CourseItem) => void
}

export default function ContinueCourseCard({
  course,
  isSaved,
  onOpen,
  onToggleSave,
}: ContinueCourseCardProps) {
  return (
    <section className="flex min-w-0 flex-col gap-5 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[19px] font-extrabold tracking-[-0.015em] text-ink-900 sm:text-xl">
          Continue de onde parou
        </h2>
        <button
          type="button"
          onClick={() => onToggleSave(course)}
          aria-pressed={isSaved}
          aria-label={`${isSaved ? 'Remover dos salvos' : 'Salvar'}: ${course.title}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-brand-blue-400 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
        >
          <Bookmark
            className="h-4 w-4"
            fill={isSaved ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>
      </div>
      <div className="grid gap-5 md:grid-cols-[170px_minmax(0,1fr)] md:gap-6">
        <CourseThumbnail thumbnail={course.thumbnail} size="large" />
        <div className="flex min-w-0 flex-col justify-between gap-5">
          <div className="flex flex-col items-start gap-2.5">
            <CourseBadge type={course.type} />
            <h3 className="text-[21px] font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-2xl">
              {course.title}
            </h3>
            <p className="text-sm leading-6 text-ink-500">{course.description}</p>
          </div>
          <CourseProgress course={course} />
          <div className="flex flex-col gap-3 border-t border-ink-100 pt-4">
            <div className="flex items-start gap-2 text-xs text-ink-500">
              <History className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue-400" aria-hidden="true" />
              <div className="flex flex-col gap-1">
                <span>Última atualização do progresso</span>
                <span className="font-semibold leading-5 text-ink-700">
                  {course.updatedAt}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-xs text-ink-500">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                {course.duration} de conteúdo
              </span>
              <button
                type="button"
                onClick={() => onOpen(course)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue-700 px-4 py-2.5 text-[13px] font-extrabold text-white transition-colors hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
              >
                Ver progresso <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
