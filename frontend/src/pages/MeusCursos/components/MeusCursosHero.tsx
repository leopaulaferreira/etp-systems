import { GraduationCap } from 'lucide-react'
import LearningHeroArtwork from '../../../components/ui/LearningHeroArtwork'
import PageHero from '../../../components/ui/PageHero'

export default function MeusCursosHero() {
  return (
    <PageHero
      eyebrow="Seu espaço de aprendizado"
      icon={GraduationCap}
      title="Meus Cursos"
      description="Retome seus estudos e acompanhe seu progresso."
      artwork={<LearningHeroArtwork variant="myCourses" />}
    />
  )
}
