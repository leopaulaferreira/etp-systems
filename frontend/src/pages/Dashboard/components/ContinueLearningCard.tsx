import LearningIcon from '../../../components/ui/LearningIcon'
import {
  History,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DashboardData } from '../dashboardApi'

export default function ContinueLearningCard({ course }: { course: DashboardData['continueCourse'] }) {

  return (
    <section className="flex flex-col gap-5 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[19px] font-extrabold tracking-[-0.015em] text-ink-900 sm:text-xl">
          Continuar aprendendo
        </h2>
        <Link
          to="/cursos"
          aria-label="Explorar cursos"
          className="group flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-bold text-brand-blue-400 transition-colors duration-150 hover:bg-brand-blue-500/10 hover:text-brand-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30"
        >
          <span className="hidden sm:inline">Explorar cursos</span>
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-[190px_minmax(0,1fr)] md:gap-6">
        <div className="relative">
          <LearningIcon kind={course?.icon ?? 'book'} size="large" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-brand-blue-400/20 bg-panel/80 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.13em] text-brand-blue-400">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {course ? 'Em andamento' : 'Comece por aqui'}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 py-0.5">
          <div className="flex flex-col items-start gap-2.5">
            <span className="rounded-full border border-brand-blue-500/20 bg-brand-blue-500/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-brand-blue-400">
              {course ? 'Curso inscrito' : 'Catálogo de cursos'}
            </span>
            <h3 className="text-[23px] font-extrabold leading-tight tracking-[-0.02em] text-ink-900 sm:text-2xl">
              {course?.title ?? 'Escolha seu próximo curso'}
            </h3>
            <p className="text-[14px] leading-6 text-ink-500">{course?.description || 'Explore o catálogo e inscreva-se para começar a aprender.'}</p>
          </div>

          {course && <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-bold text-ink-700">Seu progresso</span>
              <span className="font-extrabold text-brand-blue-400">{Math.round(course.progress)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-blue-700 via-brand-blue-600 to-brand-cyan-500 shadow-[0_2px_8px_rgba(37,99,235,0.25)]"
                style={{ width: course.progress + '%' }}
              />
            </div>
          </div>}

          <div className="flex flex-wrap items-end justify-between gap-3 border-t border-ink-100 pt-3.5">
            {course && <div className="flex min-w-0 flex-col gap-1.5 text-[11px] font-semibold text-ink-500">
              <span className="flex min-w-0 items-center gap-1.5">
                <History className="h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={2} aria-hidden="true" />
                <span className="truncate">Última atividade: {new Date(course.lastActivity).toLocaleDateString('pt-BR')}</span>
              </span>
            </div>}
            <Link
              to={course ? `/cursos/${course.id}/estudar` : '/cursos'}
              className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-blue-700 px-4 py-2.5 text-[13px] font-extrabold text-white shadow-[0_10px_22px_-12px_rgba(29,78,216,0.8)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#17399c] hover:shadow-[0_14px_26px_-12px_rgba(29,78,216,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 focus-visible:ring-offset-2 motion-reduce:transform-none"
            >
              <span>{course ? (course.progress > 0 ? 'Continuar curso' : 'Iniciar curso') : 'Explorar cursos'}</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
