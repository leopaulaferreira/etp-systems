import { BadgeCheck, FileBadge } from 'lucide-react'
import PageHero from '../../../components/ui/PageHero'


export default function CertificatesHero() {
  return (
    <PageHero
      eyebrow="Seu aprendizado reconhecido"
      icon={BadgeCheck}
      artworkIcon={FileBadge}
      title="Meus Certificados"
      description="Confira suas conquistas e continue evoluindo na sua jornada."
    />
  )
}
