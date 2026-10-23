import { test, expect } from '@playwright/test'
import { courseId, mockLearningApi } from './mobile.fixture.mjs'

async function fits(page) {
  const overflow = await page.locator('html, main, dialog[open], [role=dialog]:not([inert])').evaluateAll(elements => elements.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => ({ element: el.tagName, width: el.clientWidth, content: el.scrollWidth })))
  expect(overflow).toEqual([])
}
async function touchTarget(locator) {
  const box = await locator.boundingBox()
  expect(box.width).toBeGreaterThanOrEqual(44)
  expect(box.height).toBeGreaterThanOrEqual(44)
}
async function answer(page, pass) {
  for (let i = 0; i < 3; i++) {
    await page.getByRole('radio').nth(pass ? 0 : 1).check()
    await page.getByRole('button', { name: i === 2 ? 'Concluir avaliação' : 'Próxima', exact: true }).click()
  }
}

test('menu, aula, conclusão e recuperação de falha em tela pequena', async ({ page }, testInfo) => {
  const state = await mockLearningApi(page)
  await page.goto(`/cursos/${courseId}/estudar`)
  await expect(page.getByRole('button', { name: 'Concluir aula', exact: true })).toBeVisible()
  await fits(page)
  const video = page.locator('video')
  expect(await video.getAttribute('controls')).not.toBeNull()
  expect(await video.getAttribute('playsinline')).not.toBeNull()
  await video.evaluate(async element => { element.muted = true; await element.play() })
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(0)
  await video.evaluate(element => element.pause())
  const videoBox = await video.boundingBox()
  expect(videoBox.width).toBeLessThanOrEqual(page.viewportSize().width)
  if (page.viewportSize().width < 1024) {
    await touchTarget(page.getByRole('button', { name: 'Abrir menu', exact: true }))
    await page.getByRole('button', { name: 'Abrir menu', exact: true }).click()
    const menu = page.getByRole('dialog', { name: 'Navegação principal' })
    await expect(menu).toBeVisible()
    await fits(page)
    await page.screenshot({ animations: 'disabled', path: testInfo.outputPath('menu.png') })
    await touchTarget(page.getByRole('button', { name: 'Fechar menu' }))
    await menu.getByRole('link', { name: 'Central de Ajuda' }).scrollIntoViewIfNeeded()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Abrir menu', exact: true })).toBeFocused()
    await page.getByRole('button', { name: 'Abrir menu', exact: true }).click()
    await page.getByRole('button', { name: 'Fechar menu' }).click()
  }
  await page.getByRole('button', { name: 'Opções da conta', exact: true }).click()
  await touchTarget(page.getByRole('button', { name: 'Meu perfil', exact: true }))
  await page.keyboard.press('Escape')
  state.saveError = true
  await page.getByRole('button', { name: 'Concluir aula', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Não foi possível salvar')
  state.saveError = false
  await page.getByRole('button', { name: 'Concluir aula', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Aula concluída', exact: true })).toBeDisabled()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Aula concluída', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Próxima aula' }).click()
  await expect(page.getByRole('heading', { name: 'Serviços e Modelos de Nuvem', exact: true })).toBeVisible()
  await fits(page)
  await page.screenshot({ animations: 'disabled', path: testInfo.outputPath('aula.png') })
  if (page.viewportSize().width < 1024) {
    await page.getByRole('button', { name: 'Abrir menu', exact: true }).click()
    await page.getByRole('dialog', { name: 'Navegação principal' }).getByRole('link', { name: 'Avaliações', exact: true }).click()
    await expect(page).toHaveURL(/\/avaliacoes$/)
    await expect(page.getByRole('button', { name: 'Abrir menu', exact: true })).toHaveAttribute('aria-expanded', 'false')
    await fits(page)
  }
})

test('avaliação, reprovação, aprovação, prévia e download PDF', async ({ page }, testInfo) => {
  const state = await mockLearningApi(page)
  await page.goto(`/avaliacoes?curso=${courseId}`)
  await page.getByRole('button', { name: 'Começar avaliação' }).click()
  await fits(page)
  await answer(page, false)
  await expect(page.getByText('Você tem 1 tentativa restante.', { exact: false })).toBeVisible()
  await fits(page)
  await page.getByRole('button', { name: 'Tentar novamente (1)' }).click()
  state.certificateError = true
  await answer(page, true)
  await expect(page.getByText('Sua aprovação foi registrada, mas não foi possível consultar o certificado agora.')).toBeVisible()
  state.certificateError = false
  await page.getByRole('button', { name: 'Consultar novamente' }).click()
  await expect(page.getByText('Seu certificado está disponível!')).toBeVisible()
  await page.getByRole('button', { name: 'Ver certificado', exact: true }).click()
  await fits(page)
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Baixar PDF', exact: true }).first().click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  expect(await download.failure()).toBeNull()
  await page.screenshot({ animations: 'disabled', path: testInfo.outputPath('resultado.png') })
  await page.getByRole('button', { name: 'Fechar avaliação', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await fits(page)
  await page.goto('/certificados')
  await page.getByRole('button', { name: 'Ver certificado', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Seu certificado', exact: true })
  await expect(dialog).toBeVisible()
  await fits(page)
  await touchTarget(dialog.getByRole('button', { name: 'Fechar diálogo' }))
  await touchTarget(dialog.getByRole('button', { name: 'Baixar PDF' }))
  await dialog.getByRole('button', { name: 'Baixar PDF' }).scrollIntoViewIfNeeded()
  await page.screenshot({ animations: 'disabled', path: testInfo.outputPath('certificado.png') })
  await page.getByRole('button', { name: 'Fechar diálogo' }).click()
  await page.getByRole('searchbox', { name: 'Buscar certificados' }).fill('nenhum resultado')
  await expect(page.getByRole('heading', { name: 'Nenhum certificado encontrado' })).toBeVisible()
  await fits(page)
})


test('última reprovação mantém o resultado legível e bloqueia nova tentativa', async ({ page }) => {
  await mockLearningApi(page)
  await page.goto(`/avaliacoes?curso=${courseId}`)
  await page.getByRole('button', { name: 'Começar avaliação' }).click()
  await answer(page, false)
  await page.getByRole('button', { name: 'Tentar novamente (1)' }).click()
  await answer(page, false)
  await expect(page.getByText('Você utilizou todas as tentativas desta avaliação.')).toBeVisible()
  await expect(page.getByText('A correção detalhada aparece somente após a aprovação.', { exact: false })).toBeVisible()
  await expect(page.getByText('Resposta correta:', { exact: false })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Tentar novamente/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Baixar PDF' })).toHaveCount(0)
  await fits(page)
  await page.getByRole('button', { name: 'Fechar resultado' }).click()
  await page.getByRole('searchbox', { name: 'Buscar avaliações' }).fill('não existe')
  await fits(page)
})
