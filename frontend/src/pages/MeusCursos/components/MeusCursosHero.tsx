import { GraduationCap } from 'lucide-react'
import PageHero from '../../../components/ui/PageHero'
import learningIllustration from '../../../assets/illustrations/dashboard-hero-learning-dark.webp'

export default function MeusCursosHero() {
  return (
    <PageHero
      eyebrow="Seu espaço de aprendizado"
      icon={GraduationCap}
      title="Meus Cursos"
      description="Retome seus estudos e acompanhe seu progresso."
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
