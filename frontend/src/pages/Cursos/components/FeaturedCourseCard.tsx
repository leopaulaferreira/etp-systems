import { ArrowRight, Sparkles } from 'lucide-react'
import type { CatalogCourse } from '../../../mocks/cursos.mock'
import CourseArtwork from './CourseArtwork'
import CourseMetadata from './CourseMetadata'

type FeaturedCourseCardProps = { course: CatalogCourse; onOpen: (course: CatalogCourse) => void }

export default function FeaturedCourseCard({ course, onOpen }: FeaturedCourseCardProps) {
  return (
    <section
      aria-labelledby="featured-course-title"
      className="relative isolate grid overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-r from-[#071225] via-navy-900 to-[#102755] shadow-[0_24px_50px_-32px_rgba(10,18,41,0.75)] md:grid-cols-[210px_minmax(0,1fr)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(90deg,black,transparent_68%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-brand-cyan-400/[0.09] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[60px] -top-20 h-56 w-56 rounded-full border border-white/[0.06]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[15px] -top-[35px] h-36 w-36 rounded-full border border-brand-cyan-400/[0.08]"
      />
      <CourseArtwork icon={course.icon} featured />
      <div className="relative flex min-w-0 flex-col justify-center gap-3 p-5 sm:p-6">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-brand-blue-400/20 bg-brand-blue-500/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-brand-blue-400">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Em destaque
        </span>
        <h2
          id="featured-course-title"
          className="text-xl font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-[23px]"
        >
          {course.title}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-ink-500">{course.description}</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
          <CourseMetadata course={course} showStudents />
          <button
            type="button"
            onClick={() => onOpen(course)}
            aria-label={`Ver curso em destaque: ${course.title}`}
            className="inline-flex min-h-11 items-center justify-center gap-3 rounded-xl bg-brand-blue-700 px-5 py-2.5 text-[13px] font-extrabold text-white transition-colors hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
          >
            Ver curso <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
