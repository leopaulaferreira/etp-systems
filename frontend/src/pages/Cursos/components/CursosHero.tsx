import { BookOpen } from 'lucide-react'
import PageHero from '../../../components/ui/PageHero'
import learningIllustration from '../../../assets/illustrations/dashboard-hero-learning-dark.webp'

export default function CursosHero() {
  return (
    <PageHero
      eyebrow="Aprenda no seu ritmo"
      icon={BookOpen}
      title="Explorar Cursos"
      description="Descubra cursos para desenvolver habilidades práticas."
      artwork={
        <img
          src={learningIllustration}
          alt=""
          className="max-h-[160px] w-full object-contain object-right drop-shadow-[0_14px_18px_rgba(37,99,235,0.12)]"
        />
      }
    />
  )
}
