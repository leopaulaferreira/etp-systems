import test from 'node:test'
import assert from 'node:assert/strict'
import { profileTimeline } from '../src/pages/Perfil/profileTimeline.ts'
const date = '2026-10-20T12:00:00Z'
const course = { id: 'c1', title: 'Curso', enrolledAt: '2026-09-30T12:00:00Z', completedAtIso: date }
const assessment = { id: 'a1', courseId: 'c1', course: 'Curso', attempts: [{ completedAt: date, score: 100, passed: true }] }
const certificate = { id: 'cert1', status: 'completed', title: 'Curso', issuedAt: date, hours: 3 }
test('combina fontes em ordem cronológica e desempata conquistas sem alterar os dados', () => {
  const data = [[course], [assessment], [certificate]]
  const original = structuredClone(data)
  const result = profileTimeline(...data)
  assert.deepEqual(result.map(event => event.kind), ['certificate', 'assessment', 'completion', 'enrollment'])
  assert.equal(result[1].to, '/avaliacoes?curso=c1')
  assert.deepEqual(data, original)
})
test('preserva todas as tentativas com notas reais e ids distintos', () => {
  const result = profileTimeline([], [{ ...assessment, attempts: [{ completedAt: '2026-10-19T12:00:00Z', score: 40, passed: false }, ...assessment.attempts] }], [])
  assert.equal(new Set(result.map(item => item.id)).size, 2)
  assert.match(result[0].detail, /Tentativa 2 · Nota 100% · Aprovado/)
  assert.match(result[1].detail, /Nota mínima não atingida/)
})
test('não inventa datas, notas, conclusões ou certificados ainda não emitidos', () => {
  assert.deepEqual(profileTimeline([{ id: 'c', progress: 100, completedAt: '20/10/2026' }], [], [{ status: 'in_progress' }]), [])
  assert.deepEqual(profileTimeline([{ ...course, enrolledAt: 'inválida', completedAtIso: undefined }], [], []), [])
  const result = profileTimeline([], [{ ...assessment, attempts: [{ completedAt: date }] }], [])
  assert.equal(result[0].detail, 'Tentativa 1')
})
