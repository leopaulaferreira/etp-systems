import LearningIcon from '../../../components/ui/LearningIcon'
import type { CourseIcon } from '../courseTypes'

export default function CourseArtwork({ icon, featured = false }: { icon: CourseIcon; featured?: boolean }) {
  return featured
    ? <div className="relative flex min-h-[200px] items-center justify-center p-5"><LearningIcon kind={icon} size="featured" /></div>
    : <LearningIcon kind={icon} />
}
