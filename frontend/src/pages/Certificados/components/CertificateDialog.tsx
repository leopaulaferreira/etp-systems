import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export default function CertificateDialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
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
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
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
      className={`fixed inset-0 m-auto w-[calc(100%-2rem)] ${wide ? 'h-[92svh] max-h-[900px] max-w-6xl overflow-hidden' : 'max-h-[85svh] max-w-3xl overflow-y-auto'} scroll-pt-24 sm:scroll-pt-28 rounded-[22px] border border-ink-200 bg-panel p-0 text-ink-900 shadow-card backdrop:bg-navy-950/80 backdrop:backdrop-blur-sm`}
    >
      <div className={wide ? 'flex h-full min-h-0 flex-col gap-3 p-3 sm:p-4' : 'flex flex-col gap-5 p-5 sm:p-8'}>
        <div className={wide ? 'flex shrink-0 items-center justify-between gap-3' : 'sticky top-0 z-10 -mx-5 -mt-5 flex items-center justify-between gap-4 bg-panel px-5 pb-3 pt-5 sm:-mx-8 sm:-mt-8 sm:px-8 sm:pt-8'}>
          <h2 id="certificate-dialog-title" className={`${wide ? 'text-base sm:text-lg' : 'text-xl'} font-extrabold tracking-tight`}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar diálogo"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
