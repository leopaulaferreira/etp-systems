import { ArrowRight, Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'
import { type CourseItem } from '../courseTypes'
import CourseThumbnail from './CourseThumbnail'
import CourseBadge from './CourseBadge'

type SideCourseCardProps = {
  title: string
  actionLabel: string
  courses: CourseItem[]
  onOpen: (course: CourseItem) => void
  emptyMessage?: string
} & ({ onAction: () => void; to?: never } | { to: string; onAction?: never })

const actionClass =
  'mt-5 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-panel-alt px-3 py-2 text-xs font-extrabold text-brand-blue-400 transition-colors hover:border-brand-blue-500/40 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400'

export default function SideCourseCard({
  title,
  actionLabel,
  courses,
  onOpen,
  emptyMessage = 'Salve cursos para estudar depois.',
  onAction,
  to,
}: SideCourseCardProps) {
  return (
    <section
      className="flex min-w-0 flex-col rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6"
      aria-label={title}
    >
      <h2 className="text-[18px] font-extrabold tracking-[-0.015em] text-ink-900">{title}</h2>
      {courses.length ? (
        <ul className="mt-5 flex flex-col divide-y divide-ink-100">
          {courses.slice(0, 3).map((course) => (
            <li key={course.id} className="py-3 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => onOpen(course)}
                className="group flex w-full items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
              >
                <CourseThumbnail thumbnail={course.thumbnail} size="small" />
                <span className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
                  <span className="text-[13px] font-bold leading-snug text-ink-900 transition-colors group-hover:text-brand-blue-400">
                    {course.title}
                  </span>
                  <span className="flex flex-wrap items-center gap-2">
                    <CourseBadge type={course.type} />
                    <span className="text-[11px] font-semibold text-ink-500">
                      {course.duration}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 py-8 text-center text-sm text-ink-500">
          <Bookmark className="h-7 w-7 text-brand-blue-400" aria-hidden="true" />
          <p>{emptyMessage}</p>
        </div>
      )}
      {to ? (
        <Link to={to} className={actionClass}>
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ) : (
        <button type="button" onClick={onAction} className={actionClass}>
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </section>
  )
}
