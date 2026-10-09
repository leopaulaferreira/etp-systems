import { useEffect, useRef, useState } from 'react'
import { Bookmark, CalendarDays, Clock3, History, X } from 'lucide-react'
import { type CourseItem } from '../../../mocks/meus-cursos.mock'
import CourseBadge from './CourseBadge'
import CourseProgress from './CourseProgress'
import CourseThumbnail from './CourseThumbnail'

type CourseDetailsDialogProps = {
  course: CourseItem
  isSaved: boolean
  editable: boolean
  onClose: () => void
  onToggleSave: (course: CourseItem) => void
  onUpdateProgress: (course: CourseItem, percentual: number) => Promise<void>
}

export default function CourseDetailsDialog({
  course,
  isSaved,
  editable,
  onClose,
  onToggleSave,
  onUpdateProgress,
}: CourseDetailsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState(course.progress ?? 0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [saved, setSaved] = useState(false)

  async function saveProgress() {
    setSaving(true)
    setSaveError(false)
    setSaved(false)
    try {
      await onUpdateProgress(course, draft)
      setSaved(true)
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }
  useEffect(() => {
    const dialog = dialogRef.current
    const trigger = document.activeElement as HTMLElement | null
    dialog?.showModal()
    return () => {
      dialog?.close()
      // Um curso removido pode sair da lista enquanto o diálogo está aberto.
      if (trigger?.isConnected) trigger.focus()
      else document.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="course-details-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const buttons =
          event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])')
        const first = buttons[0]
        const last = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
      className="fixed inset-0 m-auto max-h-[85svh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-[22px] border border-ink-200 bg-panel p-0 text-ink-900 shadow-card backdrop:bg-navy-950/80 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <CourseThumbnail thumbnail={course.thumbnail} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes do curso"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <CourseBadge type={course.type} />
        <h2
          id="course-details-title"
          className="text-2xl font-extrabold leading-tight tracking-tight"
        >
          {course.title}
        </h2>
        {course.description && (
          <p className="text-sm leading-6 text-ink-500">{course.description}</p>
        )}
        <CourseProgress course={course} />
        <div className="flex flex-col gap-3 border-y border-ink-100 py-4 text-sm text-ink-700">
          <p className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 shrink-0 text-brand-blue-400" aria-hidden="true" />
            {course.duration}
          </p>
          {course.lastLesson && (
            <p className="flex items-start gap-2">
              <History className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue-400" aria-hidden="true" />
              <span>Última aula: {course.lastLesson}</span>
            </p>
          )}
          {course.updatedAt && course.progress !== 100 && (
            <p className="flex items-center gap-2">
              <History className="h-4 w-4 shrink-0 text-brand-blue-400" aria-hidden="true" />
              Atualizado em {course.updatedAt}
            </p>
          )}
          {course.progress === 100 && course.completedAt && (
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              Concluído em {course.completedAt}
            </p>
          )}
        </div>
        {editable && (
          <form onSubmit={(event) => { event.preventDefault(); void saveProgress() }}
            className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-panel-alt p-4">
            <div className="flex items-center justify-between gap-3 text-sm font-bold text-ink-900">
              <label htmlFor="manual-course-progress">Seu progresso</label>
              <output htmlFor="manual-course-progress" className="text-brand-blue-400">{draft}%</output>
            </div>
            <input id="manual-course-progress" type="range" min="0" max="100" step="5"
              value={draft} disabled={saving}
              onChange={(event) => { setDraft(Number(event.target.value)); setSaved(false) }}
              className="w-full cursor-pointer accent-brand-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 disabled:cursor-wait" />
            <p className="text-xs leading-5 text-ink-500">Atualize seu avanço manualmente. Em 100%, o curso aparece em Concluídos.</p>
            {saveError && <p role="alert" className="text-xs text-rose-400">Não foi possível salvar o progresso. Tente novamente.</p>}
            {saved && <p role="status" className="text-xs text-emerald-400">Progresso salvo.</p>}
            <button type="submit" disabled={saving || draft === (course.progress ?? 0)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar progresso'}
            </button>
          </form>
        )}
        <button
          type="button"
          onClick={() => onToggleSave(course)}
          aria-pressed={isSaved}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
        >
          <Bookmark
            className="h-4 w-4"
            fill={isSaved ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
          {isSaved ? 'Remover dos salvos' : 'Salvar para estudar'}
        </button>
      </div>
    </dialog>
  )
}
