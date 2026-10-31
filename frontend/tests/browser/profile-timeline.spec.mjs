import { test, expect } from '@playwright/test'
import { mockLearningApi, id, courseId } from './mobile.fixture.mjs'
const timeline = page => page.getByRole('region', { name: 'Sua trajetória', exact: true })

test('trajetória filtra, expande e abre a avaliação sem enviar tentativa', async ({ page }, testInfo) => {
  const state = await mockLearningApi(page)
  state.attempts = [0, 1].map(i => ({ answers: {}, score: i ? 100 : 40, passed: !!i, completedAt: `2026-10-${20 + i}T12:00:00Z` }))
  await page.route('**/api/colaborador/meus-cursos', route => route.fulfill({ json: [0, 1, 2].map(i => ({
    id: i ? id(70 + i) : courseId, title: `Curso ${i + 1}`, description: '', icon: 'cloud', durationHours: 3,
    enrolledAt: `2026-10-0${i + 1}T12:00:00Z`, progress: 100, completedAt: '2026-10-20T12:00:00Z', updatedAt: null, lessonCount: 3,
  })) }))
  await page.goto('/perfil')
  const card = timeline(page)
  await expect(card.getByRole('listitem')).toHaveCount(4)
  await card.getByRole('button', { name: 'Ver mais registros' }).click()
  expect(await card.getByRole('listitem').count()).toBeGreaterThan(4)
  await card.getByRole('button', { name: 'Recolher histórico' }).click()
  await expect(card.getByRole('listitem')).toHaveCount(4)
  await card.getByRole('button', { name: 'Avaliações', exact: true }).click()
  await expect(card.getByRole('listitem')).toHaveCount(2)
  await expect(card.getByText('Tentativa 1 · Nota 40% · Nota mínima não atingida')).toBeVisible()
  await card.scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page.screenshot({ path: testInfo.outputPath('trajetoria.png') })
  await card.getByRole('link').first().click()
  await expect(page).toHaveURL(new RegExp(`/avaliacoes\\?curso=${courseId}$`))
  expect(state.attempts).toHaveLength(2)
})

test('trajetória distingue falha de carregamento e ausência de registros', async ({ page }) => {
  await mockLearningApi(page)
  let fail = true
  await page.route('**/api/colaborador/avaliacoes', route => route.fulfill(fail ? { status: 503, json: {} } : { json: [] }))
  await page.route('**/api/colaborador/meus-cursos', route => route.fulfill({ json: [] }))
  await page.goto('/perfil')
  const card = timeline(page)
  await expect(card.getByText('Não foi possível carregar sua trajetória.')).toBeVisible()
  await expect(card.getByRole('link')).toHaveCount(0)
  fail = false
  await card.getByRole('button', { name: 'Atualizar trajetória' }).click()
  await expect(card.getByRole('link', { name: 'Explorar cursos' })).toHaveAttribute('href', '/cursos')
  await expect(card.getByRole('group', { name: 'Filtrar trajetória' })).toHaveCount(0)
})
