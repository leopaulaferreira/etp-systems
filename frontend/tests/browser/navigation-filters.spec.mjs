import { test, expect } from '@playwright/test'
import { mockLearningApi } from './mobile.fixture.mjs'

test('perfil abre conta e preferências nas seções corretas', async ({ page }) => {
  await mockLearningApi(page)
  await page.goto('/perfil')
  await page.getByRole('link', { name: 'Editar informações' }).click()
  await expect(page).toHaveURL(/secao=conta/)
  await page.goBack()
  await page.getByRole('link', { name: /Notificações Ativadas/ }).click()
  await expect(page).toHaveURL(/secao=notificacoes/)
})

test('catálogo preserva busca e ordenação ao navegar e recarregar e recupera erro', async ({ page }) => {
  await mockLearningApi(page)
  await page.goto('/cursos')
  await page.getByRole('searchbox', { name: 'Buscar cursos no catálogo' }).fill('Cloud')
  await page.getByLabel('Ordenar por', { exact: true }).selectOption('title')
  await expect(page).toHaveURL(/ordem=title/)
  const menu = page.getByRole('button', { name: 'Abrir menu', exact: true })
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('link', { name: 'Perfil', exact: true }).click()
  await expect(page).toHaveURL(/\/perfil$/)
  await page.goBack()
  await expect(page.getByRole('searchbox', { name: 'Buscar cursos no catálogo' })).toHaveValue('Cloud')
  await page.reload()
  await expect(page.getByLabel('Ordenar por', { exact: true })).toHaveValue('title')
  let fail = true
  await page.route('**/api/cursos', route => fail ? route.fulfill({ status: 503, json: {} }) : route.fallback())
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar o catálogo')
  fail = false
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByRole('searchbox', { name: 'Buscar cursos no catálogo' })).toHaveValue('Cloud')
})

test('RH preserva filtros e limpa todos de uma vez', async ({ page }) => {
  await mockLearningApi(page, 'EMPRESA')
  await page.goto('/empresa/colaboradores?busca=Rafael&situacao=completed&area=Tecnologia')
  await expect(page.getByLabel('Buscar colaborador')).toHaveValue('Rafael')
  await page.reload()
  await expect(page.getByLabel('Situação', { exact: true })).toHaveValue('completed')
  await page.getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(page).toHaveURL(/\/empresa\/colaboradores$/)
  await expect(page.getByLabel('Buscar colaborador')).toHaveValue('')
})
