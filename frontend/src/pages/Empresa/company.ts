export type EmployeeCourse = {
  id: string
  title: string
  track: string
  progress: number
  updatedAt: string | null
  completedAt: string | null
  score: number | null
  certificateCode: string | null
}
export type Employee = {
  id: string
  companyId: string
  name: string
  email: string
  department: string
  courses: EmployeeCourse[]
}
export type EmployeeStatus = 'not_started' | 'in_progress' | 'completed'
export const statusLabels: Record<EmployeeStatus, string> = {
  not_started: 'Não iniciou', in_progress: 'Em aprendizagem', completed: 'Concluiu os cursos',
}
export function employeeStatus(employee: Employee): EmployeeStatus {
  if (!employee.courses.some((course) => course.progress > 0)) return 'not_started'
  return employee.courses.every((course) => course.progress === 100) ? 'completed' : 'in_progress'
}
export function averageScore(courses: EmployeeCourse[]) {
  const scores = courses.flatMap((course) => course.score === null ? [] : [course.score])
  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null
}
export function employeeProgress(employee: Employee) {
  return employee.courses.length ? Math.round(employee.courses.reduce((sum, course) => sum + course.progress, 0) / employee.courses.length) : 0
}
export function companyEmployees(employees: Employee[], companyId: string | null) {
  return employees.filter((employee) => employee.companyId === companyId)
}
export function filterEmployees(employees: Employee[], query: string, status: EmployeeStatus | 'all', department: string) {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim()
  return employees.filter((employee) =>
    normalize(`${employee.name} ${employee.email}`).includes(normalize(query)) &&
    (status === 'all' || employeeStatus(employee) === status) &&
    (!department || employee.department === department),
  )
}
export function companySummary(employees: Employee[]) {
  const courses = employees.flatMap((employee) => employee.courses)
  return {
    total: employees.length,
    learning: employees.filter((employee) => employeeStatus(employee) === 'in_progress').length,
    completed: courses.filter((course) => course.progress === 100).length,
    average: averageScore(courses),
    assessments: courses.filter((course) => course.score !== null).length,
    certificates: courses.filter((course) => course.certificateCode !== null).length,
    courses: courses.length,
    distribution: [
      { label: 'Concluídas', count: courses.filter((course) => course.progress === 100).length, color: 'bg-brand-cyan-400' },
      { label: 'Em andamento', count: courses.filter((course) => course.progress > 0 && course.progress < 100).length, color: 'bg-brand-blue-500' },
      { label: 'Não iniciadas', count: courses.filter((course) => course.progress === 0).length, color: 'bg-ink-400' },
    ],
  }
}
export function recentCompletions(employees: Employee[]) {
  return employees.flatMap((employee) => employee.courses
    .filter((course) => course.completedAt !== null)
    .map((course) => ({ employee, course })))
    .sort((a, b) => b.course.completedAt!.localeCompare(a.course.completedAt!))
    .slice(0, 3)
}
export function formatCompanyDate(date: string | null) {
  return date ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(date)) : 'Sem atividade'
}
