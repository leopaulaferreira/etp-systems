import { LayoutDashboard } from 'lucide-react'
import PageHero from '../../../components/ui/PageHero'
import { useProfile } from '../../../profile/ProfileContext'
import WelcomeIllustration from './WelcomeIllustration'

export default function WelcomeSection() {
  const { profile } = useProfile()

  return (
    <PageHero
      featured
      eyebrow="Seu painel de aprendizado"
      icon={LayoutDashboard}
      title={<>Olá, {profile.name}</>}
      description="Continue aprendendo e acompanhe sua evolução."
      artwork={<WelcomeIllustration />}
    />
  )
}
