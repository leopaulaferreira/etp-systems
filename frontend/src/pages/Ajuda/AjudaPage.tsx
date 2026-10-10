import { useState } from 'react'
import { Award, BookOpen, CheckCircle2, ChevronDown, ClipboardCheck, Headset, Search, SearchX, Send, UserRound, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../../components/ui/PageHero'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { filterHelpQuestions, helpCategories, type HelpCategory } from './help'
import SupportDialog from './SupportDialog'
import { useAuth } from '../../auth/AuthContext'

const categoryIcons = { conta: UserRound, cursos: BookOpen, avaliacoes: ClipboardCheck, certificados: Award }

export default function AjudaPage() {
  const { role } = useAuth()
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<HelpCategory | null>(null)
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)
  const [supportOpen, setSupportOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const questions = filterHelpQuestions(query, category)
  const filtered = Boolean(query || category)

  function clearFilters() {
    setQuery('')
    setCategory(null)
    setOpenQuestion(null)
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
      <PageHero eyebrow="Estamos por aqui" icon={Headset} title="Central de Ajuda" description="Encontre respostas rápidas ou fale com o suporte." />
      <div role="group" aria-label="Categorias de ajuda" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {helpCategories.map(({ id, label }) => {
          const Icon = categoryIcons[id]
          const active = category === id
          return (
            <button key={id} type="button" aria-pressed={active} onClick={() => { setCategory(active ? null : id); setOpenQuestion(null) }} className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition-colors sm:p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 ${active ? 'border-brand-blue-400/50 bg-brand-blue-500/10 text-ink-900' : 'border-ink-200 bg-panel text-ink-700 hover:border-brand-blue-400/40 hover:bg-panel-alt'}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-blue-400/20 bg-brand-blue-500/10 text-brand-blue-400"><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
              <span className="text-xs font-bold sm:text-sm">{label}</span>
            </button>
          )
        })}
      </div>
      <section aria-labelledby="help-faq-title" className="min-w-0 overflow-hidden rounded-[22px] border border-ink-200 bg-panel shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h2 id="help-faq-title" className="text-base font-extrabold text-ink-900">Dúvidas frequentes</h2>
              <p role="status" className="mt-1 text-xs text-ink-500">{questions.length} {questions.length === 1 ? 'resposta encontrada' : 'respostas encontradas'}</p>
            </div>
            {filtered && <Button type="button" variant="ghost" onClick={clearFilters}>Limpar filtros</Button>}
          </div>
          <div className="w-full sm:w-[min(40%,360px)]">
            <Input
              id="help-search"
              type="search"
              tone="dark"
              aria-label="Buscar uma dúvida"
              placeholder="Buscar uma dúvida..."
              value={query}
              onChange={(event) => { setQuery(event.target.value); setOpenQuestion(null) }}
              icon={<Search className="h-4 w-4" aria-hidden="true" />}
              trailing={query && <button type="button" onClick={() => { setQuery(''); document.getElementById('help-search')?.focus() }} aria-label="Limpar busca" className="rounded-lg p-1 text-ink-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><X className="h-4 w-4" aria-hidden="true" /></button>}
            />
          </div>
        </div>
        {questions.length ? questions.map((item) => {
          const expanded = openQuestion === item.id
          return (
            <div key={item.id} className="border-b border-ink-200/60 last:border-b-0">
              <h3>
                <button type="button" id={`help-question-${item.id}`} aria-expanded={expanded} aria-controls={`help-answer-${item.id}`} onClick={() => setOpenQuestion(expanded ? null : item.id)} className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[13px] font-semibold transition-colors hover:bg-brand-blue-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-blue-400 sm:px-6 ${expanded ? 'bg-brand-blue-500/5 text-brand-blue-400' : 'text-ink-700'}`}>
                  {item.question}
                  <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-brand-blue-400 transition-transform duration-200 motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`} />
                </button>
              </h3>
              <div id={`help-answer-${item.id}`} role="region" aria-labelledby={`help-question-${item.id}`} aria-hidden={!expanded} inert={!expanded} className={`grid transition-[grid-template-rows,visibility] duration-200 motion-reduce:transition-none ${expanded ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'}`}>
                <div className="min-h-0 overflow-hidden"><p className="max-w-4xl px-5 pb-5 text-sm leading-6 text-ink-500 sm:px-6">{item.answer}</p></div>
              </div>
            </div>
          )
        }) : (
          <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
            <SearchX className="h-8 w-8 text-brand-blue-400" aria-hidden="true" />
            <h3 className="text-sm font-bold text-ink-900">Nenhuma dúvida encontrada</h3>
            <p className="text-sm text-ink-500">Tente outra palavra ou limpe os filtros para ver todas as respostas.</p>
          </div>
        )}
      </section>
      <section aria-labelledby="help-support-title" className="flex flex-col gap-4 rounded-[22px] border border-brand-blue-400/20 bg-panel p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-cyan-500/10 text-brand-cyan-400"><Headset className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <h2 id="help-support-title" className="text-base font-extrabold text-ink-900">Ainda precisa de ajuda?</h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-ink-500">Se não encontrou a resposta que procura, envie uma solicitação para nossa equipe.</p>
          </div>
        </div>
        <Button type="button" className="shrink-0" icon={<Send className="h-4 w-4" aria-hidden="true" />} onClick={() => { setSubmitted(false); setSupportOpen(true) }}>Enviar solicitação</Button>
      </section>
      <div role="status" aria-atomic="true" className={submitted ? '' : 'sr-only'}>
        {submitted && <p className="flex items-start gap-2 rounded-xl border border-brand-cyan-400/20 bg-brand-cyan-400/5 p-4 text-sm leading-6 text-ink-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-cyan-400" aria-hidden="true" /><span>Solicitação simulada com sucesso. Nenhum dado foi enviado à equipe de suporte.</span></p>}
      </div>
      <footer className="flex flex-col gap-3 text-xs text-ink-500">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <button type="button" aria-expanded={termsOpen} aria-controls="help-terms" onClick={() => setTermsOpen(!termsOpen)} className="rounded py-1 hover:text-brand-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Termos de Uso</button>
          {role === 'empresa' ? <button type="button" aria-expanded={privacyOpen} aria-controls="help-company-privacy" onClick={() => setPrivacyOpen(!privacyOpen)} className="rounded py-1 hover:text-brand-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Política de Privacidade</button> : <Link to="/configuracoes?secao=privacidade" className="rounded py-1 hover:text-brand-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Política de Privacidade</Link>}
        </div>
        <p id="help-terms" hidden={!termsOpen} className="text-center leading-5">Os Termos de Uso completos ainda não estão disponíveis.</p>
        {role === 'empresa' && <p id="help-company-privacy" hidden={!privacyOpen} className="text-center leading-5">A Política de Privacidade da área empresarial ainda não está disponível.</p>}
      </footer>
      {supportOpen && <SupportDialog initialCategory={category} onClose={() => setSupportOpen(false)} onSubmit={() => { setSupportOpen(false); setSubmitted(true) }} />}
    </div>
  )
}
