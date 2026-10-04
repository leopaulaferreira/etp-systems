import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Headset, Send, X } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { helpCategories, type HelpCategory } from './help'

type Props = { initialCategory: HelpCategory | null; onClose: () => void; onSubmit: () => void }

export default function SupportDialog({ initialCategory, onClose, onSubmit }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const subjectRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    const trigger = document.activeElement as HTMLElement | null
    dialog?.showModal()
    subjectRef.current?.focus()
    return () => {
      dialog?.close()
      if (trigger?.isConnected) trigger.focus()
    }
  }, [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (!String(data.get('subject') ?? '').trim() || !String(data.get('description') ?? '').trim()) {
      setError('Preencha o assunto e a descrição com mais do que espaços em branco.')
      return
    }
    // Simulação local: não transmite nem armazena o conteúdo da solicitação.
    onSubmit()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="support-title"
      aria-describedby="support-description"
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')
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
      <form onSubmit={submit} onChange={() => setError('')} className="flex flex-col gap-5 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-blue-400/20 bg-brand-blue-500/10 text-brand-cyan-400"><Headset className="h-5 w-5" aria-hidden="true" /></span>
          <button type="button" onClick={onClose} aria-label="Fechar solicitação" className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <div>
          <h2 id="support-title" className="text-xl font-extrabold tracking-tight">Enviar solicitação</h2>
          <p id="support-description" className="mt-2 text-sm leading-6 text-ink-500">Conte o que aconteceu. Neste protótipo, o envio é apenas simulado.</p>
        </div>
        <Input ref={subjectRef} id="support-subject" name="subject" label="Assunto" tone="dark" placeholder="Como podemos ajudar?" required maxLength={120} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="support-category" className="text-[13.5px] font-semibold text-white/90">Categoria</label>
          <select id="support-category" name="category" defaultValue={initialCategory ?? ''} required className="min-h-12 w-full rounded-xl border border-ink-200 bg-panel-alt px-3.5 text-sm text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">
            <option value="" disabled>Selecione uma categoria</option>
            {helpCategories.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="support-description-input" className="text-[13.5px] font-semibold text-white/90">Descrição do problema</label>
          <textarea id="support-description-input" name="description" required maxLength={2000} rows={4} placeholder="Descreva sua dúvida e o que você tentou fazer..." className="w-full resize-y rounded-xl border border-ink-200 bg-panel-alt px-3.5 py-3 text-sm leading-6 text-ink-900 placeholder:text-ink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400" />
        </div>
        {error && <p role="alert" className="text-sm text-ink-700">{error}</p>}
        <div className="flex flex-col-reverse gap-2 border-t border-ink-200 pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" icon={<Send className="h-4 w-4" aria-hidden="true" />}>Enviar solicitação</Button>
        </div>
      </form>
    </dialog>
  )
}
