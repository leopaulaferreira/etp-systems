import { useEffect, useRef } from 'react'
import { ArrowRight, BookOpen, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CatalogCourse } from '../../../mocks/cursos.mock'
import CourseArtwork from './CourseArtwork'
import CourseMetadata from './CourseMetadata'

type CourseCatalogDialogProps = {
  course: CatalogCourse
  loading?: boolean
  error?: boolean
  enrollmentAvailable: boolean
  enrolled: boolean
  enrolling: boolean
  enrollError: boolean
  onEnroll: () => void
  onClose: () => void
}

export default function CourseCatalogDialog({
  course, loading = false, error = false, enrollmentAvailable, enrolled,
  enrolling, enrollError, onEnroll, onClose,
}: CourseCatalogDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current
    const trigger = document.activeElement as HTMLElement | null
    dialog?.showModal()
    return () => {
      dialog?.close()
      if (trigger?.isConnected) trigger.focus()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-busy={loading}
      aria-labelledby="catalog-dialog-title"
      aria-describedby="catalog-dialog-description"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = event.currentTarget.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href]',
        )
        const first = controls[0]
        const last = controls[controls.length - 1]
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
          <CourseArtwork icon={course.icon} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes do curso"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-brand-blue-400">
          {course.category} · Curso individual
        </span>
        <h2
          id="catalog-dialog-title"
          className="text-2xl font-extrabold leading-tight tracking-tight"
        >
          {course.title}
        </h2>
        <p id="catalog-dialog-description" className="text-sm leading-6 text-ink-500">
          {course.description}
        </p>
        {loading && <p role="status" className="text-xs text-ink-500">Atualizando detalhes...</p>}
        {error && <p role="alert" className="text-xs text-ink-500">Não foi possível atualizar os detalhes. Exibindo os dados do catálogo.</p>}
        <div className="border-y border-ink-100 py-5">
          <CourseMetadata course={course} showStudents />
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-ink-200 bg-panel-alt p-4 text-sm leading-6 text-ink-500">
          <BookOpen className="mt-1 h-5 w-5 shrink-0 text-brand-blue-400" aria-hidden="true" />
          <p>{enrolled ? 'Inscrição confirmada. Acompanhe este curso em Meus Cursos.'
            : 'Inscreva-se para adicionar este conteúdo a Meus Cursos.'}</p>
        </div>
        {enrollError && <p role="alert" className="text-sm text-rose-400">Não foi possível concluir a inscrição. Tente novamente.</p>}
        {enrolled ? (
          <Link to="/meus-cursos" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">
            Acessar Meus Cursos <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : enrollmentAvailable ? (
          <button type="button" onClick={onEnroll} disabled={enrolling} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 disabled:cursor-wait disabled:opacity-60">
            {enrolling ? 'Inscrevendo...' : 'Inscrever-se no curso'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <p role="status" className="text-xs text-ink-500">Inscrições indisponíveis enquanto a API estiver offline.</p>
        )}
      </div>
    </dialog>
  )
}
