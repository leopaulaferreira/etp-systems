import test from 'node:test'
import assert from 'node:assert/strict'
import { savedLesson, rememberLesson, resumeLessonIndex } from '../src/pages/Cursos/lessonResume.ts'
import { hasUnsavedAnswers } from '../src/assessments/unsavedAnswers.ts'
import { parseAttemptRelease, grantAttempt } from '../src/pages/Empresa/attemptReleaseApi.ts'

test('retomada respeita conta, curso e link explícito', () => {
  const data = new Map()
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
  rememberLesson('aluno1', 'curso1', 'aula2', storage)
  assert.equal(savedLesson('aluno1', 'curso1', storage), 'aula2')
  assert.equal(savedLesson('aluno2', 'curso1', storage), null)
  assert.equal(savedLesson('aluno1', 'curso2', storage), null)
  assert.equal(resumeLessonIndex(null, ['aula1', 'aula2', 'aula3'], 'aula2'), 1)
  assert.equal(resumeLessonIndex('3', ['aula1', 'aula2', 'aula3'], 'aula2'), 2)
  assert.equal(resumeLessonIndex(null, ['aula1'], 'removida'), 0)
  assert.equal(resumeLessonIndex('100', ['aula1', 'aula2'], null), 1)
})

test('armazenamento bloqueado não impede o estudo', () => {
  const blocked = { getItem() { throw new Error('Blocked') }, setItem() { throw new Error('Quota') } }
  assert.equal(savedLesson('u', 'c', blocked), null)
  assert.doesNotThrow(() => rememberLesson('u', 'c', 'a', blocked))
})

test('aviso existe somente para respostas em edição, nunca para notas enviadas', () => {
  assert.equal(hasUnsavedAnswers([{ status: 'in_progress', answers: {} }]), false)
  assert.equal(hasUnsavedAnswers([{ status: 'in_progress', answers: { q: 0 } }]), true)
  assert.equal(hasUnsavedAnswers([{ status: 'completed', answers: { q: 0 } }]), false)
})

test('liberação exige motivo e valida o histórico recebido', async () => {
  const valid = { usedAttempts: 2, maxAttempts: 3, remainingAttempts: 1, passed: false, canGrant: false, grants: [] }
  assert.deepEqual(parseAttemptRelease(valid), valid)
  assert.throws(() => parseAttemptRelease({ ...valid, maxAttempts: -1 }), /inválidas/)
  assert.throws(() => parseAttemptRelease({ ...valid, grants: [{}] }), /inválido/)
  await assert.rejects(grantAttempt('qualquer', 'qualquer', '  '), /motivo/)
  await assert.rejects(grantAttempt('qualquer', 'qualquer', 'x'.repeat(501)), /motivo/)
})
