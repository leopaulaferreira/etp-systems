import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchCourses, fetchCourseDetails, parseCourse } from '../src/pages/Cursos/courseApi.ts'

const sample = {
  id: '7154c4de-cacd-44fd-9381-a20ad67ba541',
  title: 'Curso de teste', description: 'Conteúdo', category: 'Tecnologia',
  level: 'Intermediário', durationHours: 6.5, icon: 'cloud', featured: true,
}

test('aceita o contrato da API e usa ícone seguro para valor desconhecido', () => {
  assert.deepEqual(parseCourse(sample), sample)
  assert.equal(parseCourse({ ...sample, icon: 'desconhecido' }).icon, 'code')
  assert.throws(() => parseCourse({ ...sample, durationHours: 'seis' }), /incompletos/)
})

test('lista e detalhes consultam os endpoints reais', async () => {
  const previous = globalThis.fetch
  const requests = []
  globalThis.fetch = async (path) => {
    requests.push(path)
    return { ok: true, json: async () => path.endsWith(sample.id) ? sample : [sample] }
  }
  try {
    assert.deepEqual(await fetchCourses(), [sample])
    assert.deepEqual(await fetchCourseDetails(sample.id), sample)
    assert.deepEqual(requests, ['/api/cursos', `/api/cursos/${sample.id}`])
  } finally {
    globalThis.fetch = previous
  }
})

test('resposta HTTP com erro preserva a possibilidade de usar o catálogo local', async () => {
  const previous = globalThis.fetch
  globalThis.fetch = async () => ({ ok: false, status: 503 })
  try {
    await assert.rejects(fetchCourses(), /503/)
  } finally {
    globalThis.fetch = previous
  }
})
