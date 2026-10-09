import test from 'node:test'
import assert from 'node:assert/strict'
import { parseDashboard } from '../src/pages/Dashboard/dashboardApi.ts'

const courseId = '11111111-1111-4111-8111-111111111111'
const payload = {
  enrolledCourses: 2, ongoingCourses: 1, completedCourses: 1,
  availableAssessments: 1, passedAssessments: 1, certificates: 1, certifiedHours: 3,
  continueCourse: { id: courseId, title: 'LGPD na Prática', description: null,
    icon: 'security', progress: 50, lastActivity: '2026-10-09T12:00:00Z' },
  recommendations: [{ id: '22222222-2222-4222-8222-222222222222', title: 'Cloud Computing',
    category: 'Tecnologia', level: 'Iniciante', durationHours: 5, icon: 'cloud' }],
  recentAssessments: [{ courseId, course: 'LGPD na Prática', score: 80,
    passed: true, completedAt: '2026-10-09T12:00:00Z' }],
  recentCertificates: [{ id: '33333333-3333-4333-8333-333333333333',
    title: 'LGPD na Prática', issuedAt: '2026-10-09T12:00:00Z' }],
}

test('aceita painel real e conta sem atividade', () => {
  assert.equal(parseDashboard(payload).continueCourse?.progress, 50)
  const empty = parseDashboard({ ...payload, enrolledCourses: 0, ongoingCourses: 0,
    completedCourses: 0, availableAssessments: 0, passedAssessments: 0,
    certificates: 0, certifiedHours: 0, continueCourse: null,
    recentAssessments: [], recentCertificates: [] })
  assert.equal(empty.continueCourse, null)
  assert.deepEqual(empty.recentCertificates, [])
})

test('rejeita totais incoerentes e itens incompletos', () => {
  assert.throws(() => parseDashboard({ ...payload, enrolledCourses: 3 }), /incompletos/)
  assert.throws(() => parseDashboard({ ...payload, recommendations: [{ ...payload.recommendations[0], id: 'invalido' }] }), /Recomendação inválida/)
  assert.throws(() => parseDashboard({ ...payload, continueCourse: { ...payload.continueCourse, progress: 120 } }), /Curso para continuar inválido/)
})
