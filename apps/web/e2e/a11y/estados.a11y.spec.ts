import { expect, openPage, test } from './support/fixtures.ts'
import { expectNoWcagViolations } from './support/axe.ts'

/**
 * A página muda de aparência conforme o estado: campo preenchido, campo em
 * erro e elemento focado. Cada estado é varrido de novo porque cor, foco e
 * texto podem alterar o resultado do axe.
 */
test.describe('estados interativos', () => {
  test('login com campos preenchidos não tem violações WCAG A/AA', async ({ page }, testInfo) => {
    await openPage(page, '/login')

    await page.getByLabel('Email').fill('usuario123')
    await page.getByLabel('Senha').fill('segredo-secreto')
    await page.getByRole('checkbox', { name: 'Lembrar-me' }).check()

    await expectNoWcagViolations(page, { context: '/login preenchido', testInfo })
  })

  test('login com campos inválidos não tem violações WCAG A/AA', async ({ page }, testInfo) => {
    await openPage(page, '/login')

    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByLabel('Email')).toBeFocused()

    await expectNoWcagViolations(page, { context: '/login com erro de validação', testInfo })
  })

  test('cadastro com campos preenchidos não tem violações WCAG A/AA', async ({ page }, testInfo) => {
    await openPage(page, '/cadastro')

    await page.getByLabel('Nome').fill('Ana Souza')
    await page.getByLabel('Email').fill('ana@email.com')
    await page.getByLabel('Senha').fill('segredo-secreto')

    await expectNoWcagViolations(page, { context: '/cadastro preenchido', testInfo })
  })

  test('campo focado não tem violações WCAG A/AA', async ({ page }, testInfo) => {
    await openPage(page, '/login')

    for (const campo of ['Email', 'Senha']) {
      await page.getByLabel(campo).focus()
      await expectNoWcagViolations(page, { context: `/login com foco em "${campo}"`, testInfo })
    }
  })

  test('botão focado não tem violações WCAG A/AA', async ({ page }, testInfo) => {
    await openPage(page, '/login')

    await page.getByRole('button', { name: 'Login' }).focus()
    await expectNoWcagViolations(page, { context: '/login com foco no botão', testInfo })
  })
})
