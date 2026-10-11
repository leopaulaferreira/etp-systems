import LearningIcon from '../../../components/ui/LearningIcon'
import { Layers3, Clock3, ArrowRight, Sparkles } from 'lucide-react'
import { levelIcons } from './trailLevels'
import type { LearningPath } from '../trailApi'

export default function FeaturedTrailCard({ data, onOpen }: { data: LearningPath; onOpen: (path: LearningPath) => void }) {
  const LevelIcon = levelIcons[data.level]

  return (
    <section className="relative isolate flex min-h-[250px] flex-col gap-7 overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-r from-[#071225] via-navy-900 to-[#102755] p-6 shadow-[0_24px_50px_-32px_rgba(10,18,41,0.75)] sm:p-8 md:grid md:grid-cols-[190px_minmax(0,1fr)] md:items-center md:gap-x-8 md:gap-y-5 xl:grid-cols-[210px_minmax(0,1fr)_auto] xl:gap-x-9 xl:px-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(90deg,black,transparent_68%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-brand-cyan-400/[0.09] blur-3xl"
      />
      <div aria-hidden="true" className="absolute right-[-60px] top-[-80px] h-56 w-56 rounded-full border border-white/[0.06]" />
      <div aria-hidden="true" className="absolute right-[-15px] top-[-35px] h-36 w-36 rounded-full border border-brand-cyan-400/[0.08]" />

      <div className="relative mx-auto flex h-[168px] w-full max-w-[230px] shrink-0 items-center justify-center md:row-span-2 md:mx-0 md:w-[190px] xl:row-span-1 xl:w-[210px]">
        <LearningIcon kind={data.icon} size="featured" />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col items-start gap-3.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-cyan-400/20 bg-brand-cyan-400/10 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-brand-cyan-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <Sparkles className="h-3 w-3" strokeWidth={2.2} aria-hidden="true" />
          Em destaque
        </span>
        <h2 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[30px]">
          {data.title}
        </h2>
        <p className="max-w-[610px] text-[14px] leading-6 text-slate-300/80 sm:text-[15px]">{data.description}</p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-[13px] font-semibold text-slate-300/85">
          <span className="flex items-center gap-1.5">
            <Layers3 className="h-4 w-4 text-brand-cyan-400" strokeWidth={2} aria-hidden="true" />
            {data.courseCount} cursos
          </span>
          <span className="flex items-center gap-1.5">
            <LevelIcon className="h-4 w-4 text-brand-cyan-400" strokeWidth={2} aria-hidden="true" />
            {data.level}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock3 className="h-4 w-4 text-brand-cyan-400" strokeWidth={2} aria-hidden="true" />
            {Number(data.durationHours.toFixed(1)).toLocaleString('pt-BR')} horas
          </span>
        </div>
      </div>

      <div className="relative shrink-0 md:col-start-2 md:row-start-2 md:justify-self-start xl:col-start-3 xl:row-start-1 xl:justify-self-auto xl:self-center">
        <button
          type="button"
          onClick={() => onOpen(data)}
          className="group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-brand-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_28px_-14px_rgba(37,99,235,0.9)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-brand-blue-500 hover:shadow-[0_16px_32px_-14px_rgba(37,99,235,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 motion-reduce:transform-none"
        >
          <span>{data.enrolled ? `Continuar trilha · ${data.progress}%` : 'Explorar trilha'}</span>
          <ArrowRight
            className="h-4 w-4 text-brand-cyan-400 transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </button>
      </div>
    </section>
  )
}
