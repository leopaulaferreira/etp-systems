import { RefreshCw } from 'lucide-react'

export default function ListLoadState({ loading, error, onRetry }: {
  loading: string
  error?: string
  onRetry?: () => void
}) {
  return <div role={error ? 'alert' : 'status'} className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-ink-200/70 bg-panel p-6 text-sm text-ink-500 shadow-card">
    <p>{error || loading}</p>
    {error && onRetry && <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-blue-700 px-4 text-xs font-bold text-white hover:bg-brand-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><RefreshCw className="h-4 w-4" aria-hidden="true" />Tentar novamente</button>}
  </div>
}
