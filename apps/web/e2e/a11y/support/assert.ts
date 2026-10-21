import { expect } from '@playwright/test'

/**
 * Com `A11Y_REPORT_ONLY=1` o teste registra os achados sem reprovar.
 * Serve para levantar o inventário de problemas antes de exigir o verde.
 */
const REPORT_ONLY = process.env.A11Y_REPORT_ONLY === '1'

export function isReportOnly(): boolean {
  return REPORT_ONLY
}

/**
 * Falha o teste quando há problemas, com a mensagem explicando cada achado.
 * Em modo relatório apenas imprime.
 */
export function expectNoProblems<T>(problems: T[], message: string): void {
  if (problems.length === 0) {
    console.log('[a11y] sem problemas.')
    return
  }

  console.error(`[a11y] ${message}`)

  if (REPORT_ONLY) return

  expect(problems, message).toEqual([])
}
