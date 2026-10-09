import { ArrowUpRight, Bookmark } from 'lucide-react'
import { type CourseItem } from '../../../mocks/meus-cursos.mock'
import CourseThumbnail from './CourseThumbnail'
import CourseBadge from './CourseBadge'
import CourseProgress from './CourseProgress'

type CourseRowProps = {
  course: CourseItem
  isSaved: boolean
  onOpen: (course: CourseItem) => void
  onToggleSave: (course: CourseItem) => void
}

export default function CourseRow({ course, isSaved, onOpen, onToggleSave }: CourseRowProps) {
  const completed = course.progress === 100
  const hasStarted = (course.progress ?? 0) > 0
  return (
    <li className="my-course-row border-b border-ink-100 py-5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="my-course-summary flex min-w-0 items-center gap-3">
        <CourseThumbnail thumbnail={course.thumbnail} size="small" />
        <div className="flex min-w-0 flex-col items-start gap-1.5">
          <CourseBadge type={course.type} />
          <h3 className="text-[13px] font-extrabold leading-snug text-ink-900">{course.title}</h3>
        </div>
      </div>
      <CourseProgress course={course} />
      <div className="flex min-w-0 flex-col gap-1 text-[11px] font-semibold text-ink-500">
        <span>
          {completed
            ? 'Concluído em'
            : hasStarted
              ? 'Atualizado em'
              : course.type === 'TRILHA'
                ? 'Conteúdo'
                : 'Duração'}
        </span>
        <span className="text-ink-700">
          {completed ? course.completedAt : hasStarted ? course.updatedAt : course.duration}
        </span>
      </div>
      <div className="my-course-actions flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onOpen(course)}
          aria-label={`Ver detalhes de ${course.title}`}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-brand-blue-500/25 bg-brand-blue-500/10 px-3 py-2 text-xs font-extrabold text-brand-blue-400 transition-colors hover:bg-brand-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
        >
          Ver detalhes <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onToggleSave(course)}
          aria-pressed={isSaved}
          aria-label={`${isSaved ? 'Remover dos salvos' : 'Salvar'}: ${course.title}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-brand-blue-400 transition-colors hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
        >
          <Bookmark
            className="h-4 w-4"
            fill={isSaved ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>
      </div>
    </li>
  )
}
