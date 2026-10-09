import { ShieldCheck, Flame, Compass, ArrowRight, type LucideIcon } from 'lucide-react'
import { achievements, type Achievement } from '../../../mocks/dashboard.mock'
import { Link } from 'react-router-dom'

const badgeConfig: Record<Achievement['badge'], { icon: LucideIcon; tile: string; iconClass: string }> = {
  defensor: { icon: ShieldCheck, tile: 'border-blue-400/20 bg-blue-400/10', iconClass: 'bg-blue-600 text-white' },
  sequencia: { icon: Flame, tile: 'border-amber-400/20 bg-amber-400/10', iconClass: 'bg-amber-500 text-white' },
  explorador: { icon: Compass, tile: 'border-violet-400/20 bg-violet-400/10', iconClass: 'bg-violet-600 text-white' },
}

export default function RecentAchievementsCard() {
  return (
    <section className="flex h-full flex-col gap-4 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-extrabold tracking-[-0.015em] text-ink-900">Conquistas recentes</h2>
        <Link
          to="/perfil"
          className="group flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-bold text-brand-blue-400 transition-colors duration-150 hover:bg-brand-blue-500/10 hover:text-brand-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500/30"
        >
          Ver todas
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} aria-hidden="true" />
        </Link>
      </div>

      <ul className="flex flex-col divide-y divide-ink-100">
        {achievements.map((achievement) => {
          const { icon: Icon, tile, iconClass } = badgeConfig[achievement.badge]
          return (
            <li
              key={achievement.id}
              className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3.5 transition-colors duration-150 first:pt-0 last:pb-0 hover:bg-ink-100/60"
            >
              <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${tile}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-[0_8px_20px_-10px_rgba(0,0,0,0.9)] ${iconClass}`}>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                </span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[14px] font-bold text-ink-900">{achievement.title}</span>
                <span className="truncate text-[11px] font-medium text-ink-500">{achievement.description}</span>
              </span>
              <span className="shrink-0 rounded-full bg-ink-100/80 px-2 py-1 text-[10px] font-semibold text-ink-500">{achievement.status}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
