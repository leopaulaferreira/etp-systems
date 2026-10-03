import { Award, Sparkles } from 'lucide-react'

export default function CertificatesHero() {
  return (
    <section className="relative isolate flex min-h-[206px] items-center overflow-hidden rounded-[24px] border border-brand-blue-500/20 bg-gradient-to-br from-navy-800 via-panel to-navy-700 px-6 py-8 shadow-card sm:px-8 lg:min-h-[226px] lg:px-10 lg:py-9">
      <div className="relative z-10 flex flex-col items-start gap-3 xl:max-w-[65%]">
        <h1 className="text-[31px] font-extrabold leading-[1.12] tracking-[-0.025em] text-ink-900 sm:text-[34px] lg:text-[36px]">
          Meus Certificados
        </h1>
        <p className="max-w-[620px] text-[15px] leading-7 text-ink-500 sm:text-base">
          Confira suas conquistas e continue evoluindo na sua jornada.
        </p>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-14 top-1/2 hidden h-48 w-56 -translate-y-1/2 xl:block"
      >
        <span className="absolute inset-0 rounded-full border border-brand-blue-400/15 bg-brand-blue-500/5" />
        <div className="absolute inset-x-5 inset-y-6 -rotate-12 rounded-xl border border-brand-blue-400/40 bg-gradient-to-br from-navy-700 to-navy-900 p-6 shadow-card">
          <span className="block h-1.5 w-20 rounded bg-brand-blue-400/50" />
          <span className="mt-3 block h-1 w-28 rounded bg-brand-blue-400/20" />
          <span className="mt-2 block h-1 w-20 rounded bg-brand-blue-400/20" />
          <Award
            className="absolute bottom-3 right-4 h-16 w-16 text-brand-cyan-400"
            strokeWidth={1.3}
          />
        </div>
        <Sparkles
          className="absolute right-0 top-0 h-7 w-7 text-brand-cyan-400"
          strokeWidth={1.5}
        />
      </div>
    </section>
  )
}
