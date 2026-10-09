import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import TrilhasHero from './components/TrilhasHero'
import TrilhasFilters from './components/TrilhasFilters'
import FeaturedTrailCard from './components/FeaturedTrailCard'
import TrailGrid from './components/TrailGrid'
import {
  categoryFilters,
  levelFilters,
  learningPaths,
  type CategoryFilter,
  type LevelFilter,
} from '../../mocks/trilhas.mock'

export default function TrilhasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('categoria')
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(
    categoryFilters.find((category) => category === initialCategory) ?? 'Todas',
  )
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('Todos')

  const filteredPaths = useMemo(
    () =>
      learningPaths.filter(
        (path) =>
          (selectedCategory === 'Todas' || path.category === selectedCategory) &&
          (selectedLevel === 'Todos' || path.level === selectedLevel),
      ),
    [selectedCategory, selectedLevel],
  )

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <TrilhasHero />

      <TrilhasFilters
        categories={categoryFilters}
        levels={levelFilters}
        selectedCategory={selectedCategory}
        selectedLevel={selectedLevel}
        onSelectCategory={setSelectedCategory}
        onSelectLevel={setSelectedLevel}
      />

      <FeaturedTrailCard />

      <TrailGrid paths={filteredPaths} />

      {(selectedCategory !== 'Todas' || selectedLevel !== 'Todos') && <div className="flex justify-center pb-1 pt-0.5">
        <button
          type="button"
          onClick={() => { setSelectedCategory('Todas'); setSelectedLevel('Todos'); setSearchParams({}, { replace: true }) }}
          className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-brand-blue-400 transition-colors duration-150 hover:bg-brand-blue-500/10 hover:text-brand-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30"
        >
          Ver todas as trilhas
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </button>
      </div>}
    </div>
  )
}
