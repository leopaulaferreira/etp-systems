import { CheckCircle2 } from 'lucide-react'
import { type CourseItem } from '../courseTypes'

export default function CourseProgress({ course }: { course: CourseItem }) {
  if (course.progress === undefined || course.progress === 0) {
    return <span className="text-xs font-semibold text-ink-500">Não iniciado</span>
  }
  const progress = Math.min(100, Math.max(0, course.progress))
  const completed = progress === 100
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-xs font-bold">
        <span className={completed ? 'text-emerald-400' : 'text-ink-500'}>
          {completed ? 'Concluído' : 'Progresso'}
        </span>
        <span className="flex items-center gap-1 text-ink-700">
          {completed && (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          )}
          {progress}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`Progresso de ${course.title}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="h-2 overflow-hidden rounded-full bg-ink-100"
      >
        <div
          className={`h-full rounded-full ${completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-brand-blue-700 to-brand-cyan-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
