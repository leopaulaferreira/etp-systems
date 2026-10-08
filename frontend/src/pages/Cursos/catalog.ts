import type { CatalogCourse, CourseLevel } from '../../mocks/cursos.mock'

export type CourseOrder = 'relevance' | 'title' | 'duration' | 'popular'
export type CatalogFilters = {
  query: string
  category: string
  level: CourseLevel | 'Todos'
  order: CourseOrder
}

export const initialFilters: CatalogFilters = {
  query: '',
  category: 'Todas',
  level: 'Todos',
  order: 'relevance',
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
}

export function selectCourses(courses: CatalogCourse[], filters: CatalogFilters): CatalogCourse[] {
  const query = normalize(filters.query)
  const result = courses.filter(
    (course) =>
      (filters.category === 'Todas' || course.category === filters.category) &&
      (filters.level === 'Todos' || course.level === filters.level) &&
      normalize(`${course.title} ${course.description} ${course.category}`).includes(query),
  )
  if (filters.order === 'title') result.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
  if (filters.order === 'duration') result.sort((a, b) => a.durationHours - b.durationHours)
  if (filters.order === 'popular') result.sort((a, b) => (b.students ?? 0) - (a.students ?? 0))
  return result
}

export function formatDuration(hours: number) {
  const minutes = Math.round(hours * 60)
  const remainder = minutes % 60
  return `${Math.floor(minutes / 60)}h${remainder ? ` ${remainder}min` : ''}`
}

export function formatStudents(students: number) {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(
    students,
  )
}
