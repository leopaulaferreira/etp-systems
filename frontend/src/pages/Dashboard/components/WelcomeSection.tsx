import WelcomeIllustration from './WelcomeIllustration'
import { useProfile } from '../../../profile/ProfileContext'
import { LayoutDashboard } from 'lucide-react'

export default function WelcomeSection() {
  const { profile } = useProfile()
  return (
    <section className="relative isolate flex min-h-[206px] items-center overflow-hidden rounded-[24px] border border-brand-blue-500/20 bg-gradient-to-br from-[#111f3a] via-panel to-[#102755] px-6 py-8 shadow-[0_24px_50px_-32px_rgba(0,0,0,0.85)] sm:px-8 lg:min-h-[226px] lg:px-10 lg:py-9">
      <div
        aria-hidden="true"
        className="absolute -left-16 -top-24 h-52 w-52 rounded-full border-[36px] border-brand-blue-500/[0.035]"
      />
      <div aria-hidden="true" className="absolute bottom-0 left-[42%] h-px w-44 bg-gradient-to-r from-transparent via-brand-cyan-400/40 to-transparent" />

      <div className="relative z-10 flex max-w-[650px] flex-col items-start gap-3.5 xl:max-w-[53%]">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue-500/20 bg-brand-blue-500/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.11em] text-brand-blue-400 shadow-sm backdrop-blur-sm">
          <LayoutDashboard className="h-3.5 w-3.5 text-brand-cyan-500" strokeWidth={2.3} aria-hidden="true" />
          Seu painel de aprendizado
        </span>
        <h1 className="text-[31px] font-extrabold leading-[1.12] tracking-[-0.025em] text-ink-900 sm:text-[34px] lg:text-[36px]">
          Olá, {profile.name} <span aria-hidden="true"> </span>
        </h1>
        <p className="max-w-[620px] text-[15px] leading-7 text-ink-500 sm:text-base">
          Que bom ter você aqui! Continue aprendendo e evoluindo na sua jornada profissional.
        </p>
      </div>
      <WelcomeIllustration />
    </section>
  )
}
