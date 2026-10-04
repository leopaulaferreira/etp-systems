import { BookOpenCheck, Route } from 'lucide-react'
import PageHero from '../../../components/ui/PageHero'

export default function TrilhasHero() {
  return (
    <PageHero
      eyebrow="Jornadas de aprendizado"
      icon={BookOpenCheck}
      artworkIcon={Route}
      title="Explorar Trilhas"
      description="Explore trilhas para evoluir."
    />
  )
}
