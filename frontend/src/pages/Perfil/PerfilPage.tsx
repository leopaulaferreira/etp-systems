import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, Bell, CalendarDays, CheckCheck, ChevronRight,
  Clock3, Download, GraduationCap, Mail, MapPin, MapPinned, Pencil,
  ShieldCheck, Sparkles, Target, UserRound,
} from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import IllustratedIcon, { type IconTone } from '../../components/ui/IllustratedIcon'
import PageHero from '../../components/ui/PageHero'
import { achievements, metricCards } from '../../mocks/dashboard.mock'
import { certificates } from '../../mocks/certificados.mock'
import { ongoingCourses } from '../../mocks/meus-cursos.mock'
import { useAssessments } from '../../assessments/AssessmentContext'
import { useProfile } from '../../profile/ProfileContext'
import { assessmentSummary } from '../Avaliacoes/assessment'
import { downloadCertificate } from '../Certificados/certificatePdf'
import { formatCertificateDate } from '../Certificados/certificates'
import CertificatePreview from '../Certificados/components/CertificatePreview'
import CourseThumbnail from '../MeusCursos/components/CourseThumbnail'

const cardClass = 'min-w-0 rounded-[22px] border border-ink-200/70 bg-panel p-5 shadow-card sm:p-6'
const linkClass = 'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-brand-blue-400 hover:bg-brand-blue-500/10 hover:text-brand-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400'
const completedCertificates = certificates
  .filter((item) => item.status === 'completed')
  .sort((a, b) => b.issuedAt!.localeCompare(a.issuedAt!))
const badgeIcons = { defensor: ShieldCheck, sequencia: Sparkles, explorador: MapPinned }
const badgeTones: Record<(typeof achievements)[number]['badge'], IconTone> = {
  defensor: 'blue', sequencia: 'orange', explorador: 'violet',
}

