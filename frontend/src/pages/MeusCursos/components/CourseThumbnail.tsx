import LearningIcon from '../../../components/ui/LearningIcon'
import type { CourseThumbnailKey } from '../courseTypes'

type CourseThumbnailProps = { thumbnail: CourseThumbnailKey; size?: 'small' | 'medium' | 'large' }

export default function CourseThumbnail({ thumbnail, size = 'medium' }: CourseThumbnailProps) {
  return <LearningIcon kind={thumbnail} size={size} />
}
