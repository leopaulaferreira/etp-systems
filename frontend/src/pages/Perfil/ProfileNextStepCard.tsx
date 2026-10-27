import { ArrowRight, BookOpen, ClipboardCheck, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import IllustratedIcon from '../../components/ui/IllustratedIcon'
import type { Assessment } from '../../types/assessment'
import type { CourseItem } from '../MeusCursos/courseTypes'
import { profileNextStep } from './profileNextStep'

type Props = {
  courses: CourseItem[]
  assessments: Assessment[]
  status: 'loading' | 'ready' | 'error'
  onRetry: () => void
  className: string
}

export default function ProfileNextStepCard({ courses, assessments, status, onRetry, className }: Props) {
  const next = status === 'ready' ? profileNextStep(courses, assessments) : null
  const Icon = next?.kind === 'assessment' ? ClipboardCheck : next?.kind === 'course' ? BookOpen : Compass

  return <section aria-labelledby="profile-next-step-title" className={`${className} flex flex-col gap-4`}>
    <h2 id="profile-next-step-title" className="text-[17px] font-extrabold tracking-tight text-ink-900">Próximo passo</h2>
    {status === 'loading' && <p role="status" className="text-xs leading-5 text-ink-500">Consultando sua jornada de aprendizagem…</p>}
    {status === 'error' && <>
      <p className="flex-1 text-xs leading-5 text-ink-500">Não foi possível consultar seu próximo passo.</p>
      <button type="button" onClick={onRetry} className="min-h-11 rounded-xl border border-ink-200 px-4 py-2 text-xs font-bold text-brand-blue-400 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Atualizar sugestão</button>
    </>}
    {next && <>
      <div className="flex min-w-0 items-start gap-3">
        <IllustratedIcon icon={Icon} tone="blue" size="compact" />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-xs font-bold leading-5 text-ink-900" title={next.title}>{next.title}</h3>
          <p className="mt-1 text-[11px] leading-4 text-brand-blue-400">{next.detail}</p>
        </div>
      </div>
      {next.progress !== undefined
        ? <div role="progressbar" aria-label={`Próximo passo: progresso de ${next.title}`} aria-valuenow={next.progress} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-gradient-to-r from-brand-blue-600 to-brand-cyan-400" style={{ width: `${next.progress}%` }} /></div>
        : <p className="text-xs leading-5 text-ink-500">{next.description}</p>}
      <Link to={next.to} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">{next.label}<ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>
    </>}
  </section>
}
