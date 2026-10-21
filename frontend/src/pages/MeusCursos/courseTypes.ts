import type { CourseIcon } from '../Cursos/courseTypes'

export type CourseThumbnailKey = CourseIcon | 'data' | 'cybersecurity' | 'lgpd'

export type CourseItem = {
  id: string
  title: string
  description?: string
  type: 'CURSO' | 'TRILHA'
  thumbnail: CourseThumbnailKey
  lessonCount?: number
  progress?: number
  lastLesson?: string
  duration?: string
  completedAt?: string
  updatedAt?: string
}

