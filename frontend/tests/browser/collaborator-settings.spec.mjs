import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { mockLearningApi, courseId, id } from './mobile.fixture.mjs'

async function settingsApi(page) {
  await mockLearningApi(page)
  const state = { fail: false, writes: [], profile: {
    name: 'Rafael Martins de Albuquerque', email: 'mobile@example.test', phone: '11999999999',
    location: 'São Caetano do Sul', position: 'Analista', company: 'ETP Systems',
    learningFocus: 'Explorar novos temas', experienceLevel: 'Intermediário', notificationsEnabled: true, memberSince: '2026-01-01',
  } }
  await page.route('**/api/colaborador/perfil', async route => {
    if (route.request().method() === 'PUT') {
      if (state.fail) return route.fulfill({ status: 503, json: {} })
      const body = route.request().postDataJSON()
      state.writes.push(body)
      state.profile = { ...state.profile, ...body }
    }
    await route.fulfill({ json: state.profile })
  })
  return state
}

async function section(page, id, name) {
  const menu = page.getByRole('navigation', { name: 'Seções de configurações' })
  await expect(menu).toBeVisible()
  const select = menu.getByRole('combobox')
  if (await select.isVisible()) await select.selectOption(id)
  else await menu.getByRole('button', { name, exact: true }).click()
  await expect(page.locator('#settings-title')).toHaveText(name)
  await fits(page)
}

async function fits(page) {
  expect(await page.locator('html, main, #settings-panel, dialog[open]').evaluateAll(elements => elements.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.tagName))).toEqual([])
}

test('conta preserva edição ao alternar seções e não sobrescreve notificações', async ({ page }) => {
  const state = await settingsApi(page)
  await page.goto('/configuracoes?secao=conta')
  const name = page.getByRole('textbox', { name: 'Nome completo' })
  const save = page.getByRole('button', { name: 'Salvar alterações' })
  await expect(name).toHaveValue(state.profile.name)
  await expect(save).toBeDisabled()
  await name.fill('Nome temporário')
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await expect(name).toHaveValue(state.profile.name)
  await name.fill('  Rafael Martins  ')
  await section(page, 'notificacoes', 'Notificações')
  await expect(page.getByText('Você tem alterações não salvas nos dados da conta.')).toBeVisible()
  const notification = page.getByRole('switch', { name: 'Mostrar avisos no cabeçalho' })
  state.fail = true
  // A falha pode restaurar o valor antes da verificação interna de uncheck().
  await notification.click()
  await expect(page.getByText('Não foi possível salvar a preferência. Tente novamente.')).toBeVisible()
  await expect(notification).toBeChecked()
  state.fail = false
  await notification.uncheck()
  await expect(page.getByText('Preferência de notificações salva.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Revisar alterações' }).click()
  await expect(name).toHaveValue('  Rafael Martins  ')
  await save.click()
  await expect(page.getByRole('status').filter({ hasText: 'Alterações salvas.' })).toBeVisible()
  expect(state.profile.notificationsEnabled).toBe(false)
  expect(state.profile.name).toBe('Rafael Martins')
  expect(state.writes.at(-1)).not.toHaveProperty('email')
  expect(state.writes.at(-1)).not.toHaveProperty('company')
  await page.reload()
  await expect(name).toHaveValue('Rafael Martins')
  await expect(page.getByRole('textbox')).toHaveCount(4)
  await fits(page)
})

