import { Route } from 'lucide-react'
import IllustratedIcon from '../../../components/ui/IllustratedIcon'
import TrailCard from './TrailCard'
import { type LearningPath } from '../trailApi'

type TrailGridProps = {
  paths: LearningPath[]
  onOpen: (path: LearningPath) => void
}

export default function TrailGrid({ paths, onOpen }: TrailGridProps) {
  if (paths.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-panel p-10 text-center text-sm text-ink-500 shadow-card">
        <IllustratedIcon icon={Route} tone="blue" size="tile" />
        <p>Nenhuma trilha encontrada para os filtros selecionados.</p>
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
