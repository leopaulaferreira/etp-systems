import test from 'node:test'
import assert from 'node:assert/strict'
import { buildReport, reportCsv } from '../src/pages/Relatorios/reportData.ts'

const courses = [
  { id: 'a', title: 'LGPD', type: 'CURSO', thumbnail: 'security', progress: 100, completedAt: '10/03/2026' },
  { id: 'b', title: 'Nuvem', type: 'CURSO', thumbnail: 'cloud', progress: 50 },
  { id: 'c', title: 'Dados', type: 'CURSO', thumbnail: 'data', progress: 0 },
]
const certificates = [
  { id: 'one', status: 'completed', issuedAt: '2026-03-11T10:00:00Z', hours: 3 },
  { id: 'two', status: 'completed', issuedAt: '2025-08-11T10:00:00Z', hours: 4 },
]
const trails = [{ id: 'track', enrolled: true, progress: 100 }]
const assessments = [{ id: 'assessment', course: 'LGPD', attempts: [
  { completedAt: '2026-10-09T19:57:14Z', score: 60, passed: false },
] }]

test('relatório usa apenas atividade real do colaborador e aplica período', () => {
  const year = buildReport(courses, certificates, trails, assessments, 'year', 2026)
  assert.equal(year.enrolled, 3)
  assert.equal(year.completed, 1)
  assert.equal(year.ongoing, 1)
  assert.equal(year.notStarted, 1)
  assert.equal(year.certificates, 1)
  assert.equal(year.certifiedHours, 3)
  assert.equal(year.completedTrails, 1)
  assert.equal(year.attempts, 1)
  assert.equal(year.recentAttempts[0].score, 60)
  assert.equal(year.months[9].assessments, 1)
  assert.equal(year.months[2].courses, 1)
  assert.equal(year.months[2].certificates, 1)
  assert.equal(buildReport(courses, certificates, trails, assessments, 'all', 2026).certificates, 2)
  assert.match(reportCsv(year, 2026), /LGPD|Cursos concluídos/)
})

test('inscrições e tentativas aparecem mesmo sem cursos concluídos ou certificados', () => {
  const data = buildReport(courses.map((course) => ({ ...course, progress: 0, completedAt: undefined })), [], [], assessments, 'all', 2026)
  assert.equal(data.enrolled, 3)
  assert.equal(data.completed, 0)
  assert.equal(data.certificates, 0)
  assert.equal(data.attempts, 1)
  assert.equal(data.courses.length, 3)
})
