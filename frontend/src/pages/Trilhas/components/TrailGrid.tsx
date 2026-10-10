import TrailCard from './TrailCard'
import { type LearningPath } from '../trailApi'

type TrailGridProps = {
  paths: LearningPath[]
  onOpen: (path: LearningPath) => void
}

export default function TrailGrid({ paths, onOpen }: TrailGridProps) {
  if (paths.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-200 bg-panel p-10 text-center text-sm text-ink-500 shadow-card">
        Nenhuma trilha encontrada para os filtros selecionados.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
      {paths.map((path) => (
        <TrailCard key={path.id} path={path} onOpen={onOpen} />
      ))}
    </div>
  )
}
