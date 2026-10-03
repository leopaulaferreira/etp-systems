import { BookOpenCheck } from 'lucide-react'
import PageHero from '../../../components/ui/PageHero'
import trilhasHeroLearning from '../../../assets/illustrations/trilhas-hero-learning-dark.webp'

export default function TrilhasHero() {
  return (
    <PageHero
      eyebrow="Jornadas de aprendizado"
      icon={BookOpenCheck}
      title="Explorar Trilhas"
      description="Encontre jornadas para desenvolver novas habilidades."
      artwork={
        <img
          src={trilhasHeroLearning}
          alt=""
          className="max-h-[160px] w-full object-contain object-right drop-shadow-[0_14px_18px_rgba(37,99,235,0.12)]"
        />
      }
    />
  )
}
