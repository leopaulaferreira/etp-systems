import test from 'node:test'
import assert from 'node:assert/strict'
import { employees, company } from '../src/mocks/company.mock.ts'
import { companyEmployees, companySummary, employeeProgress, employeeStatus, filterEmployees, averageScore, recentCompletions } from '../src/pages/Empresa/company.ts'

test('indicadores correspondem às inscrições e notas dos colaboradores', () => {
  const summary = companySummary(employees)
  assert.equal(summary.total, 8)
  assert.equal(summary.learning, 5)
  assert.equal(summary.completed, 5)
  assert.equal(summary.certificates, 5)
  assert.equal(summary.courses, 16)
  assert.equal(summary.assessments, 7)
  assert.equal(summary.average, 82)
  assert.deepEqual(summary.distribution.map((item) => item.count), [5, 7, 4])
})

test('somente registros da empresa da sessão entram na seleção', () => {
  const others = [...employees, { ...employees[0], id: 'externo', companyId: 'outra-empresa' }]
  assert.deepEqual(companyEmployees(others, company.id), employees)
  assert.deepEqual(companyEmployees(others, null), [])
  assert.equal(companySummary(companyEmployees(others, company.id)).total, 8)
})

test('sem avaliações não significa nota zero e zero real participa da média', () => {
  assert.equal(averageScore([{ score: null }]), null)
  assert.equal(averageScore([{ score: 0 }, { score: 100 }, { score: null }]), 50)
  assert.equal(employeeProgress({ courses: [] }), 0)
  assert.equal(employeeStatus({ courses: [] }), 'not_started')
  assert.equal(companySummary([]).average, null)
  assert.equal(companySummary([]).courses, 0)
})

test('busca ignora acentos e combina situação e área', () => {
  assert.deepEqual(filterEmployees(employees, '  JOAO  ', 'in_progress', 'Tecnologia').map((e) => e.id), ['joao'])
  assert.deepEqual(filterEmployees(employees, 'carla.mendes@', 'completed', '').map((e) => e.id), ['carla'])
  assert.deepEqual(filterEmployees(employees, 'Carla', 'not_started', ''), [])
  assert.deepEqual(filterEmployees(employees, '', 'all', ''), employees)
})

test('conclusões recentes são ordenadas e têm certificado associado ao colaborador', () => {
  const original = structuredClone(employees)
  const recent = recentCompletions(employees)
  assert.deepEqual(recent.map(({ employee }) => employee.id), ['carla', 'ana', 'gabriel'])
  assert.ok(recent.every(({ course }) => course.progress === 100 && course.certificateCode))
  assert.deepEqual(employees, original)
})
