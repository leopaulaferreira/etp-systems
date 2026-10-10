export type CourseThumbnailKey =
  'security' | 'cloud' | 'data' | 'cybersecurity' | 'ai' | 'lgpd' | 'projects'

export type CourseItem = {
  id: string
  title: string
  description?: string
  type: 'CURSO' | 'TRILHA'
  thumbnail: CourseThumbnailKey
  progress?: number
  lastLesson?: string
  duration?: string
  completedAt?: string
  updatedAt?: string
}

