import type { ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'
import Button from '../components/ui/Button'
import { useAuth } from './AuthContext'

export default function SessionGate({ children }: { children: ReactNode }) {
  const { status, retry, logout } = useAuth()
  if (status !== 'checking' && status !== 'unavailable') return children
  return <main className="flex min-h-svh items-center justify-center bg-navy-950 p-5">
    <section className="w-full max-w-md space-y-4 rounded-[22px] border border-ink-200 bg-panel p-6 text-center shadow-card">
      <ShieldCheck className="mx-auto h-8 w-8 text-brand-blue-400" aria-hidden="true" />
      <h1 className="text-lg font-bold text-ink-900">{status === 'checking' ? 'Verificando seu acesso' : 'Não foi possível verificar sua sessão'}</h1>
      <p role={status === 'checking' ? 'status' : 'alert'} className="text-sm leading-6 text-ink-500">{status === 'checking' ? 'Aguarde um instante...' : 'Confira sua conexão e tente novamente.'}</p>
      {status === 'unavailable' && <div className="flex flex-wrap justify-center gap-3"><Button onClick={() => { void retry() }}>Tentar novamente</Button><Button variant="ghost" onClick={logout}>Voltar ao login</Button></div>}
    </section>
  </main>
}
