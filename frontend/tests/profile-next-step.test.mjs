import test from 'node:test'
import assert from 'node:assert/strict'
import { profileNextStep } from '../src/pages/Perfil/profileNextStep.ts'

const course = (id, progress, lessonCount = 3) => ({ id, title: `Curso ${id}`, type: 'CURSO', thumbnail: 'cloud', progress, lessonCount })
const assessment = (changes = {}) => ({ id: 'assessment', courseId: 'a', title: 'Avaliação', course: 'Curso a',
  status: 'pending', minimumScore: 80, maxAttempts: 2, questions: [{ id: 'question' }], answers: {}, attempts: [], ...changes })
const failed = { score: 60, passed: false }

test('prioriza avaliação de curso concluído e abre o curso correspondente', () => {
  const next = profileNextStep([course('b', 90), course('a', 100)], [assessment()])
  assert.equal(next.kind, 'assessment')
  assert.equal(next.to, '/avaliacoes?curso=a')
  assert.equal(next.detail, '2 tentativas restantes')
  assert.equal(next.label, 'Ver avaliação')
})

test('não recomenda avaliações aprovadas, agendadas, sem questões ou sem tentativas', () => {
  for (const item of [
    assessment({ status: 'completed', attempts: [failed, failed] }),
    assessment({ status: 'completed', attempts: [{ score: 80, passed: true }] }),
    assessment({ status: 'in_progress', attempts: [{ score: 100, passed: true }, failed] }),
    assessment({ status: 'scheduled' }), assessment({ questions: [] }),
    assessment({ courseId: 'outro' }),
  ]) assert.equal(profileNextStep([course('a', 100), course('b', 50)], [item]).kind, 'course')
  assert.equal(profileNextStep([course('a', 99)], [assessment()]).kind, 'course')
})

test('considera tentativa extra liberada e avaliação em andamento', () => {
  const extra = profileNextStep([course('a', 100)], [assessment({ status: 'completed', attempts: [failed, failed], maxAttempts: 3 })])
  assert.equal(extra.kind, 'assessment')
  assert.equal(extra.detail, '1 tentativa restante')
  const resumed = profileNextStep([course('a', 100)], [assessment({ status: 'in_progress', answers: { question: 1 } })])
  assert.equal(resumed.label, 'Retomar avaliação')
})

test('seleciona maior progresso com aulas, mantém desempate e não muda lista original', () => {
  const courses = [course('sem-aulas', 99, 0), course('a', 25), course('b', 75), course('c', 75), course('concluido', 100)]
  const copy = structuredClone(courses)
  const next = profileNextStep(courses, [])
  assert.equal(next.to, '/cursos/b/estudar')
  assert.equal(next.progress, 75)
  assert.equal(next.label, 'Continuar estudando')
  assert.deepEqual(courses, copy)
})

test('permite começar um curso com aulas e zero progresso', () => {
  const next = profileNextStep([course('a', 0)], [])
  assert.equal(next.kind, 'course')
  assert.equal(next.label, 'Começar curso')
})

test('oferece catálogo sem inventar progresso quando não há próximo passo disponível', () => {
  for (const courses of [[], [course('a', 100)], [course('a', 70, 0)], [{ ...course('a', 20), lessonCount: undefined }]]) {
    const next = profileNextStep(courses, [])
    assert.equal(next.kind, 'catalog')
    assert.equal(next.to, '/cursos')
    assert.equal(next.progress, undefined)
  }
})
