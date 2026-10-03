import { Check, ClipboardCheck, GraduationCap, Sparkles, Target } from 'lucide-react'
import PageHero from '../../../components/ui/PageHero'

function AssessmentArtwork() {
  return (
    <div className="relative h-[158px] w-[250px] shrink-0">
      <span className="absolute right-4 top-1 h-40 w-40 rounded-full border border-brand-blue-400/15 bg-brand-blue-500/5" />
      <span className="absolute right-8 top-5 h-32 w-32 rounded-full border border-dashed border-brand-cyan-400/15" />
      <div className="absolute right-16 top-4 flex h-[132px] w-[110px] -rotate-6 flex-col gap-2.5 rounded-2xl border border-brand-blue-400/35 bg-gradient-to-br from-navy-700 to-navy-900 px-4 pt-6 shadow-[12px_14px_28px_-12px_rgba(0,0,0,0.7)]">
        <span className="absolute -top-1.5 left-1/2 h-4 w-12 -translate-x-1/2 rounded-md border border-brand-blue-400/30 bg-navy-800" />
        {[0, 1, 2].map((row) => (
          <span key={row} className="flex items-center gap-2">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-brand-cyan-400/15">
              <Check className="h-2.5 w-2.5 text-brand-cyan-400" />
            </span>
            <span className={`h-1 rounded-full bg-brand-blue-400/50 ${row === 1 ? 'w-8' : 'w-10'}`} />
          </span>
        ))}
      </div>
      <span className="absolute bottom-2 left-7 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-300/30 bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg">
        <Check className="h-7 w-7 text-white" strokeWidth={2.5} />
      </span>
      <span className="absolute bottom-3 right-2 flex h-14 w-14 rotate-6 items-center justify-center rounded-2xl border border-brand-blue-400/20 bg-navy-800 shadow-lg">
        <GraduationCap className="h-9 w-9 text-brand-blue-400" strokeWidth={1.4} />
      </span>
      <Target className="absolute right-1 top-2 h-7 w-7 text-brand-cyan-400/45" strokeWidth={1.3} />
      <Sparkles className="absolute left-7 top-5 h-4 w-4 text-brand-cyan-400/60" strokeWidth={1.5} />
    </div>
  )
}

export default function AssessmentHero() {
  return (
    <PageHero
      eyebrow="Cada etapa, uma conquista"
      icon={ClipboardCheck}
      title="Minhas Avaliações"
      description="Teste seus conhecimentos e acompanhe seus resultados."
      artwork={<AssessmentArtwork />}
    />
  )
}
