import test from 'node:test'
import assert from 'node:assert/strict'
import { parseAssessment, parseLesson } from '../src/pages/Avaliacoes/assessmentApi.ts'
import { latestScore, canStart, assessmentSummary } from '../src/pages/Avaliacoes/assessment.ts'

const ids = {
  assessment: '11111111-1111-4111-8111-111111111111',
  course: '22222222-2222-4222-8222-222222222222',
  question: '33333333-3333-4333-8333-333333333333',
  first: '44444444-4444-4444-8444-444444444444',
  second: '55555555-5555-4555-8555-555555555555',
}

function response() {
  return {
    id: ids.assessment, courseId: ids.course, title: 'Avaliação', course: 'Curso piloto',
    status: 'completed', minimumScore: 80, maxAttempts: 2, estimatedMinutes: 8,
    topic: 'security', questions: [{ id: ids.question, prompt: 'Pergunta',
      options: ['A', 'B'], optionIds: [ids.first, ids.second], correctOption: null,
      explanation: null }],
    attempts: [{ answers: { [ids.question]: 0 }, score: 0, passed: false,
      completedAt: '2026-10-09T12:00:00Z' }],
  }
}

test('nota vinda da API funciona sem expor o gabarito antes da aprovação', () => {
  const assessment = parseAssessment(response())
  assert.equal(assessment.questions[0].correctOption, undefined)
  assert.equal(latestScore(assessment), 0)
  assert.equal(canStart(assessment), true)
  assert.equal(assessmentSummary([assessment]).average, 0)
})

test('avaliação de IA preserva o tema e as seis questões recebidas da API', () => {
  const item = response()
  item.topic = 'ai'
  item.questions = Array.from({ length: 6 }, (_, index) => ({
    ...item.questions[0],
    id: `33333333-3333-4333-8333-${String(index + 1).padStart(12, '0')}`,
    prompt: `Questão ${index + 1}`,
  }))
  const parsed = parseAssessment(item)
  assert.equal(parsed.topic, 'ai')
  assert.equal(parsed.questions.length, 6)
})

test('o parser rejeita alternativas e notas inválidas', () => {
  const invalidOptions = response()
  invalidOptions.questions[0].optionIds = [ids.first]
  assert.throws(() => parseAssessment(invalidOptions), /Questão inválida/)
  const invalidScore = response()
  invalidScore.attempts[0].score = 120
  assert.throws(() => parseAssessment(invalidScore), /Tentativa inválida/)
})

for (const topic of ['projects', 'communication']) {
  test(`avaliação de ${topic} preserva o tema e a ordem das 18 questões recebidas da API`, () => {
    const item = response()
    item.topic = topic
    item.questions = Array.from({ length: 18 }, (_, index) => ({
      ...item.questions[0],
      id: `33333333-3333-4333-8333-${String(index + 1).padStart(12, '0')}`,
      prompt: `Questão ${index + 1}`,
    }))
    const parsed = parseAssessment(item)
    assert.equal(parsed.topic, topic)
    assert.equal(parsed.questions.length, 18)
    assert.deepEqual(parsed.questions.map(question => question.prompt), item.questions.map(question => question.prompt))
    assert.ok(parsed.questions.every(question => question.correctOption === undefined))
  })
}

test('aula aceita vídeo ainda ausente e preserva o texto', () => {
  assert.deepEqual(parseLesson({ id: ids.question, title: 'Aula', content: 'Texto da aula',
    videoUrl: null, order: 1 }), {
    id: ids.question, title: 'Aula', content: 'Texto da aula', videoUrl: null, order: 1,
  })
})
