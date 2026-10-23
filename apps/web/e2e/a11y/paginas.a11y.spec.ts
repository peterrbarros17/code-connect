import { expect, openPage, test } from './support/fixtures.ts'
import { expectNoWcagViolations } from './support/axe.ts'

const ROTAS = [
  { path: '/', nome: 'Feed' },
  { path: '/posts/exemplo', nome: 'Detalhe do post' },
  { path: '/login', nome: 'Login' },
  { path: '/cadastro', nome: 'Cadastro' },
]

const VIEWPORTS = [
  { nome: 'desktop', largura: 1280, altura: 800 },
  { nome: 'tablet', largura: 768, altura: 1024 },
  { nome: 'mobile', largura: 375, altura: 667 },
]

for (const viewport of VIEWPORTS) {
  test.describe(viewport.nome, () => {
    test.use({ viewport: { width: viewport.largura, height: viewport.altura } })

    for (const rota of ROTAS) {
      test(`página de ${rota.nome} não tem violações WCAG A/AA`, async ({ page }, testInfo) => {
        await openPage(page, rota.path)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

        await expectNoWcagViolations(page, {
          context: `${rota.path} em ${viewport.nome} (${viewport.largura}x${viewport.altura})`,
          testInfo,
        })
      })
    }
  })
}

test.describe('estrutura da página', () => {
  for (const rota of ROTAS) {
    test(`${rota.path} tem título, idioma e um único título de nível 1`, async ({ page }) => {
      await openPage(page, rota.path)

      await expect(page).toHaveTitle(/\S/)
      await expect(page.locator('html')).toHaveAttribute('lang', /\S/)

      const h1 = page.getByRole('heading', { level: 1 })
      await expect(h1).toHaveCount(1)

      const main = page.getByRole('main')
      await expect(main).toHaveCount(1)
    })
  }
})
