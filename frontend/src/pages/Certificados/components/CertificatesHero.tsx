import { Award, BadgeCheck, Sparkles } from 'lucide-react'
import PageHero from '../../../components/ui/PageHero'

function CertificateArtwork() {
  return (
    <div className="relative h-[150px] w-[190px] shrink-0">
      <span className="absolute inset-x-2 inset-y-0 rounded-full border border-brand-blue-400/15 bg-brand-blue-500/5" />
      <div className="absolute inset-x-4 inset-y-3 -rotate-8 rounded-xl border border-brand-blue-400/35 bg-gradient-to-br from-navy-700 to-navy-900 p-5 shadow-card">
        <span className="block h-1.5 w-14 rounded bg-brand-blue-400/50" />
        <span className="mt-3 block h-1 w-20 rounded bg-brand-blue-400/20" />
        <span className="mt-2 block h-1 w-14 rounded bg-brand-blue-400/20" />
        <Award className="absolute bottom-2 right-3 h-12 w-12 text-brand-cyan-400" strokeWidth={1.3} />
      </div>
      <Sparkles className="absolute right-0 top-0 h-6 w-6 text-brand-cyan-400" strokeWidth={1.5} />
    </div>
  )
}

export default function CertificatesHero() {
  return (
    <PageHero
      eyebrow="Seu aprendizado reconhecido"
      icon={BadgeCheck}
      title="Meus Certificados"
      description="Confira suas conquistas e continue evoluindo na sua jornada."
      artwork={<CertificateArtwork />}
    />
  )
}
