import AxeBuilder from '@axe-core/playwright'
import type { Page, TestInfo } from '@playwright/test'
import type { AxeResults, Result } from 'axe-core'
import { expectNoProblems } from './assert.ts'

/**
 * Tags do axe-core que cobrem o WCAG 2.0, 2.1 e 2.2 nos níveis A e AA.
 *
 * - `wcag2a` / `wcag2aa`: WCAG 2.0 nível A e AA
 * - `wcag21a` / `wcag21aa`: WCAG 2.1 nível A e AA
 * - `wcag22aa`: WCAG 2.2 nível AA (o 2.2 não acrescenta critério de nível A)
 */
export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

export type AxeScanOptions = {
  /** Rótulo do contexto (ex.: "página de login em 375px"). */
  context: string
  testInfo?: TestInfo
  /** Restringe a varredura a um seletor (ex.: `form`). */
  include?: string
  /** Fora da varredura (ex.: elementos de terceiros). */
  exclude?: string
  /** Regras do axe a desligar além do padrão. */
  disableRules?: string[]
}

/** Roda o axe-core na página restrito aos critérios WCAG A + AA. */
export async function scanWcag(page: Page, options: AxeScanOptions): Promise<AxeResults> {
  const builder = new AxeBuilder({ page }).withTags(WCAG_AA_TAGS)

  if (options.include) builder.include(options.include)
  if (options.exclude) builder.exclude(options.exclude)
  if (options.disableRules?.length) builder.disableRules(options.disableRules)

  return builder.analyze()
}

function formatCheckData(data: unknown): string[] {
  if (!data || typeof data !== 'object') return []

  const info = data as Record<string, unknown>
  const lines: string[] = []

  if (typeof info.fgColor === 'string' && typeof info.bgColor === 'string') {
    lines.push(`cor do texto ${info.fgColor} sobre fundo ${info.bgColor}`)
  }
  if (typeof info.contrastRatio === 'number') {
    const expected = typeof info.expectedContrastRatio === 'string' ? info.expectedContrastRatio : '4.5'
    lines.push(`contraste ${info.contrastRatio}:1 (mínimo ${expected}:1)`)
  }
  if (typeof info.fontSize === 'string') {
    lines.push(`fonte ${info.fontSize} peso ${String(info.fontWeight ?? 'normal')}`)
  }
  if (typeof info.message === 'string') {
    lines.push(info.message)
  }

  return lines
}

/** Transforma as violações do axe em um texto legível para o relatório do Playwright. */
export function formatViolations(violations: Result[]): string {
  if (violations.length === 0) return 'Nenhuma violação encontrada.'

  return violations
    .map((violation, index) => {
      const lines: string[] = [
        `${index + 1}) ${violation.id} — ${violation.help}`,
        `   impacto: ${violation.impact ?? 'desconhecido'}`,
        `   critério: ${violation.tags.filter((tag) => tag.startsWith('wcag')).join(', ')}`,
        `   ajuda: ${violation.helpUrl}`,
      ]

      for (const node of violation.nodes) {
        lines.push(`   alvo: ${node.target.join(' ')}`)
        if (node.failureSummary) {
          lines.push(node.failureSummary.split('\n').map((line) => `     ${line}`).join('\n'))
        }
        for (const check of [...node.any, ...node.all, ...node.none]) {
          lines.push(...formatCheckData(check.data).map((line) => `     ${line}`))
        }
      }

      return lines.join('\n')
    })
    .join('\n\n')
}

/** Itens que o axe não conseguiu decidir sozinho e que pedem revisão manual. */
export function formatIncomplete(results: AxeResults): string {
  if (results.incomplete.length === 0) return ''

  const lines = ['Verificação manual necessária:']

  for (const item of results.incomplete) {
    lines.push(`- ${item.id} — ${item.help}`)
    for (const node of item.nodes) {
      lines.push(`  alvo: ${node.target.join(' ')}`)
    }
  }

  return lines.join('\n')
}

/**
 * Falha o teste quando a página tem violação de acessibilidade de nível A ou AA.
 * A mensagem traz regra, critério, alvo e dados de contraste de cada achado.
 */
export async function expectNoWcagViolations(page: Page, options: AxeScanOptions): Promise<void> {
  const results = await scanWcag(page, options)
  const { context } = options
  const incomplete = formatIncomplete(results)

  if (options.testInfo) {
    await options.testInfo.attach('axe-core', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    })
  }

  if (results.violations.length === 0) {
    console.log(`[a11y] ${context}: nenhuma violação WCAG A/AA.`)
    return
  }

  const message = [
    `${results.violations.length} violação(ões) de acessibilidade (WCAG 2.0/2.1/2.2 — níveis A e AA) em ${context}:`,
    '',
    formatViolations(results.violations),
    incomplete ? `\n\n${incomplete}` : '',
  ].join('\n')

  expectNoProblems(results.violations, message)
}
