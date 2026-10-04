import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export default function CertificateDialog({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const dialog = ref.current
    dialog?.showModal()
    return () => {
      dialog?.close()
      if (trigger?.isConnected) trigger.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      aria-labelledby="certificate-dialog-title"
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
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
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
      className="fixed inset-0 m-auto max-h-[85svh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-[22px] border border-ink-200 bg-panel p-0 text-ink-900 shadow-card backdrop:bg-navy-950/80 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-5 p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="certificate-dialog-title" className="text-xl font-extrabold tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar diálogo"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
