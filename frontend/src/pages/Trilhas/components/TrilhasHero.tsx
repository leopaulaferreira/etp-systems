import { BookOpenCheck } from 'lucide-react'
import LearningHeroArtwork from '../../../components/ui/LearningHeroArtwork'
import PageHero from '../../../components/ui/PageHero'

export default function TrilhasHero() {
  return (
    <PageHero
      eyebrow="Jornadas de aprendizado"
      icon={BookOpenCheck}
      title="Explorar Trilhas"
      description="Encontre jornadas para desenvolver novas habilidades."
      artwork={<LearningHeroArtwork variant="paths" />}
    />
  )
}