test('preferências, acessibilidade e privacidade mantêm efeitos e escopo da limpeza', async ({ page }, testInfo) => {
  const state = await settingsApi(page)
  await page.goto('/configuracoes')
  await expect(page.getByRole('combobox', { name: 'Objetivo de aprendizagem' })).toHaveValue('Explorar novos temas')
  const videos = page.getByRole('switch', { name: 'Vídeos', exact: true })
  await videos.uncheck()
  const box = await videos.boundingBox()
  expect(box.width).toBeGreaterThanOrEqual(44)
  expect(box.height).toBeGreaterThanOrEqual(44)
  await page.reload()
  await expect(videos).not.toBeChecked()
  await fits(page)
  await page.screenshot({ path: testInfo.outputPath('preferencias-estudo.png') })
  await section(page, 'notificacoes', 'Notificações')
  await page.getByRole('switch', { name: 'Avaliações', exact: true }).check()
  await expect(page.locator('#settings-panel').getByText('Confira suas avaliações disponíveis.', { exact: true })).toHaveCount(2)
  await section(page, 'acessibilidade', 'Acessibilidade')
  const text = page.getByRole('switch', { name: 'Texto ampliado' })
  await text.focus()
  await page.keyboard.press('Space')
  await expect(page.locator('html')).toHaveClass(/etp-larger-text/)
  await page.getByRole('switch', { name: 'Reduzir animações' }).check()
  await expect(page.locator('html')).toHaveClass(/etp-reduced-motion/)
  await fits(page)
  await section(page, 'privacidade', 'Privacidade')
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Baixar dados', exact: true }).click()
  const download = await downloaded
  expect(download.suggestedFilename()).toBe('etp-meus-dados.json')
  const json = JSON.parse(await readFile(await download.path(), 'utf8'))
  expect(json.profile.email).toBe(state.profile.email)
  expect(json.study).toMatchObject({ videos: false, assessmentReminders: true })
  expect(json.accessibility).toEqual({ largerText: true, reducedMotion: true })
  await page.getByRole('button', { name: 'Limpar personalizações', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Limpar personalizações?' })
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click()
  expect(state.writes).toHaveLength(0)
  await page.getByRole('button', { name: 'Limpar personalizações', exact: true }).click()
  await dialog.getByRole('button', { name: 'Confirmar limpeza', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByText('Personalizações removidas. Preferências padrão restauradas.')).toBeVisible()
  expect(state.profile).toMatchObject({ name: 'Rafael Martins de Albuquerque', email: 'mobile@example.test', company: 'ETP Systems', phone: '', location: '', position: '', learningFocus: '', experienceLevel: '', notificationsEnabled: true })
  await expect(page.locator('html')).not.toHaveClass(/etp-larger-text|etp-reduced-motion/)
  expect(await page.evaluate(key => localStorage.getItem(key), `etp-study-settings-v1:${id(2)}`)).toBeNull()
  await section(page, 'estudo', 'Preferências de estudo')
  await expect(videos).toBeChecked()
})

test('segurança confirma saída quando existem respostas de avaliação não enviadas', async ({ page }) => {
  await settingsApi(page)
  await page.goto(`/avaliacoes?curso=${courseId}`)
  await page.getByRole('button', { name: 'Começar avaliação' }).click()
  await page.getByRole('radio').first().check()
  const closePrompt = page.waitForEvent('dialog')
  const closing = page.getByRole('button', { name: 'Fechar avaliação', exact: true }).click()
  await (await closePrompt).accept()
  await closing
  await expect(page.getByRole('button', { name: 'Fechar avaliação', exact: true })).not.toBeVisible()
  // Navegação SPA preserva as respostas em memória.
  if (page.viewportSize().width < 1024) await page.getByRole('button', { name: 'Abrir menu', exact: true }).click()
  const navigationPrompt = page.waitForEvent('dialog')
  const navigating = page.getByRole('link', { name: 'Configurações', exact: true }).click()
  await (await navigationPrompt).accept()
  await navigating
  await section(page, 'seguranca', 'Segurança')
  await expect(page.getByText('A alteração de senha ainda não está disponível nesta versão.')).toBeVisible()
  await page.getByRole('button', { name: 'Sair da conta', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Sair sem salvar?' })
  await expect(dialog).toBeVisible()
  await fits(page)
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await expect(page).toHaveURL(/configuracoes/)
  await page.getByRole('button', { name: 'Sair da conta', exact: true }).click()
  await dialog.getByRole('button', { name: 'Sair da conta', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
  expect(await page.evaluate(() => sessionStorage.getItem('etp-auth-session-v1'))).toBeNull()
})
