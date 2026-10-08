import { Search, SlidersHorizontal, X } from 'lucide-react'
import { courseLevels } from '../../../mocks/cursos.mock'
import type { CatalogFilters, CourseOrder } from '../catalog'

type CatalogToolbarProps = {
  filters: CatalogFilters
  expanded: boolean
  onToggle: () => void
  onChange: (update: Partial<CatalogFilters>) => void
  onReset: () => void
  categories: string[]
  showPopular: boolean
}

const selectClass =
  'min-h-11 w-full min-w-0 rounded-xl border border-ink-200 bg-panel-alt px-3 py-2.5 text-sm text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400'

export default function CatalogToolbar({
  filters,
  expanded,
  onToggle,
  onChange,
  onReset,
  categories,
  showPopular,
}: CatalogToolbarProps) {
  const activeCount = Number(filters.category !== 'Todas') + Number(filters.level !== 'Todos')
  const hasFilters = activeCount > 0 || filters.query.trim().length > 0
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1fr)_minmax(260px,0.7fr)_auto]">
        <div
          role="search"
          className="flex min-h-12 min-w-0 items-center gap-2.5 rounded-xl border border-ink-200 bg-panel px-4 focus-within:border-brand-blue-500 focus-within:ring-2 focus-within:ring-brand-blue-500/20 sm:col-span-2 xl:col-span-1"
        >
          <Search className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
          <input
            type="search"
            aria-label="Buscar cursos no catálogo"
            placeholder="Buscar cursos"
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500"
          />
        </div>
        <label className="flex min-w-0 items-center gap-2 rounded-xl border border-ink-200 bg-panel px-4 text-xs font-semibold text-ink-500 focus-within:border-brand-blue-500 focus-within:ring-2 focus-within:ring-brand-blue-500/20">
          <span className="shrink-0">Ordenar por</span>
          <select
            aria-label="Ordenar por"
            value={filters.order}
            onChange={(event) => onChange({ order: event.target.value as CourseOrder })}
            className="min-h-12 min-w-0 flex-1 bg-panel py-3 text-sm text-ink-700 outline-none"
          >
            <option value="relevance">Mais relevantes</option>
            {showPopular && <option value="popular">Mais populares</option>}
            <option value="duration">Menor duração</option>
            <option value="title">Nome (A–Z)</option>
          </select>
        </label>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="catalog-filter-panel"
          onClick={onToggle}
          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 ${expanded || activeCount ? 'border-brand-blue-500/40 bg-brand-blue-500/10 text-brand-blue-400' : 'border-ink-200 bg-panel text-ink-700 hover:bg-panel-alt'}`}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filtrar
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-blue-600 px-1.5 py-0.5 text-[10px] text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>
      <div
        id="catalog-filter-panel"
        hidden={!expanded}
        className="rounded-[20px] border border-ink-200/70 bg-panel p-4 sm:p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-2 text-xs font-bold text-ink-500">
            Categoria
            <select
              aria-label="Categoria"
              value={filters.category}
              onChange={(event) =>
                onChange({ category: event.target.value as CatalogFilters['category'] })
              }
              className={selectClass}
            >
              <option value="Todas">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-xs font-bold text-ink-500">
            Nível
            <select
              aria-label="Nível"
              value={filters.level}
              onChange={(event) =>
                onChange({ level: event.target.value as CatalogFilters['level'] })
              }
              className={selectClass}
            >
              <option value="Todos">Todos os níveis</option>
              {courseLevels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-500">
          {filters.category !== 'Todas' && (
            <span className="rounded-full border border-ink-200 bg-panel px-3 py-1.5">
              {filters.category}
            </span>
          )}
          {filters.level !== 'Todos' && (
            <span className="rounded-full border border-ink-200 bg-panel px-3 py-1.5">
              {filters.level}
            </span>
          )}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-brand-blue-400 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Limpar filtros e busca
          </button>
        </div>
      )}
    </div>
  )
}
