import { Clock3, SignalLow, SignalMedium, SignalHigh, UsersRound } from 'lucide-react'
import type { CatalogCourse } from '../../../mocks/cursos.mock'
import { formatDuration, formatStudents } from '../catalog'

const levelIcons = { Iniciante: SignalLow, Intermediário: SignalMedium, Avançado: SignalHigh }

export default function CourseMetadata({
  course,
  showStudents = false,
}: {
  course: CatalogCourse
  showStudents?: boolean
}) {
  const LevelIcon = levelIcons[course.level]
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-ink-500">
      <span className="inline-flex items-center gap-1.5">
        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
        {formatDuration(course.durationHours)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <LevelIcon className="h-4 w-4" aria-hidden="true" />
        {course.level}
      </span>
      {showStudents && course.students !== undefined && (
        <span
          className="inline-flex items-center gap-1.5"
          aria-label={`${course.students.toLocaleString('pt-BR')} alunos`}
        >
          <UsersRound className="h-4 w-4" aria-hidden="true" />
          {formatStudents(course.students)} alunos
        </span>
      )}
    </div>
  )
}
