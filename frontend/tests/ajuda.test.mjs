import test from 'node:test'
import assert from 'node:assert/strict'
import { filterHelpQuestions, helpQuestions } from '../src/pages/Ajuda/help.ts'

test('busca encontra perguntas sem depender de acentos, caixa ou espaços externos', () => {
  assert.deepEqual(filterHelpQuestions('  REFAZER UMA AVALIACAO  ', null).map(({ id }) => id), ['tentativas'])
})

test('busca também encontra orientações dentro da resposta', () => {
  assert.deepEqual(filterHelpQuestions('duas entregas', null).map(({ id }) => id), ['tentativas'])
})

test('categoria e busca se combinam e podem produzir um estado vazio', () => {
  assert.equal(filterHelpQuestions('certificado', 'certificados').length, 2)
  assert.deepEqual(filterHelpQuestions('certificado', 'conta'), [])
  assert.deepEqual(filterHelpQuestions('xyz-inexistente', null), [])
})

test('limpar os filtros recupera todas as perguntas sem modificar os dados', () => {
  const original = structuredClone(helpQuestions)
  filterHelpQuestions('senha', 'conta')
  assert.deepEqual(filterHelpQuestions('', null), original)
  assert.deepEqual(helpQuestions, original)
})
