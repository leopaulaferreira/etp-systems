import test from 'node:test'
import assert from 'node:assert/strict'
import { enrollCourse, fetchMyCourses, parseMyCourse } from '../src/pages/MeusCursos/myCoursesApi.ts'

const course = {
  id: '7154c4de-cacd-44fd-9381-a20ad67ba541',
  title: 'Curso de teste', description: 'Conteúdo', icon: 'cloud',
  durationHours: 6.5, enrolledAt: '2026-10-09T12:00:00Z',
}

test('converte a inscrição real sem inventar progresso', () => {
  assert.deepEqual(parseMyCourse(course), {
    id: course.id, title: course.title, description: course.description,
    type: 'CURSO', thumbnail: 'cloud', duration: '6h 30m',
  })
  assert.throws(() => parseMyCourse({ ...course, id: 'curso-local' }), /incompletos/)
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
