import test from 'node:test'
import assert from 'node:assert/strict'
import { initialAssessments } from './fixtures/avaliacoes.fixture.ts'
import {
  answerAssessment,
  assessmentSummary,
  calculateScore,
  canStart,
  initialFilters,
  latestScore,
  remainingAttempts,
  selectAssessments,
  startAssessment,
  submitAssessment,
} from '../src/pages/Avaliacoes/assessment.ts'

const fresh = () => structuredClone(initialAssessments[0])
const answerAll = (item, correct = true) =>
  item.questions.reduce(
    (current, question) =>
      answerAssessment(
        current,
        question.id,
        correct ? question.correctOption : (question.correctOption + 1) % question.options.length,
      ),
    item,
  )
const date = '2026-09-27T15:00:00Z'

test('mock contém oito avaliações com IDs e gabaritos válidos', () => {
  assert.equal(initialAssessments.length, 8)
  assert.equal(new Set(initialAssessments.map((item) => item.id)).size, 8)
  for (const item of initialAssessments) {
    assert.equal(new Set(item.questions.map((question) => question.id)).size, item.questions.length)
    assert(
      item.questions.every(
        (question) =>
          question.correctOption >= 0 && question.correctOption < question.options.length,
      ),
    )
  }
})

test('busca normaliza acentos e combina tipo, conteúdo e status', () => {
  const result = selectAssessments(initialAssessments, {
    ...initialFilters,
    query: ' AMEACAS ',
    type: 'Quiz',
    courseType: 'Trilha',
    status: 'in_progress',
  })
  assert.deepEqual(
    result.map((item) => item.id),
    ['ameacas'],
  )
  assert.deepEqual(
    selectAssessments(initialAssessments, { ...initialFilters, query: 'inexistente' }),
    [],
  )
})

test('resumo é calculado dos estados e notas, incluindo nota zero', () => {
  assert.deepEqual(assessmentSummary(initialAssessments), {
    pending: 2,
    ongoing: 2,
    completed: 3,
    average: 83,
    remaining: 8,
  })
  const failed = submitAssessment(answerAll(startAssessment(fresh()), false), date)
  assert.equal(assessmentSummary([failed]).average, 0)
  assert.equal(assessmentSummary([]).average, null)
})

test('iniciar não consome tentativa; retomar preserva as respostas', () => {
  const original = fresh()
  const started = startAssessment(original)
  assert.equal(started.status, 'in_progress')
  assert.equal(started.attempts.length, 0)
  const answered = answerAssessment(started, started.questions[0].id, 1)
  assert.deepEqual(startAssessment(answered).answers, answered.answers)
  assert.equal(original.status, 'pending')
  assert.deepEqual(original.answers, {})
})

test('opções inválidas, questões desconhecidas e edição fora da tentativa são bloqueadas', () => {
  const pending = fresh()
  assert.equal(answerAssessment(pending, pending.questions[0].id, 0), pending)
  const started = startAssessment(pending)
  for (const option of [-1, 100, 0.5, NaN])
    assert.equal(answerAssessment(started, started.questions[0].id, option), started)
  assert.equal(answerAssessment(started, 'inexistente', 0), started)
})

test('não permite entregar uma avaliação com questões sem resposta', () => {
  const started = startAssessment(fresh())
  assert.equal(submitAssessment(started, date), started)
  const partial = answerAssessment(started, started.questions[0].id, 1)
  assert.equal(submitAssessment(partial, date), partial)
})

test('entrega calcula a nota, registra uma tentativa e preserva os dados anteriores', () => {
  const answered = answerAll(startAssessment(fresh()))
  const submitted = submitAssessment(answered, date)
  assert.equal(submitted.status, 'completed')
  assert.equal(latestScore(submitted), 100)
  assert.equal(submitted.attempts.length, 1)
  assert.deepEqual(submitted.answers, {})
  assert.equal(submitted.attempts[0].completedAt, date)
  assert.equal(answered.status, 'in_progress')
  assert.equal(answered.attempts.length, 0)
  assert.equal(submitAssessment(submitted, date), submitted)
  assert.equal(canStart(submitted), false)
})

test('reprovação permite nova tentativa sem ultrapassar o limite', () => {
  const failed = submitAssessment(answerAll(startAssessment(fresh()), false), date)
  assert.equal(latestScore(failed), 0)
  assert.equal(remainingAttempts(failed), 1)
  assert.equal(canStart(failed), true)
  const retry = startAssessment(failed)
  assert.deepEqual(retry.answers, {})
  assert.equal(retry.attempts.length, 1)
  const exhausted = submitAssessment(answerAll(retry, false), date)
  assert.equal(exhausted.attempts.length, 2)
  assert.equal(remainingAttempts(exhausted), 0)
  assert.equal(canStart(exhausted), false)
  assert.equal(startAssessment(exhausted), exhausted)
})

test('avaliações agendadas não podem iniciar ou receber respostas', () => {
  const scheduled = initialAssessments.find((item) => item.status === 'scheduled')
  assert.equal(canStart(scheduled), false)
  assert.equal(startAssessment(scheduled), scheduled)
  assert.equal(answerAssessment(scheduled, scheduled.questions[0].id, 0), scheduled)
  assert.equal(submitAssessment(scheduled, date), scheduled)
})

test('a média usa a última tentativa; nota parcial é proporcional aos acertos', () => {
  const failed = submitAssessment(answerAll(startAssessment(fresh()), false), date)
  const passed = submitAssessment(answerAll(startAssessment(failed)), date)
  assert.equal(assessmentSummary([passed]).average, 100)
  const item = fresh()
  const answers = Object.fromEntries(
    item.questions.slice(0, 3).map((question) => [question.id, question.correctOption]),
  )
  assert.equal(calculateScore(item, answers), 75)
})
