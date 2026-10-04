import { ClipboardCheck } from 'lucide-react'
import PageHero from '../../../components/ui/PageHero'


export default function AssessmentHero() {
  return (
    <PageHero
      eyebrow="Cada etapa, uma conquista"
      icon={ClipboardCheck}
      title="Minhas Avaliações"
      description="Teste seus conhecimentos e acompanhe seus resultados."
    />
  )
}
