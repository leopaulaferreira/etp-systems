import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { mockLearningApi, id, courseId } from './mobile.fixture.mjs'

const issued = { id: id(401), courseId, holderName: 'Rafael Martins', title: 'Fundamentos da Gestão do Tempo', description: 'Formação concluída', durationHours: 3.5, code: `ETP-${'A'.repeat(32)}`, issuedAt: '2026-10-26T12:00:00Z' }
async function setup(page, complete = true) {
  await mockLearningApi(page, 'EMPRESA')
  await page.route('**/api/empresa/painel', route => route.fulfill({ json: { companyId: id(90), companyName: 'ETP Demonstração', employees: [{ id: id(2), companyId: id(90), name: 'Rafael Martins', email: 'etp@gmail.com', department: 'Tecnologia', courses: [{ id: courseId, title: issued.title, category: 'Produtividade', progress: 100, score: 100, updatedAt: issued.issuedAt, completedAt: issued.issuedAt, certificateCode: issued.code, certificateIssuedAt: issued.issuedAt, ...(complete ? { certificate: issued } : {}) }] }] } }))
}
async function fits(page) {
  expect(await page.locator('html, main, dialog[open]').evaluateAll(elements => elements.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.tagName))).toEqual([])
}

test('RH vê miniatura, amplia e baixa o certificado emitido para Rafael', async ({ page }, testInfo) => {
  await setup(page)
  await page.goto('/empresa/certificados')
  const card = page.getByRole('button', { name: `Ver certificado de Rafael Martins: ${issued.title}` })
  const thumbnail = card.locator('img[src^="data:image/svg+xml"]')
  await expect(thumbnail).toBeVisible()
  const source = await thumbnail.getAttribute('src')
  const svg = decodeURIComponent(source.split(',').slice(1).join(','))
  expect(svg).toContain(issued.code)
  expect(svg).toContain('Rafael Martins')
  expect(svg).not.toContain('RH ETP')
  await fits(page)
  await page.screenshot({ path: testInfo.outputPath('miniatura.png') })
  await card.click()
  const dialog = page.getByRole('dialog', { name: 'Certificado de conclusão' })
  await expect(dialog.locator('img[src^="data:image/svg+xml"]')).toHaveAttribute('src', source)
  await expect(dialog).toContainText('Carga horária: 3.5 horas')
  await expect(dialog).toContainText('26/10/2026')
  const viewport = page.getByRole('region', { name: 'Visualização do certificado' })
  async function entireDocumentFits() {
    expect(await dialog.evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true)
    expect(await viewport.evaluate(el => el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1)).toBe(true)
    const image = await dialog.locator('img[src^="data:image/svg+xml"]').boundingBox()
    const area = await viewport.boundingBox()
    expect(image.height).toBeGreaterThan(0)
    expect(image.y).toBeGreaterThanOrEqual(area.y)
    expect(image.y + image.height).toBeLessThanOrEqual(area.y + area.height)
  }
  await entireDocumentFits()
  await fits(page)
  await page.screenshot({ path: testInfo.outputPath('certificado.png') })
  await page.getByLabel('Ampliação', { exact: true }).selectOption('200')
  const region = page.getByRole('region', { name: 'Visualização do certificado' })
  expect(await region.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true)
  await fits(page)
  await region.focus()
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => region.evaluate(el => el.scrollLeft)).toBeGreaterThan(0)
  await page.getByLabel('Ampliação', { exact: true }).selectOption('fit')
  await entireDocumentFits()
  await fits(page)
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Baixar PDF', exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe(`certificado-${issued.id}.pdf`)
  const pdf = await readFile(await download.path(), 'utf8')
  expect(pdf).toContain(issued.code)
  expect(pdf).toContain('Rafael Martins')
  expect(pdf).not.toContain('RH ETP')
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(card).toBeFocused()
})

test('RH mantém os detalhes quando os dados completos do documento não estão disponíveis', async ({ page }) => {
  await setup(page, false)
  await page.goto('/empresa/certificados')
  await expect(page.getByText('Ver detalhes', { exact: true })).toBeVisible()
  await expect(page.locator('main img[src^="data:image/svg+xml"]')).toHaveCount(0)
  await page.getByRole('button', { name: /Ver certificado de Rafael Martins/ }).click()
  await expect(page.getByRole('dialog')).toContainText(issued.code)
  await expect(page.getByRole('button', { name: 'Baixar PDF' })).toHaveCount(0)
  await fits(page)
})
