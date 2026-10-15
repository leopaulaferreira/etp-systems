import test from 'node:test'
import assert from 'node:assert/strict'
import { completeLesson, fetchLessonProgress, parseLessonProgress } from '../src/pages/Cursos/lessonProgressApi.ts'

const course = '11111111-1111-4111-8111-111111111111'
const lesson = '22222222-2222-4222-8222-222222222222'
const progress = { completedLessonIds: [lesson], totalLessons: 3, progress: 33.33 }

test('valida registros de conclusão e rejeita duplicatas e totais impossíveis', () => {
  assert.deepEqual(parseLessonProgress(progress), progress)
  for (const invalid of [
    { ...progress, completedLessonIds: [lesson, lesson] },
    { ...progress, totalLessons: 0 },
    { ...progress, totalLessons: -1 },
    { ...progress, progress: NaN },
    { ...progress, completedLessonIds: ['inválido'] },
  ]) assert.throws(() => parseLessonProgress(invalid), /inválido/)
})

test('consulta e conclui a aula por PUT sem enviar percentual ou usuário', async () => {
  const originalFetch = globalThis.fetch
  const requests = []
  globalThis.fetch = async (path, options) => {
    requests.push({ path, method: options.method, body: options.body })
    return { ok: true, json: async () => progress }
  }
  try {
    assert.deepEqual(await fetchLessonProgress(course), progress)
    assert.deepEqual(await completeLesson(course, lesson), progress)
    assert.equal(requests[0].path, `/api/colaborador/meus-cursos/${course}/aulas/progresso`)
    assert.equal(requests[1].path, `/api/colaborador/meus-cursos/${course}/aulas/${lesson}/conclusao`)
    assert.equal(requests[1].method, 'PUT')
    assert.equal(requests[1].body, undefined)
    await assert.rejects(completeLesson(course, 'outro'), /inválida/)
    assert.equal(requests.length, 2)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('falha de rede não é convertida em aula concluída', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => { throw new Error('Sem conexão') }
  try {
    await assert.rejects(completeLesson(course, lesson), /Falha ao consultar a API/)
  } finally {
    globalThis.fetch = originalFetch
  }
})
