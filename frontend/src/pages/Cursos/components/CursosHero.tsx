import { BookOpen } from 'lucide-react'
import LearningHeroArtwork from '../../../components/ui/LearningHeroArtwork'
import PageHero from '../../../components/ui/PageHero'

export default function CursosHero() {
  return (
    <PageHero
      eyebrow="Aprenda no seu ritmo"
      icon={BookOpen}
      title="Explorar Cursos"
      description="Descubra cursos para desenvolver habilidades práticas."
      artwork={<LearningHeroArtwork variant="courses" />}
    />
  )
}
