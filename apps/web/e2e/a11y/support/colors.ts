import type { Page } from '@playwright/test'
import { contrastBetween, formatColor } from './contrast.ts'

export type TextSample = {
  /** Identificador legível do campo (tag, tipo e id). */
  alvo: string
  /** Nome acessível do campo. */
  rotulo: string
  /** `texto` é o que o usuário digita; `placeholder` é a dica do campo. */
  tipo: 'texto' | 'placeholder'
  cor: string
  fundo: string[]
  fontSize: number
  fontWeight: number
  /** Razão mínima exigida pelo WCAG 1.4.3 para o tamanho da fonte. */
  minimo: number
}

export type TextContrast = {
  alvo: string
  rotulo: string
  tipo: 'texto' | 'placeholder'
  cor: string
  fundo: string
  razao: number
  razaoFormatada: string
  minimo: number
  erro?: string
}

/**
 * WCAG 1.4.3: 4.5:1 para texto normal, 3:1 para texto grande
 * (24px, ou 18.66px em negrito).
 */
function minimumRatio(fontSize: number, fontWeight: number): number {
  const bold = fontWeight >= 700
  return fontSize >= 24 || (bold && fontSize >= 18.66) ? 3 : 4.5
}

/**
 * Lê as cores do texto e do placeholder dos campos do formulário.
 *
 * O axe-core não considera o `::placeholder` e não entende o formato `oklab()`
 * que o Tailwind v4 gera, então essa checagem é feita aqui.
 */
export async function readTextSamples(page: Page): Promise<TextSample[]> {
  const raw = await page.evaluate(() => {
    const fields = Array.from(document.querySelectorAll('input, textarea, select'))

    return fields.map((element) => {
      const html = element as HTMLInputElement
      const style = getComputedStyle(html)
      const placeholder = getComputedStyle(html, '::placeholder')
      const label =
        html.getAttribute('aria-label') ??
        html.labels?.[0]?.textContent?.replace(/\s+/g, ' ').trim() ??
        html.name ??
        html.id

      return {
        alvo: `${html.tagName.toLowerCase()}${html.getAttribute('type') ? `[${html.getAttribute('type')}]` : ''}#${html.id || html.name || 'sem-id'}`,
        rotulo: label ?? '',
        cor: style.color,
        corPlaceholder: placeholder.color,
        fundo: window.a11yColors.backgroundLayers(html),
        fontSize: Number.parseFloat(style.fontSize) || 16,
        fontWeight: Number.parseInt(style.fontWeight, 10) || 400,
        temPlaceholder: html.hasAttribute('placeholder'),
      }
    })
  })

  const samples: TextSample[] = []

  for (const field of raw) {
    const minimo = minimumRatio(field.fontSize, field.fontWeight)

    samples.push({
      alvo: field.alvo,
      rotulo: field.rotulo,
      tipo: 'texto',
      cor: field.cor,
      fundo: field.fundo,
      fontSize: field.fontSize,
      fontWeight: field.fontWeight,
      minimo,
    })

    if (field.temPlaceholder) {
      samples.push({
        alvo: field.alvo,
        rotulo: field.rotulo,
        tipo: 'placeholder',
        cor: field.corPlaceholder,
        fundo: field.fundo,
        fontSize: field.fontSize,
        fontWeight: field.fontWeight,
        minimo,
      })
    }
  }

  return samples
}

/** Calcula o contraste de cada amostra e devolve também as que falharam. */
export function checkTextContrast(samples: TextSample[]): {
  results: TextContrast[]
  problems: TextContrast[]
} {
  const results: TextContrast[] = []
  const problems: TextContrast[] = []

  for (const sample of samples) {
    const result = contrastBetween(sample.cor, sample.fundo)

    if (!result) {
      const problem: TextContrast = {
        alvo: sample.alvo,
        rotulo: sample.rotulo,
        tipo: sample.tipo,
        cor: sample.cor,
        fundo: sample.fundo.join(' sobre '),
        razao: 0,
        razaoFormatada: 'n/d',
        minimo: sample.minimo,
        erro: `não foi possível ler a cor "${sample.cor}"`,
      }
      results.push(problem)
      problems.push(problem)
      continue
    }

    const item: TextContrast = {
      alvo: sample.alvo,
      rotulo: sample.rotulo,
      tipo: sample.tipo,
      cor: formatColor(result.foreground),
      fundo: formatColor(result.background),
      razao: result.ratio,
      razaoFormatada: result.formatted,
      minimo: sample.minimo,
    }

    results.push(item)

    if (item.razao < item.minimo) {
      problems.push(item)
    }
  }

  return { results, problems }
}
