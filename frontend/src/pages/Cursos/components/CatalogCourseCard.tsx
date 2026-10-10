import { ArrowUpRight } from 'lucide-react'
import type { CatalogCourse } from '../courseTypes'
import CourseArtwork from './CourseArtwork'
import CourseMetadata from './CourseMetadata'

type CatalogCourseCardProps = { course: CatalogCourse; onOpen: (course: CatalogCourse) => void }

export default function CatalogCourseCard({ course, onOpen }: CatalogCourseCardProps) {
  return (
    <article
      className="group flex h-full min-w-0 flex-col gap-4 rounded-[20px] border border-ink-200/70 bg-panel p-5 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-brand-blue-500/45 hover:shadow-[0_20px_38px_-22px_rgba(37,99,235,0.3)]"
      aria-labelledby={`course-title-${course.id}`}
    >
      <div className="flex items-start gap-3">
        <CourseArtwork icon={course.icon} />
        <h3
          id={`course-title-${course.id}`}
          tabIndex={-1}
          className="pt-0.5 text-[14px] font-extrabold leading-snug tracking-[-0.01em] text-ink-900 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
        >
          {course.title}
        </h3>
      </div>
      <p className="text-[13px] leading-6 text-ink-500">{course.description}</p>
      <div className="mt-auto flex flex-col gap-4 pt-1">
        <CourseMetadata course={course} />
        <button
          type="button"
          onClick={() => onOpen(course)}
          aria-label={`Ver curso: ${course.title}`}
          className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-brand-blue-500/35 bg-brand-blue-500/5 px-3 py-2 text-xs font-extrabold text-brand-blue-400 transition-colors hover:border-brand-blue-400 hover:bg-brand-blue-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
        >
          Ver curso <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
