import { authSession } from '../../auth/session.ts'
import type { Employee, EmployeeCourse } from './company.ts'

export type CompanyOverview = { companyId: string; companyName: string; employees: Employee[] }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const date = (value: unknown) => value === null || (typeof value === 'string' && !Number.isNaN(Date.parse(value)))

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Dados da empresa inválidos')
  return value as Record<string, unknown>
}

function parseCourse(value: unknown): EmployeeCourse {
  const course = object(value)
  if (typeof course.id !== 'string' || !uuid.test(course.id) ||
      typeof course.title !== 'string' || !course.title.trim() ||
      typeof course.category !== 'string' || !course.category.trim() ||
      typeof course.progress !== 'number' || !Number.isFinite(course.progress) ||
      course.progress < 0 || course.progress > 100 ||
      !date(course.updatedAt) || !date(course.completedAt) || !date(course.certificateIssuedAt) ||
      (course.score !== null && (typeof course.score !== 'number' || !Number.isInteger(course.score) || course.score < 0 || course.score > 100)) ||
      (course.certificateCode !== null && (typeof course.certificateCode !== 'string' || !course.certificateCode.trim()))) {
    throw new Error('Dados de curso da empresa inválidos')
  }
  return course as EmployeeCourse
}

export function parseCompanyOverview(value: unknown): CompanyOverview {
  const overview = object(value)
  if (typeof overview.companyId !== 'string' || !uuid.test(overview.companyId) ||
      typeof overview.companyName !== 'string' || !overview.companyName.trim() ||
      !Array.isArray(overview.employees)) throw new Error('Painel da empresa incompleto')
  const employees = overview.employees.map((value) => {
    const employee = object(value)
    if (typeof employee.id !== 'string' || !uuid.test(employee.id) ||
        employee.companyId !== overview.companyId ||
        typeof employee.name !== 'string' || !employee.name.trim() ||
        typeof employee.email !== 'string' || !employee.email.trim() ||
        (employee.department !== null && typeof employee.department !== 'string') ||
        !Array.isArray(employee.courses)) throw new Error('Colaborador inválido')
    return { ...employee, courses: employee.courses.map(parseCourse) } as Employee
  })
  return { companyId: overview.companyId, companyName: overview.companyName, employees }
}

export async function fetchCompanyOverview(companyId: string, signal?: AbortSignal): Promise<CompanyOverview> {
  const result = parseCompanyOverview(await authSession.request('/api/empresa/painel', signal))
  if (result.companyId !== companyId) throw new Error('Empresa da sessão divergente')
  return result
}
