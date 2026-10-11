import IllustratedIcon from '../../../components/ui/IllustratedIcon'
import { BookOpen } from 'lucide-react'
import { type CourseItem } from '../courseTypes'
import CourseRow from './CourseRow'

type CourseListCardProps = {
  title: string
  courses: CourseItem[]
  savedIds: Set<string>
  onOpen: (course: CourseItem) => void
  onToggleSave: (course: CourseItem) => void
  emptyMessage?: string
}

export default function CourseListCard({
  title,
  courses,
  savedIds,
  onOpen,
  onToggleSave,
  emptyMessage = 'Salve os conteúdos que deseja estudar para encontrá-los nesta lista.',
}: CourseListCardProps) {
  return (
    <section
      className="my-courses-list min-w-0 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6"
      aria-label={title}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-extrabold tracking-[-0.015em] text-ink-900">{title}</h2>
        <span
          className="rounded-full border border-ink-200 bg-panel-alt px-2.5 py-1 text-xs font-bold text-ink-500"
          aria-label={`${courses.length} itens`}
        >
          {courses.length}
        </span>
      </div>
      {courses.length > 0 ? (
        <ul className="flex flex-col">
          {courses.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              isSaved={savedIds.has(course.id)}
              onOpen={onOpen}
              onToggleSave={onToggleSave}
            />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <IllustratedIcon icon={BookOpen} tone="blue" size="tile" />
          <p className="text-sm font-bold text-ink-700">Nenhum curso por aqui ainda</p>
          <p className="max-w-xs text-sm leading-6 text-ink-500">
            {emptyMessage}
          </p>
        </div>
      )}
    </section>
  )
}
