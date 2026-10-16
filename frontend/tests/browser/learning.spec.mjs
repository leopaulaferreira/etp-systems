import { test, expect } from '@playwright/test'
import { courseId, mockLearningApi } from './mobile.fixture.mjs'

async function confirmNavigation(page, action, accept = false) {
  const dialogEvent = page.waitForEvent('dialog')
  const actionResult = action()
  const dialog = await dialogEvent
  if (accept) await dialog.accept()
  else await dialog.dismiss()
  await actionResult
}


test('retoma a última aula e respeita um link para outra aula', async ({ page }) => {
  await mockLearningApi(page)
  await page.goto(`/cursos/${courseId}/estudar`)
  await page.getByRole('button', { name: 'Próxima aula' }).click()
  await expect(page.getByRole('heading', { name: 'Serviços e Modelos de Nuvem', exact: true })).toBeVisible()
  await page.goto(`/cursos/${courseId}/estudar`)
  await expect(page.getByRole('heading', { name: 'Serviços e Modelos de Nuvem', exact: true })).toBeVisible()
  await page.goto(`/cursos/${courseId}/estudar?aula=1`)
  await expect(page.getByRole('heading', { name: 'Fundamentos de Cloud Computing', exact: true })).toBeVisible()
})

test('cancelar a saída conserva a avaliação e confirmar permite retomar as respostas', async ({ page }) => {
  await mockLearningApi(page)
  await page.goto(`/avaliacoes?curso=${courseId}`)
  await page.getByRole('button', { name: 'Começar avaliação' }).click()
  await page.getByRole('radio').first().check()
  await confirmNavigation(page, () => page.getByRole('button', { name: 'Fechar avaliação', exact: true }).click())
  await expect(page.getByRole('radio').first()).toBeChecked()
  await confirmNavigation(page, () => page.getByRole('button', { name: 'Voltar às aulas do curso', exact: true }).click())
  await expect(page).toHaveURL(/avaliacoes/)
  await expect(page.getByRole('radio').first()).toBeChecked()
  await confirmNavigation(page, () => page.getByRole('button', { name: 'Voltar às aulas do curso', exact: true }).click(), true)
  await expect(page).toHaveURL(/estudar/)
  // A guarda permanece ativa para recarregamento mesmo após sair do diálogo.
  expect(await page.evaluate(() => {
    const event = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(event)
    return event.defaultPrevented
  })).toBe(true)
  await page.getByRole('button', { name: 'Opções da conta', exact: true }).click()
  await confirmNavigation(page, () => page.getByRole('button', { name: 'Sair', exact: true }).click())
  await expect(page).toHaveURL(/estudar/)
  await page.keyboard.press('Escape')
  await page.getByRole('link', { name: 'Ir para avaliação', exact: true }).last().click()
  await page.getByRole('button', { name: 'Anterior', exact: true }).click()
  await expect(page.getByRole('radio').first()).toBeChecked()
  // Cancela o recarregamento real, sem perder as respostas.
  await confirmNavigation(page, () => page.evaluate(() => window.location.reload()))
  await expect(page.getByRole('radio').first()).toBeChecked()
  // Cancela também o botão Voltar do navegador.
  await confirmNavigation(page, () => page.evaluate(() => window.history.back()))
  await expect(page).toHaveURL(/avaliacoes/)
})

test('RH registra motivo e vê a autorização sem duplicar uma tentativa pendente', async ({ page }) => {
  const state = await mockLearningApi(page, 'EMPRESA')
  await page.goto('/empresa/avaliacoes')
  await page.getByRole('button', { name: /Rafael Martins/ }).click()
  const grant = page.getByRole('button', { name: 'Liberar uma tentativa extra' })
  await expect(grant).toBeDisabled()
  await page.getByRole('textbox', { name: 'Motivo da liberação' }).fill('Revisão do conteúdo acompanhada pelo RH')
  await grant.click()
  await expect(page.getByText('Uma tentativa extra foi liberada.', { exact: false })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Histórico de liberações' })).toBeVisible()
  await expect(grant).toHaveCount(0)
  expect(state.grants).toHaveLength(1)
  await page.reload()
  await page.getByRole('button', { name: /Rafael Martins/ }).click()
  await expect(page.getByText('Após a tentativa 2: Revisão do conteúdo acompanhada pelo RH')).toBeVisible()
  await expect(grant).toHaveCount(0)
})
