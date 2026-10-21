import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { installColorHelpers } from './browser.ts'

/**
 * Sem transição nem animação o estado final é o estado medido.
 * O `transition` das classes do Tailwind anima a cor do contorno do foco e
 * fazia a medição de contraste pegar um valor intermediário.
 */
const SEM_MOVIMENTO = `
  *, *::before, *::after {
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
`

export const test = base.extend({
  // O parâmetro do fixture não pode se chamar `use`: o oxlint trata como hook do React.
  page: async ({ page }, apply) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await page.addInitScript((css) => {
      const attach = () => {
        const style = document.createElement('style')
        style.setAttribute('data-a11y', 'sem-movimento')
        style.textContent = css
        document.head.appendChild(style)
      }

      if (document.head) attach()
      else document.addEventListener('DOMContentLoaded', attach, { once: true })
    }, SEM_MOVIMENTO)

    await installColorHelpers(page)

    await apply(page)
  },
})

/** Abre uma rota e espera a página ficar pronta para medir. */
export async function openPage(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await page.evaluate(() => document.fonts.ready)
}

export { expect }
