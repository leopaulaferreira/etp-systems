import { Award, CheckCircle2, GraduationCap } from 'lucide-react'
import IllustratedIcon from '../../../components/ui/IllustratedIcon'

export default function CertificateAchievements({ completed }: { completed: number }) {
  const target = completed < 1 ? 1 : completed < 5 ? 5 : 10
  return (
    <section className="flex min-w-0 flex-col gap-5 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6">
      <h2 className="text-lg font-extrabold tracking-tight text-ink-900">Sua jornada de certificação</h2>
      <div className="flex items-start gap-3">
        <IllustratedIcon icon={completed ? CheckCircle2 : Award} tone="blue" size="compact" />
        <div>
          <p className="text-xs font-bold text-ink-900">{completed ? `${completed} ${completed === 1 ? 'certificado emitido' : 'certificados emitidos'}` : 'Seu primeiro certificado'}</p>
          <p className="mt-1 text-[11px] leading-5 text-ink-500">
            {completed ? 'Seus certificados ficam disponíveis para consulta e download nesta página.'
              : 'Aprove uma avaliação de um curso com certificação habilitada para começar.'}
          </p>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-3 border-t border-ink-100 pt-4">
        <IllustratedIcon icon={GraduationCap} tone="emerald" size="metric" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-ink-500">Próximo marco</p>
          <p className="mt-1 text-xs font-bold text-ink-900">{target} {target === 1 ? 'certificado' : 'certificados'}</p>
          <p className="my-2 text-[11px] text-ink-500">Sua evolução <span className="float-right">{Math.min(completed, target)}/{target}</span></p>
          <progress value={Math.min(completed, target)} max={target} aria-label="Progresso para o próximo marco de certificados"
            className="h-1.5 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-emerald-400 [&::-webkit-progress-bar]:bg-ink-100 [&::-webkit-progress-value]:bg-emerald-400" />
        </div>
      </div>
    </section>
  )
}
