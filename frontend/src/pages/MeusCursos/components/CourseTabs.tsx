import { Bookmark, CheckCircle2, Clock3 } from 'lucide-react'

export type CourseTab = 'ongoing' | 'completed' | 'saved'

type CourseTabsProps = {
  activeTab: CourseTab
  onChange: (tab: CourseTab) => void
}

const tabs: { id: CourseTab; label: string; icon: typeof Clock3 }[] = [
  { id: 'ongoing', label: 'Inscritos', icon: Clock3 },
  { id: 'completed', label: 'Concluídos', icon: CheckCircle2 },
  { id: 'saved', label: 'Salvos', icon: Bookmark },
]

export default function CourseTabs({ activeTab, onChange }: CourseTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Situação dos meus cursos"
      className="flex justify-between gap-2 border-b border-ink-200/70 sm:justify-start sm:gap-5"
    >
      {tabs.map(({ id, label, icon: Icon }, index) => (
        <button
          key={id}
          id={`course-tab-${id}`}
          type="button"
          role="tab"
          aria-selected={activeTab === id}
          aria-controls="my-courses-panel"
          tabIndex={activeTab === id ? 0 : -1}
          onClick={() => onChange(id)}
          onKeyDown={(event) => {
            const nextIndex =
              event.key === 'ArrowRight'
                ? (index + 1) % tabs.length
                : event.key === 'ArrowLeft'
                  ? (index + tabs.length - 1) % tabs.length
                  : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? tabs.length - 1
                      : null
            if (nextIndex === null) return
            event.preventDefault()
            onChange(tabs[nextIndex].id)
            document.getElementById(`course-tab-${tabs[nextIndex].id}`)?.focus()
          }}
          className={`flex min-h-11 items-center gap-1.5 whitespace-nowrap border-b-2 px-0.5 pb-3 text-xs font-bold transition-colors focus-visible:rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 sm:gap-2 sm:px-1 sm:text-sm ${activeTab === id ? 'border-brand-blue-500 text-brand-blue-400' : 'border-transparent text-ink-500 hover:border-ink-200 hover:text-ink-700'}`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  )
}
