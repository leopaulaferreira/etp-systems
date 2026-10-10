import test from 'node:test'
import assert from 'node:assert/strict'
import { catalogCourses, featuredCourse } from './fixtures/cursos.fixture.ts'
import { initialFilters, selectCourses, formatDuration } from '../src/pages/Cursos/catalog.ts'

test('o catálogo tem 24 IDs únicos e inclui o destaque uma única vez', () => {
  assert.equal(catalogCourses.length, 24)
  assert.equal(new Set(catalogCourses.map((course) => course.id)).size, 24)
  assert.equal(catalogCourses.filter((course) => course.id === featuredCourse.id).length, 1)
})

test('busca ignora acentos, caixa e espaços nas extremidades', () => {
  const results = selectCourses(catalogCourses, {
    ...initialFilters,
    query: '  COMPUTACAO EM NUVEM  ',
  })
  assert.deepEqual(
    results.map((course) => course.id),
    ['computacao-nuvem'],
  )
})

test('busca também encontra termos da descrição', () => {
  const results = selectCourses(catalogCourses, { ...initialFilters, query: 'tabelas dinamicas' })
  assert.deepEqual(
    results.map((course) => course.id),
    ['excel-avancado'],
  )
})

test('categoria, nível e busca são combinados', () => {
  const results = selectCourses(catalogCourses, {
    ...initialFilters,
    category: 'Dados',
    level: 'Intermediário',
    query: 'python',
  })
  assert.deepEqual(
    results.map((course) => course.id),
    ['python-analise-dados'],
  )
})

test('combinação incompatível retorna uma lista vazia', () => {
  assert.deepEqual(
    selectCourses(catalogCourses, {
      ...initialFilters,
      category: 'Segurança',
      level: 'Avançado',
      query: 'cloud',
    }),
    [],
  )
})

test('ordena por duração, popularidade e nome sem alterar o mock', () => {
  const originalIds = catalogCourses.map((course) => course.id)
  const duration = selectCourses(catalogCourses, { ...initialFilters, order: 'duration' })
  assert.equal(duration[0].id, 'gestao-tempo')
  assert(
    duration.every(
      (course, index) => index === 0 || duration[index - 1].durationHours <= course.durationHours,
    ),
  )
  const popular = selectCourses(catalogCourses, { ...initialFilters, order: 'popular' })
  assert.equal(popular[0].id, featuredCourse.id)
  assert(
    popular.every((course, index) => index === 0 || popular[index - 1].students >= course.students),
  )
  const alphabetical = selectCourses(catalogCourses, { ...initialFilters, order: 'title' })
  assert(
    alphabetical.every(
      (course, index) =>
        index === 0 || alphabetical[index - 1].title.localeCompare(course.title, 'pt-BR') <= 0,
    ),
  )
  assert.deepEqual(
    catalogCourses.map((course) => course.id),
    originalIds,
  )
  assert.deepEqual(
    selectCourses(catalogCourses, initialFilters).map((course) => course.id),
    originalIds,
  )
})

test('duração fracionada é apresentada em horas e minutos', () => {
  assert.equal(formatDuration(6.5), '6h 30min')
  assert.equal(formatDuration(4), '4h')
})
