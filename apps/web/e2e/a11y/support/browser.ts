import type { Page } from '@playwright/test'

declare global {
  interface Window {
    /** Helpers de cor instalados no navegador pelos testes de acessibilidade. */
    a11yColors: {
      /** Alfa de uma cor computada (0 a 1). */
      alphaOf: (color: string) => number
      /** Camadas de fundo empilhadas a partir de um elemento (da interna para a externa). */
      backgroundLayers: (start: Element | null) => string[]
    }
  }
}

/**
 * Instala no navegador os helpers de leitura de cor.
 *
 * O `getComputedStyle` devolve a cor final já normalizada (`rgb(...)`,
 * `oklab(...)`), então não é preciso converter nada no lado do navegador.
 */
export async function installColorHelpers(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const alphaOf = (color: string): number => {
      const match = color.match(/^rgba?\(([^)]+)\)$/)
      if (!match) return 1

      const parts = match[1].split(/[,\s/]+/).filter(Boolean).map(Number)
      return parts.length === 4 ? parts[3] : 1
    }

    const backgroundLayers = (start: Element | null): string[] => {
      const layers: string[] = []
      let current: Element | null = start

      while (current) {
        const background = getComputedStyle(current).backgroundColor
        const alpha = alphaOf(background)

        if (alpha > 0) {
          layers.push(background)
          if (alpha === 1) break
        }

        current = current.parentElement
      }

      return layers
    }

    window.a11yColors = { alphaOf, backgroundLayers }
  })
}
