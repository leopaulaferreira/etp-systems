import test from 'node:test'
import assert from 'node:assert/strict'
import { parseCompanyOverview } from '../src/pages/Empresa/companyApi.ts'
import { companySummary, employeeProgress, employeeStatus, filterEmployees, averageScore, recentCompletions } from '../src/pages/Empresa/company.ts'

const companyId = '11111111-1111-4111-8111-111111111111'
const otherId = '22222222-2222-4222-8222-222222222222'
const courseId = '33333333-3333-4333-8333-333333333333'
const course = (id, title, progress, score, completedAt = null, certificateCode = null) => ({
  id, title, category: 'Segurança', progress, updatedAt: progress ? '2026-10-03T12:00:00Z' : null,
  completedAt, score, certificateCode, certificateIssuedAt: certificateCode ? '2026-10-04T12:00:00Z' : null,
})
const payload = {
  companyId, companyName: 'Empresa de teste', employees: [
    { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', companyId, name: 'Ana Souza',
      email: 'ana@example.test', department: 'Tecnologia', courses: [
        course(courseId, 'Segurança', 100, 80, '2026-10-02T12:00:00Z', 'ETP-ANA'),
        course('44444444-4444-4444-8444-444444444444', 'LGPD', 65, null),
      ] },
    { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', companyId, name: 'Bruno Lima',
      email: 'bruno@example.test', department: null, courses: [
        course('55555555-5555-4555-8555-555555555555', 'Python', 0, null),
        course('66666666-6666-4666-8666-666666666666', 'Comunicação', 0, null),
      ] },
    { id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', companyId, name: 'João Silva',
      email: 'joao@example.test', department: 'Financeiro', courses: [
        course('77777777-7777-4777-8777-777777777777', 'LGPD', 100, 100, '2026-10-03T12:00:00Z'),
      ] },
  ],
}

const employees = parseCompanyOverview(payload).employees

test('interpreta colaboradores e indicadores a partir da resposta da API', () => {
  const summary = companySummary(employees)
  assert.equal(summary.total, 3)
  assert.equal(summary.learning, 1)
  assert.equal(summary.completed, 2)
  assert.equal(summary.certificates, 1)
  assert.equal(summary.courses, 5)
  assert.equal(summary.assessments, 2)
  assert.equal(summary.average, 90)
  assert.deepEqual(summary.distribution.map((item) => item.count), [2, 1, 2])
})

test('rejeita dados de outra empresa e resultados incompletos', () => {
  assert.throws(() => parseCompanyOverview({ ...payload, employees: [
    { ...payload.employees[0], companyId: otherId },
  ] }), /Colaborador inválido/)
  assert.throws(() => parseCompanyOverview({ ...payload, employees: [
    { ...payload.employees[0], courses: [{ ...payload.employees[0].courses[0], score: 120 }] },
  ] }), /curso da empresa inválidos/)
  assert.deepEqual(parseCompanyOverview({ companyId, companyName: 'Empresa vazia', employees: [] }).employees, [])
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
  assert.deepEqual(filterEmployees(employees, '  JOAO  ', 'completed', 'Financeiro').map((e) => e.name), ['João Silva'])
  assert.deepEqual(filterEmployees(employees, 'ana@', 'in_progress', '').map((e) => e.name), ['Ana Souza'])
  assert.deepEqual(filterEmployees(employees, 'Ana', 'not_started', ''), [])
  assert.deepEqual(filterEmployees(employees, '', 'all', ''), employees)
})

test('conclusões recentes usam progresso registrado, mesmo sem certificado', () => {
  const original = structuredClone(employees)
  const recent = recentCompletions(employees)
  assert.deepEqual(recent.map(({ employee }) => employee.name), ['João Silva', 'Ana Souza'])
  assert.equal(recent[0].course.certificateCode, null)
  assert.deepEqual(employees, original)
})

test('RH reutiliza o certificado emitido, com a mesma prévia e PDF do colaborador', async () => {
  const { parseCertificate } = await import('../src/pages/Certificados/certificatesApi.ts')
  const { certificateSvg } = await import('../src/pages/Certificados/certificateArtwork.ts')
  const { createCertificatePdf } = await import('../src/pages/Certificados/certificatePdf.ts')
  const issued = { id: otherId, courseId, holderName: 'Ana Souza', title: 'Segurança', description: 'Curso concluído',
    durationHours: 3.5, code: 'ETP-ANA', issuedAt: '2026-10-04T12:00:00Z' }
  const data = structuredClone(payload)
  data.employees[0].courses[0].certificate = issued
  const companyCertificate = parseCompanyOverview(data).employees[0].courses[0].certificate
  const employeeCertificate = parseCertificate(issued)
  assert.deepEqual(companyCertificate, employeeCertificate)
  assert.equal(certificateSvg(companyCertificate, 'RH ETP'), certificateSvg(employeeCertificate, 'Ana Souza'))
  assert.equal(await createCertificatePdf(companyCertificate, 'RH ETP').text(), await createCertificatePdf(employeeCertificate, 'Ana Souza').text())
  for (const patch of [{ courseId: otherId }, { code: 'DIVERGENTE' }, { issuedAt: '2026-01-01T12:00:00Z' }, { durationHours: undefined }, { holderName: '' }]) {
    data.employees[0].courses[0].certificate = { ...issued, ...patch }
    assert.throws(() => parseCompanyOverview(data))
  }
  delete data.employees[0].courses[0].certificate
  assert.equal(parseCompanyOverview(data).employees[0].courses[0].certificate, null)
})
