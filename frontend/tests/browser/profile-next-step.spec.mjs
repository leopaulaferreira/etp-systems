import { test, expect } from '@playwright/test'
import { mockLearningApi, courseId, id } from './mobile.fixture.mjs'

const title = 'Cloud Computing Essencial: Fundamentos, Serviços e Modelos de Nuvem'
const enrolled = { id: courseId, title, description: 'Fundamentos da nuvem.', icon: 'cloud', durationHours: 3,
  enrolledAt: '2026-10-01T12:00:00Z', progress: 66.66, updatedAt: null, completedAt: null, lessonCount: 3 }
const cardFor = page => page.getByRole('region', { name: 'Próximo passo', exact: true })
async function fits(page) {
  expect(await page.locator('html, main, section[aria-labelledby="profile-next-step-title"]').evaluateAll(elements => elements.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.tagName))).toEqual([])
}

test('perfil indica avaliação disponível e abre o curso sem consumir tentativa', async ({ page }, testInfo) => {
  const state = await mockLearningApi(page)
  state.completed = [id(10), id(11), id(12)]
  await page.goto('/perfil')
  const card = cardFor(page)
  await expect(card.getByText('2 tentativas restantes', { exact: true })).toBeVisible()
  await expect(card.getByRole('heading', { name: title })).toBeVisible()
  await fits(page)
  await card.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('perfil-proximo-passo.png') })
  await card.getByRole('link', { name: 'Ver avaliação', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/avaliacoes\\?curso=${courseId}$`))
  await expect(page.getByRole('button', { name: 'Começar avaliação', exact: true })).toBeVisible()
  expect(state.attempts).toHaveLength(0)
})

test('perfil continua o curso mais avançado com aulas disponíveis', async ({ page }) => {
  await mockLearningApi(page)
  await page.route('**/api/colaborador/meus-cursos', route => route.fulfill({ json: [
    { ...enrolled, id: id(70), title: 'Conteúdo em preparação', progress: 99, lessonCount: 0 },
    { ...enrolled, id: id(71), title: 'Curso menos avançado', progress: 25 }, enrolled,
  ] }))
  await page.goto('/perfil')
  const card = cardFor(page)
  await expect(card.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '66.66')
  await expect(card.getByRole('heading', { name: title })).toBeVisible()
  await fits(page)
  await card.getByRole('link', { name: 'Continuar estudando' }).click()
  await expect(page).toHaveURL(new RegExp(`/cursos/${courseId}/estudar$`))
  await expect(page.getByRole('heading', { name: 'Fundamentos de Cloud Computing', exact: true })).toBeVisible()
})

test('perfil distingue falha de consulta e catálogo sem cursos inscritos', async ({ page }) => {
  await mockLearningApi(page)
  let fail = true
  await page.route('**/api/colaborador/avaliacoes', route => route.fulfill(fail ? { status: 503, json: {} } : { json: [] }))
  await page.route('**/api/colaborador/meus-cursos', route => route.fulfill({ json: [] }))
  await page.goto('/perfil')
  const card = cardFor(page)
  await expect(card.getByText('Não foi possível consultar seu próximo passo.')).toBeVisible()
  await expect(card.getByRole('link')).toHaveCount(0)
  fail = false
  await card.getByRole('button', { name: 'Atualizar sugestão' }).click()
  await expect(card.getByRole('link', { name: 'Explorar cursos' })).toBeVisible()
  await fits(page)
  await card.getByRole('link', { name: 'Explorar cursos' }).click()
  await expect(page).toHaveURL(/\/cursos$/)
})