function SectionHeading({ title, to, action = 'Ver todos' }: { title: string; to?: string; action?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-[17px] font-extrabold tracking-tight text-ink-900">{title}</h2>
      {to && <Link to={to} className={linkClass}>{action}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 border-b border-ink-100 py-2.5 text-xs last:border-b-0"><dt className="text-ink-500">{label}</dt><dd className="font-semibold text-ink-700">{children}</dd></div>
}

export default function PerfilPage() {
  const { profile } = useProfile()
  const { assessments } = useAssessments()
  const completedAssessments = assessmentSummary(assessments).completed
  const [announcement, setAnnouncement] = useState('')

  function download(item: (typeof certificates)[number]) {
    if (item.status !== 'completed') return
    try {
      downloadCertificate(item, profile.name)
      setAnnouncement(`Download solicitado: ${item.title}.`)
    } catch {
      setAnnouncement('Não foi possível gerar o PDF. Tente novamente.')
    }
  }

  const stats = [
    { label: 'Trilhas em andamento', value: metricCards.find((item) => item.id === 'trilhas-andamento')?.value ?? '—', to: '/trilhas', icon: MapPinned, tone: 'blue' as const, action: 'Ver todas' },
    { label: 'Certificados', value: String(completedCertificates.length), to: '/certificados', icon: BadgeCheck, tone: 'violet' as const, action: 'Ver todos' },
    { label: 'Horas estudadas', value: metricCards.find((item) => item.id === 'horas-estudadas')?.value ?? '—', to: '/relatorios', icon: Clock3, tone: 'orange' as const, action: 'Ver detalhes' },
    { label: 'Avaliações concluídas', value: String(completedAssessments), to: '/avaliacoes', icon: CheckCheck, tone: 'emerald' as const, action: 'Ver todas' },
  ]

  return (
    <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
      <PageHero
        eyebrow="Sua jornada"
        icon={UserRound}
        title="Perfil"
        description="Gerencie suas informações e acompanhe seu progresso."
      />

      <section className={`${cardClass} flex flex-col gap-6 xl:flex-row xl:items-stretch`} aria-label="Resumo do perfil">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar name={profile.name} className="h-20 w-20 text-2xl sm:h-24 sm:w-24" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-extrabold text-ink-900">{profile.name}</h2><span className="rounded-md bg-brand-blue-500/15 px-2 py-0.5 text-xs font-bold text-brand-blue-400">{profile.role}</span></div>
            <div className="mt-3 flex flex-col gap-2 text-xs text-ink-500">
              <span className="flex items-center gap-2 break-all"><Mail className="h-4 w-4 shrink-0" aria-hidden="true" />{profile.email}</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />{profile.location}</span>
              <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />Membro desde {formatCertificateDate(profile.memberSince)}</span>
              <span className="flex items-center gap-2"><Target className="h-4 w-4 shrink-0" aria-hidden="true" /><strong className="font-semibold text-ink-700">Foco:</strong> {profile.learningFocus}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[62%]">
          {stats.map(({ label, value, to, icon, tone, action }) => (
            <Link key={label} to={to} className="group flex min-w-0 flex-col items-center justify-between gap-2 rounded-[18px] border border-ink-200 bg-panel-alt/60 px-2 py-4 text-center transition-colors hover:border-brand-blue-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">
              <IllustratedIcon icon={icon} tone={tone} size="compact" />
              <span className="text-[11px] font-medium leading-4 text-ink-500">{label}</span>
              <strong className="text-[25px] font-extrabold leading-none text-ink-900">{value}</strong>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue-400">{action}<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <section className={`${cardClass} flex flex-col gap-3`}>
          <SectionHeading title="Informações pessoais" />
          <dl className="flex-1">
            <DetailRow label="Nome completo">{profile.name}</DetailRow>
            <DetailRow label="Telefone">{profile.phone || '—'}</DetailRow>
            <DetailRow label="Cargo">{profile.position || '—'}</DetailRow>
            <DetailRow label="Empresa">{profile.company || '—'}</DetailRow>
          </dl>
          <Link to="/configuracoes" className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-ink-200 text-xs font-bold text-brand-blue-400 hover:border-brand-blue-500/40 hover:bg-brand-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400">Editar informações <Pencil className="h-3.5 w-3.5" aria-hidden="true" /></Link>
        </section>

        <section className={`${cardClass} flex flex-col gap-4`}>
          <SectionHeading title="Objetivos de aprendizado" to="/meus-cursos" />
          <ul className="flex flex-1 flex-col justify-around gap-4">
            {ongoingCourses.slice(0, 3).map((course) => (
              <li key={course.id} className="flex min-w-0 items-center gap-3">
                <CourseThumbnail thumbnail={course.thumbnail} size="small" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-ink-900" title={course.title}>{course.title}</p>
                  <div className="mt-1 flex justify-between text-[11px] text-ink-500"><span>{course.type === 'TRILHA' ? 'Trilha' : 'Curso'} em andamento</span><span>{course.progress ?? 0}%</span></div>
                  <div role="progressbar" aria-label={`Progresso de ${course.title}`} aria-valuenow={course.progress ?? 0} aria-valuemin={0} aria-valuemax={100} className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-gradient-to-r from-brand-blue-600 to-brand-cyan-400" style={{ width: `${course.progress ?? 0}%` }} /></div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${cardClass} flex flex-col gap-4`}>
          <SectionHeading title="Conquistas recentes" to="/dashboard" action="Ver no painel" />
          <ul className="flex flex-1 flex-col divide-y divide-ink-100">
            {achievements.map((item) => {
              const Icon = badgeIcons[item.badge]
              return <li key={item.id} className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0"><IllustratedIcon icon={Icon} tone={badgeTones[item.badge]} size="compact" /><div className="min-w-0 flex-1"><p className="text-xs font-bold text-ink-900">{item.title}</p><p className="mt-0.5 text-[11px] leading-4 text-ink-500">{item.description}</p></div><span className="shrink-0 text-[10px] text-ink-500">{item.status}</span></li>
            })}
          </ul>
        </section>

        <section className={`${cardClass} flex flex-col gap-4`}>
          <SectionHeading title="Certificados recentes" to="/certificados" />
          <ul className="flex flex-1 flex-col divide-y divide-ink-100">
            {completedCertificates.slice(0, 3).map((item) => (
              <li key={item.id} className="flex min-w-0 items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="w-14 shrink-0"><CertificatePreview item={item} compact /></div>
                <div className="min-w-0 flex-1"><p className="text-xs font-bold text-ink-900">{item.title}</p><p className="mt-0.5 text-[11px] text-ink-500">Concluído em {formatCertificateDate(item.issuedAt!)}</p></div>
                <button type="button" onClick={() => download(item)} aria-label={`Baixar certificado ${item.title}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink-500 hover:bg-brand-blue-500/10 hover:text-brand-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><Download className="h-4 w-4" aria-hidden="true" /></button>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${cardClass} flex flex-col gap-4`}>
          <SectionHeading title="Preferências" />
          <div className="flex flex-1 flex-col divide-y divide-ink-100">
            {[
              { label: 'Área de interesse', value: profile.learningFocus, icon: Target },
              { label: 'Nível de experiência', value: profile.experienceLevel, icon: GraduationCap },
              { label: 'Notificações', value: profile.notificationsEnabled ? 'Ativadas' : 'Desativadas', icon: Bell },
            ].map(({ label, value, icon: Icon }) => (
              <Link key={label} to="/configuracoes" className="flex min-w-0 items-center gap-2 py-3 text-left hover:text-brand-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"><Icon className="h-4 w-4 shrink-0 text-brand-blue-400" aria-hidden="true" /><span className="flex-1 text-xs font-semibold text-ink-700">{label}</span><span className="max-w-[42%] truncate text-right text-[11px] text-ink-500" title={value}>{value}</span><ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-500" aria-hidden="true" /></Link>
            ))}
          </div>
        </section>

        <section className={`${cardClass} flex flex-col gap-4`}>
          <SectionHeading title="Atividade recente" to="/avaliacoes" action="Ver avaliações" />
          <ul className="flex flex-1 flex-col divide-y divide-ink-100">
            {assessments.filter((item) => item.status === 'completed').sort((a, b) => (b.attempts.at(-1)?.completedAt ?? '').localeCompare(a.attempts.at(-1)?.completedAt ?? '')).slice(0, 3).map((item) => (
              <li key={item.id} className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0"><IllustratedIcon icon={CheckCheck} tone="blue" size="compact" /><div className="min-w-0 flex-1"><p className="text-xs font-bold text-ink-900">Concluiu {item.title}</p><p className="mt-0.5 text-[11px] text-ink-500">{item.course}</p></div><span className="shrink-0 text-[10px] text-ink-500">{formatCertificateDate(item.attempts.at(-1)!.completedAt)}</span></li>
            ))}
          </ul>
        </section>
      </div>
      <p className="text-center text-[11px] text-ink-500">Dados demonstrativos. Suas alterações neste perfil ficam salvas neste navegador.</p>
      <p role="status" className="sr-only">{announcement}</p>
    </div>
  )
}
