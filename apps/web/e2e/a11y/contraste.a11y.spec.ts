import { expectNoProblems } from './support/assert.ts'
import { checkTextContrast, readTextSamples } from './support/colors.ts'
import { openPage, test } from './support/fixtures.ts'

const ROTAS = ['/login', '/cadastro']

/**
 * SC 1.4.3 (Contraste mínimo, nível AA).
 *
 * O axe-core não avalia o `::placeholder` e não entende o `oklab()` que o
 * Tailwind v4 gera, então o contraste do texto dos campos é medido aqui.
 */
for (const rota of ROTAS) {
  test(`${rota}: o texto e o placeholder dos campos têm contraste suficiente`, async ({ page }) => {
    await openPage(page, rota)

    const samples = await readTextSamples(page)
    const { problems } = checkTextContrast(samples)

    const details = problems
      .map(
        (problem) =>
          `${problem.alvo} "${problem.rotulo}" (${problem.tipo}): contraste ${problem.razaoFormatada}, mínimo ${problem.minimo}:1 — texto ${problem.cor} sobre fundo ${problem.fundo}${problem.erro ? ` (${problem.erro})` : ''}`,
      )
      .join('\n')

    expectNoProblems(problems, `Texto sem contraste suficiente (WCAG 1.4.3):\n${details}`)
  })
}
