import { test, expect } from '@playwright/test'
import { mockLearningApi, id } from './mobile.fixture.mjs'

test('perfil da API prevalece sobre preferências locais e alterações rápidas são preservadas', async ({ page }) => {
  await mockLearningApi(page)
  await page.addInitScript(key => localStorage.setItem(key, JSON.stringify({
    objective: 'Aprimorar habilidades profissionais', difficulty: 'Intermediário', videos: false,
  })), `etp-study-settings-v1:${id(2)}`)
  let profile = { name: 'Ana', email: 'ana@example.test', phone: '', location: '', position: '',
    company: 'ETP', learningFocus: 'Explorar novos temas', experienceLevel: 'Avançado',
    notificationsEnabled: true, memberSince: '2026-01-01' }
  const writes = []
  let releaseFirst
  const firstSave = new Promise(resolve => { releaseFirst = resolve })
  await page.route('**/api/colaborador/perfil', async route => {
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON()
      writes.push(body)
      if (writes.length === 1) await firstSave
      profile = { ...profile, ...body }
    }
    await route.fulfill({ json: profile })
  })
  await page.goto('/configuracoes')
  const objective = page.getByRole('combobox', { name: 'Objetivo de aprendizagem' })
  const level = page.getByRole('combobox', { name: 'Nível de dificuldade preferido' })
  await expect(objective).toHaveValue('Explorar novos temas')
  await expect(level).toHaveValue('Avançado')
  await expect(page.getByRole('switch', { name: 'Vídeos', exact: true })).not.toBeChecked()
  await objective.selectOption('Preparar-me para uma nova função')
  await expect.poll(() => writes.length).toBe(1)
  await level.selectOption('Iniciante')
  releaseFirst()
  await expect.poll(() => writes.length).toBe(2)
  await expect(page.getByRole('status').filter({ hasText: 'Perfil de aprendizagem salvo.' })).toBeVisible()
  expect(writes[1].learningFocus).toBe('Preparar-me para uma nova função')
  await page.reload()
  await expect(objective).toHaveValue('Preparar-me para uma nova função')
  await expect(level).toHaveValue('Iniciante')
})

test('falha no salvamento restaura o valor confirmado e permite tentar novamente', async ({ page }) => {
  await mockLearningApi(page)
  let fail = true
  let profile = { name: 'Ana', email: 'ana@example.test', phone: '', location: '', position: '',
    company: 'ETP', learningFocus: '', experienceLevel: 'Avançado', notificationsEnabled: true, memberSince: null }
  await page.route('**/api/colaborador/perfil', async route => {
    if (route.request().method() === 'PUT') {
      if (fail) return route.fulfill({ status: 503, json: {} })
      profile = { ...profile, ...route.request().postDataJSON() }
    }
    await route.fulfill({ json: profile })
  })
  await page.goto('/configuracoes')
  const level = page.getByRole('combobox', { name: 'Nível de dificuldade preferido' })
  await expect(level).toHaveValue('Avançado')
  await level.selectOption('Iniciante')
  await expect(page.getByText('Não foi possível salvar o perfil de aprendizagem. Tente novamente.')).toBeVisible()
  await expect(level).toHaveValue('Avançado')
  fail = false
  await level.selectOption('Iniciante')
  await expect(page.getByText('Perfil de aprendizagem salvo.', { exact: true })).toBeVisible()
  await expect(level).toHaveValue('Iniciante')
})
