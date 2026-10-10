type CategoryFilter = string
type LevelFilter = string

type TrilhasFiltersProps = {
  categories: readonly CategoryFilter[]
  levels: readonly LevelFilter[]
  selectedCategory: CategoryFilter
  selectedLevel: LevelFilter
  onSelectCategory: (category: CategoryFilter) => void
  onSelectLevel: (level: LevelFilter) => void
}

export default function TrilhasFilters({
  categories,
  levels,
  selectedCategory,
  selectedLevel,
  onSelectCategory,
  onSelectLevel,
}: TrilhasFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-ink-200/70 bg-panel p-4 shadow-card sm:p-5 xl:flex-row xl:items-center xl:gap-5">
      <FilterGroup label="Categorias">
        {categories.map((category) => (
          <FilterPill
            key={category}
            label={category}
            isActive={category === selectedCategory}
            onClick={() => onSelectCategory(category)}
          />
        ))}
      </FilterGroup>

      <span className="hidden h-8 w-px shrink-0 bg-ink-200 xl:block" aria-hidden="true" />

      <FilterGroup label="Nível">
        {levels.map((level) => (
          <FilterPill
            key={level}
            label={level}
            isActive={level === selectedLevel}
            onClick={() => onSelectLevel(level)}
          />
        ))}
      </FilterGroup>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="mr-0.5 min-w-[76px] text-[13px] font-extrabold tracking-[-0.01em] text-ink-700 xl:min-w-0">
        {label}
      </span>
      {children}
    </div>
  )
}

function FilterPill({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={`min-h-9 rounded-full border px-4 py-2 text-[13px] font-bold leading-none transition-[background-color,border-color,color,box-shadow,transform] duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/35 focus-visible:ring-offset-2 motion-reduce:transform-none ${
        isActive
          ? 'border-brand-blue-600 bg-brand-blue-600 text-white shadow-[0_6px_14px_-7px_rgba(37,99,235,0.85)]'
          : 'border-ink-200/90 bg-panel-alt text-ink-700 hover:border-brand-blue-500/45 hover:bg-brand-blue-500/10 hover:text-brand-blue-400 hover:shadow-sm'
      }`}
    >
      {label}
    </button>
  )
}
