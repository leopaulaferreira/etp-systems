import { test, expect } from '@playwright/test'
import { id, mockLearningApi } from './mobile.fixture.mjs'

const storageKey = `etp-company-settings:${id(90)}:${id(99)}`

async function fits(page) {
  expect(await page.locator('html, main').evaluateAll(elements => elements.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.tagName))).toEqual([])
}

test('RH edita, cancela e preserva preferências locais entre as páginas', async ({ page }, testInfo) => {
  await mockLearningApi(page, 'EMPRESA')
  const writes = []
  page.on('request', request => { if (request.url().includes('/api/') && request.method() !== 'GET') writes.push(request.url()) })
  await page.goto('/empresa/configuracoes/dados')
  const save = page.getByRole('button', { name: 'Salvar alterações' })
  const name = page.getByRole('textbox', { name: 'Nome da empresa' })
  await expect(name).toHaveValue('ETP')
  await expect(save).toBeDisabled()
  await fits(page)
  await page.screenshot({ path: testInfo.outputPath('dados-empresa.png') })
  await name.fill('Outra empresa')
  await expect(page.getByRole('status')).toContainText('Alterações não salvas')
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await expect(name).toHaveValue('ETP')
  await expect(save).toBeDisabled()
  await name.fill('  ETP Desenvolvimento Corporativo  ')
  await page.getByRole('textbox', { name: 'E-mail de contato' }).fill('equipe@example.test')
  await save.click()
  await expect(page.getByRole('status')).toContainText('Alterações salvas neste navegador.')
  await expect(save).toBeDisabled()
  await page.reload()
  await expect(name).toHaveValue('ETP Desenvolvimento Corporativo')
  await page.goto('/empresa/configuracoes/conta')
  await expect(page.getByRole('textbox', { name: 'Nome do responsável' })).toHaveValue('RH ETP')
  await expect(page.getByRole('complementary', { name: 'Identidade do responsável' })).toContainText('ETP Desenvolvimento Corporativo')
  await expect(page.getByRole('textbox')).toHaveCount(1)
  await page.getByRole('textbox', { name: 'Nome do responsável' }).fill('Responsável de Desenvolvimento Humano')
  await save.click()
  await expect(page.getByRole('status')).toContainText('Alterações salvas neste navegador.')
  await fits(page)
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey)
  expect(stored).toMatchObject({ name: 'ETP Desenvolvimento Corporativo', contactEmail: 'equipe@example.test', contactName: 'Responsável de Desenvolvimento Humano' })
  await expect(page.getByRole('complementary', { name: 'Identidade do responsável' })).toContainText('mobile@example.test')
  await page.getByRole('link', { name: /Acompanhar pessoas/ }).click()
  await expect(page).toHaveURL(/\/empresa\/colaboradores$/)
  expect(writes).toEqual([])
})

test('RH recupera falha de armazenamento e encerra a sessão pela segurança', async ({ page }, testInfo) => {
  await mockLearningApi(page, 'EMPRESA')
  await page.route('**/api/empresa/painel', route => route.fulfill({ status: 503, json: {} }))
  await page.goto('/empresa/configuracoes/conta')
  await expect(page.getByText('Organização indisponível', { exact: true })).toBeVisible()
  const name = page.getByRole('textbox', { name: 'Nome do responsável' })
  await name.fill('  ')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('alert')).toContainText('Preencha os campos')
  await name.fill('Responsável RH')
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function(key, value) {
      if (key.startsWith('etp-company-settings:')) { Storage.prototype.setItem = original; throw new DOMException('Storage blocked', 'QuotaExceededError') }
      return original.call(this, key, value)
    }
  })
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('alert')).toContainText('Não foi possível salvar')
  await expect(name).toHaveValue('Responsável RH')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('status')).toContainText('Alterações salvas neste navegador.')
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey)).toEqual({ contactName: 'Responsável RH' })
  await page.unroute('**/api/empresa/painel')
  await page.reload()
  await expect(page.getByRole('complementary', { name: 'Identidade do responsável' }).getByText('ETP', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Gerenciar meu acesso' }).click()
  await expect(page.getByRole('heading', { name: 'Informações de acesso' })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Sessão atual' })).toContainText('mobile@example.test')
  await expect(page.getByText('A alteração de senha ainda não está disponível na plataforma.')).toBeVisible()
  await fits(page)
  await page.screenshot({ path: testInfo.outputPath('seguranca.png') })
  await page.getByRole('button', { name: 'Sair da conta', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
  expect(await page.evaluate(() => sessionStorage.getItem('etp-auth-session-v1'))).toBeNull()
})
