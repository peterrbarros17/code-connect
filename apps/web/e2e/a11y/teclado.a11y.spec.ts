import { expectNoProblems } from './support/assert.ts'
import { expect, openPage, test } from './support/fixtures.ts'
import { focusContrast, markFocusable, tabThrough } from './support/focus.ts'

const ROTAS = ['/login', '/cadastro']

for (const rota of ROTAS) {
  test(`${rota}: todo controle interativo é alcançável pelo Tab`, async ({ page }) => {
    await openPage(page, rota)

    const focusables = await markFocusable(page)
    const stops = await tabThrough(page, focusables.length)

    const visitados = stops.map((stop) => stop.id)
    const esperados = focusables.map((focusable) => focusable.id)

    expect(
      visitados,
      `Ordem do Tab diferente da ordem do DOM em ${rota}.\nEsperado: ${esperados.join(' > ')}\nObtido: ${visitados.join(' > ')}`,
    ).toEqual(esperados)
  })

  test(`${rota}: o indicador de foco é visível e tem contraste suficiente`, async ({ page }) => {
    await openPage(page, rota)

    const focusables = await markFocusable(page)
    const stops = await tabThrough(page, focusables.length)
    const problems: string[] = []

    for (const stop of stops) {
      const label = `${stop.tag}${stop.type ? `[${stop.type}]` : ''} "${stop.name}"`

      if (stop.outlineStyle === 'none' || stop.outlineWidth < 1) {
        problems.push(
          `${label}: sem indicador de foco visível (outline-style: ${stop.outlineStyle}, outline-width: ${stop.outlineWidth}px)`,
        )
        continue
      }

      const contrast = focusContrast(stop)
      if (!contrast) {
        problems.push(`${label}: não foi possível ler a cor do indicador (${stop.outlineColor})`)
        continue
      }

      if (contrast.ratio < 3) {
        problems.push(
          `${label}: indicador de foco com contraste ${contrast.formatted} (mínimo 3:1) entre ${contrast.outline} e o fundo vizinho ${contrast.background}`,
        )
      }
    }

    expectNoProblems(problems, `Indicador de foco inadequado:\n${problems.join('\n')}`)
  })

  test(`${rota}: o elemento focado não fica encoberto pela viewport`, async ({ page }) => {
    await openPage(page, rota)

    const focusables = await markFocusable(page)
    const stops = await tabThrough(page, focusables.length)
    const problems: string[] = []

    for (const stop of stops) {
      const label = `${stop.tag}${stop.type ? `[${stop.type}]` : ''} "${stop.name}"`
      const { rect, viewport } = stop

      if (rect.top < 0 || rect.left < 0 || rect.bottom > viewport.height || rect.right > viewport.width) {
        problems.push(
          `${label}: foco encoberto ou fora da viewport (elemento ${JSON.stringify(rect)}, viewport ${JSON.stringify(viewport)})`,
        )
      }
    }

    expectNoProblems(problems, `Foco encoberto:\n${problems.join('\n')}`)
  })
}
