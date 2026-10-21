import type { Page } from '@playwright/test'
import { contrastBetween, formatColor } from './contrast.ts'

export type FocusIndicator = {
  /** Marcador estável (`data-a11y-id`) atribuído ao elemento focável. */
  id: string
  tag: string
  type: string
  name: string
  outlineStyle: string
  outlineWidth: number
  outlineColor: string
  /** Retângulo do elemento na viewport, para checar se o foco fica encoberto. */
  rect: { top: number; left: number; right: number; bottom: number }
  viewport: { width: number; height: number }
  /** Camadas de fundo dentro do elemento (da mais interna para a externa). */
  insideLayers: string[]
  /** Camadas de fundo fora do elemento (vizinhas do contorno). */
  outsideLayers: string[]
}

export type FocusableElement = {
  id: string
  tag: string
  type: string
  name: string
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'iframe',
  'summary',
  '[tabindex]',
  '[contenteditable="true"]',
].join(',')

/**
 * Marca os controles focáveis da página com `data-a11y-id` e devolve a lista.
 * O marcador permite comparar a ordem do Tab com o conjunto de controles.
 */
export async function markFocusable(page: Page): Promise<FocusableElement[]> {
  return page.evaluate((selector) => {
    const elements = Array.from(document.querySelectorAll(selector)).filter((element) => {
      const html = element as HTMLElement
      if (html.hasAttribute('disabled')) return false
      if (html.getAttribute('tabindex') === '-1') return false
      if (html.getAttribute('aria-hidden') === 'true') return false
      return html.getClientRects().length > 0
    })

    return elements.map((element, index) => {
      const html = element as HTMLElement
      const id = `f${index}`
      html.setAttribute('data-a11y-id', id)

      const label = html.getAttribute('aria-label') ?? html.textContent ?? ''

      return {
        id,
        tag: html.tagName.toLowerCase(),
        type: html.getAttribute('type') ?? '',
        name: label.replace(/\s+/g, ' ').trim(),
      }
    })
  }, FOCUSABLE_SELECTOR)
}

/** Lê o indicador de foco do elemento que está com foco no momento. */
export async function readFocusIndicator(page: Page): Promise<FocusIndicator | null> {
  return page.evaluate(() => {
    const element = document.activeElement
    if (!element || element === document.body) return null

    const html = element as HTMLElement
    const style = getComputedStyle(html)
    const rect = html.getBoundingClientRect()

    return {
      id: html.getAttribute('data-a11y-id') ?? '',
      tag: html.tagName.toLowerCase(),
      type: html.getAttribute('type') ?? '',
      name: (html.getAttribute('aria-label') ?? html.textContent ?? '').replace(/\s+/g, ' ').trim(),
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth) || 0,
      outlineColor: style.outlineColor,
      rect: { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      insideLayers: window.a11yColors.backgroundLayers(html),
      outsideLayers: window.a11yColors.backgroundLayers(html.parentElement),
    }
  })
}

/** Percorre a página com Tab e devolve o indicador de foco de cada parada. */
export async function tabThrough(page: Page, limit: number): Promise<FocusIndicator[]> {
  const stops: FocusIndicator[] = []

  for (let index = 0; index < limit; index += 1) {
    await page.keyboard.press('Tab')
    const indicator = await readFocusIndicator(page)
    if (indicator) stops.push(indicator)
  }

  return stops
}

/**
 * Contraste do indicador de foco contra a cor vizinha de fora do controle.
 * SC 1.4.11 (Non-text Contrast, nível AA) pede 3:1 para o indicador de foco.
 */
export function focusContrast(indicator: FocusIndicator): {
  ratio: number
  formatted: string
  outline: string
  background: string
} | null {
  const result = contrastBetween(indicator.outlineColor, indicator.outsideLayers)
  if (!result) return null

  return {
    ratio: result.ratio,
    formatted: result.formatted,
    outline: formatColor(result.foreground),
    background: formatColor(result.background),
  }
}
