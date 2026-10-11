import test from 'node:test'
import assert from 'node:assert/strict'
import { enrollCourse, fetchMyCourses, parseMyCourse, updateCourseProgress } from '../src/pages/MeusCursos/myCoursesApi.ts'

const course = {
  id: '7154c4de-cacd-44fd-9381-a20ad67ba541',
  title: 'Curso de teste', description: 'Conteúdo', icon: 'cloud',
  durationHours: 6.5, enrolledAt: '2026-10-09T12:00:00Z',
  progress: 0, updatedAt: null, completedAt: null,
}

test('converte a inscrição real e valida o progresso', () => {
  assert.deepEqual(parseMyCourse(course), {
    id: course.id, title: course.title, description: course.description,
    type: 'CURSO', thumbnail: 'cloud', duration: '6h 30m', progress: 0,
    updatedAt: undefined, completedAt: undefined,
  })
  assert.throws(() => parseMyCourse({ ...course, id: 'curso-local' }), /incompletos/)
  assert.throws(() => parseMyCourse({ ...course, progress: 105 }), /incompletos/)
  assert.deepEqual(parseMyCourse({ ...course, progress: 100,
    updatedAt: '2026-10-09T12:00:00Z', completedAt: '2026-10-09T12:00:00Z',
  }).completedAt, '09/10/2026')
})

test('inscrições preservam o tema do catálogo em vez de trocar programação e liderança por outros ícones', () => {
  for (const icon of ['python', 'code', 'leadership', 'communication', 'governance', 'workspace', 'analytics']) {
    assert.equal(parseMyCourse({ ...course, icon }).thumbnail, icon)
  }
  assert.equal(parseMyCourse({ ...course, icon: 'desconhecido' }).thumbnail, 'data')
  assert.equal(parseMyCourse({ ...course, icon: '__proto__' }).thumbnail, 'data')
})

test('lista e inscreve pela API usando POST idempotente', async () => {
  const previous = globalThis.fetch
  const requests = []
  globalThis.fetch = async (path, options) => {
    requests.push({ path, method: options.method })
    return { ok: true, json: async () => options.method === 'POST' ? course : [course] }
  }
  try {
    assert.equal((await fetchMyCourses())[0].id, course.id)
    assert.equal((await enrollCourse(course.id)).id, course.id)
    assert.deepEqual(requests, [
      { path: '/api/colaborador/meus-cursos', method: 'GET' },
      { path: `/api/colaborador/inscricoes/cursos/${course.id}`, method: 'POST' },
    ])
  } finally {
    globalThis.fetch = previous
  }
})

test('atualiza progresso por PUT apenas com valor válido', async () => {
  const previous = globalThis.fetch
  const requests = []
  globalThis.fetch = async (path, options) => {
    requests.push({ path, method: options.method, body: options.body })
    return { ok: true, json: async () => ({ ...course, progress: 50,
      updatedAt: '2026-10-09T12:00:00Z' }) }
  }
  try {
    assert.equal((await updateCourseProgress(course.id, 50)).progress, 50)
    assert.deepEqual(requests, [{
      path: `/api/colaborador/meus-cursos/${course.id}/progresso`,
      method: 'PUT', body: '{"percentual":50}',
    }])
    await assert.rejects(updateCourseProgress(course.id, 101), /inválido/)
    assert.equal(requests.length, 1)
  } finally {
    globalThis.fetch = previous
  }
})
