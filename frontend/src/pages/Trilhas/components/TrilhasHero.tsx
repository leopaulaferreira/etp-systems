import { BookOpenCheck } from 'lucide-react'
import PageHero from '../../../components/ui/PageHero'

export default function TrilhasHero() {
  return (
    <PageHero
      compact
      eyebrow="Jornadas de aprendizado"
      icon={BookOpenCheck}
      title="Explorar Trilhas"
      description="Explore trilhas para evoluir."
    />
  )
}
