export const courseLevels = ['Iniciante', 'Intermediário', 'Avançado'] as const
export type CourseLevel = (typeof courseLevels)[number]
export const courseIcons = [
  'cloud', 'python', 'communication', 'ai', 'security', 'governance',
  'workspace', 'analytics', 'code', 'leadership', 'projects',
] as const
export type CourseIcon = (typeof courseIcons)[number]

export type CatalogCourse = {
  id: string
  title: string
  description: string
  category: string
  level: CourseLevel
  durationHours: number
  students?: number
  icon: CourseIcon
  featured?: boolean
}
