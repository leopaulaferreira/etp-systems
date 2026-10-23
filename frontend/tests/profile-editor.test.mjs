import test from 'node:test'
import assert from 'node:assert/strict'
import { createProfileEditor } from '../src/profile/profileEditor.ts'

const initial = { name: 'Ana', phone: '', location: '', position: 'Analista',
  learningFocus: 'Explorar novos temas', experienceLevel: 'Avançado', notificationsEnabled: true }
const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

test('alterações rápidas preservam os campos já salvos e a leitura inicial atrasada', async () => {
  const read = deferred(), firstSave = deferred(), started = deferred()
  const writes = [], published = []
  const editor = createProfileEditor({
    read: () => read.promise,
    save: async value => {
      writes.push(value)
      if (writes.length === 1) { started.resolve(); await firstSave.promise }
      return value
    },
  }, value => published.push(value))
  const loading = editor.load()
  const objective = editor.update({ learningFocus: 'Preparar-me para uma nova função' })
  const level = editor.update({ experienceLevel: 'Iniciante' })
  read.resolve(initial)
  await started.promise
  assert.equal(writes.length, 1)
  firstSave.resolve()
  await Promise.all([loading, objective, level])
  assert.equal(writes[1].learningFocus, 'Preparar-me para uma nova função')
  assert.equal(writes[1].experienceLevel, 'Iniciante')
  assert.equal(published.at(-1).position, 'Analista')
})

test('falha de gravação não bloqueia a fila e exige reler o estado do servidor', async () => {
  let reads = 0, writes = 0
  const editor = createProfileEditor({
    read: async () => { reads++; return { ...initial, phone: '11999999999' } },
    save: async value => { if (++writes === 1) throw new Error('Falha'); return value },
  }, () => {})
  await editor.load()
  const failed = editor.update({ learningFocus: 'Novo objetivo' })
  const next = editor.update({ experienceLevel: 'Iniciante' })
  await assert.rejects(failed, /Falha/)
  const saved = await next
  assert.equal(reads, 2)
  assert.equal(saved.learningFocus, initial.learningFocus)
  assert.equal(saved.phone, '11999999999')
})

test('limpar perfil aguarda as alterações pendentes e preserva o nome atualizado', async () => {
  const editor = createProfileEditor({ read: async () => initial, save: async value => value }, () => {})
  const rename = editor.update({ name: 'Ana Silva' })
  const reset = editor.reset()
  await rename
  const saved = await reset
  assert.equal(saved.name, 'Ana Silva')
  assert.equal(saved.learningFocus, '')
  assert.equal(saved.experienceLevel, '')
})

test('trocar de conta cancela gravações aguardando a leitura do perfil', async () => {
  const read = deferred(), started = deferred(), controller = new AbortController()
  let writes = 0, published = 0
  const editor = createProfileEditor({
    read: async () => { started.resolve(); return read.promise },
    save: async value => { writes++; return value },
  }, () => { published++ })
  const first = editor.update({ name: 'Ana Silva' }, controller.signal)
  const second = editor.update({ experienceLevel: 'Iniciante' }, controller.signal)
  const rejected = Promise.all([assert.rejects(first, { name: 'AbortError' }), assert.rejects(second, { name: 'AbortError' })])
  await started.promise
  controller.abort()
  read.resolve(initial)
  await rejected
  assert.equal(writes, 0)
  assert.equal(published, 0)
})
