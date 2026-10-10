import { type CourseItem } from '../courseTypes'

export default function CourseBadge({ type }: { type: CourseItem['type'] }) {
  return (
    <span
      className={`inline-flex w-fit rounded-md border px-2 py-0.5 text-[9px] font-extrabold tracking-wide ${type === 'TRILHA' ? 'border-violet-400/20 bg-violet-400/10 text-violet-300' : 'border-blue-400/20 bg-blue-400/10 text-blue-300'}`}
    >
      {type}
    </span>
  )
}
