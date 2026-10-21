import { describe, expect, it } from 'vitest'
import {
  contrastBetween,
  contrastRatio,
  parseColor,
  relativeLuminance,
  resolveBackground,
} from './contrast.ts'

describe('parseColor', () => {
  it('lê hexadecimal', () => {
    expect(parseColor('#171d1f')).toEqual({ r: 23, g: 29, b: 31, a: 1 })
    expect(parseColor('#888')).toEqual({ r: 136, g: 136, b: 136, a: 1 })
  })

  it('lê rgb e rgba', () => {
    expect(parseColor('rgb(136, 136, 136)')).toEqual({ r: 136, g: 136, b: 136, a: 1 })
    expect(parseColor('rgba(0, 0, 0, 0.5)')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 })
    expect(parseColor('rgb(136 136 136 / 0.5)')).toEqual({ r: 136, g: 136, b: 136, a: 0.5 })
  })

  it('lê oklab, que é o formato que o Tailwind v4 devolve', () => {
    const color = parseColor('oklab(0.225514 -0.00743005 -0.00622378 / 0.7)')

    expect(color).not.toBeNull()
    expect(color?.r).toBeCloseTo(23, 0)
    expect(color?.g).toBeCloseTo(29, 0)
    expect(color?.b).toBeCloseTo(31, 0)
    expect(color?.a).toBeCloseTo(0.7, 2)
  })

  it('lê color(srgb ...) e oklch', () => {
    expect(parseColor('color(srgb 1 0 0)')).toEqual({ r: 255, g: 0, b: 0, a: 1 })

    // #81fe88 (verde da marca) em oklch.
    const oklch = parseColor('oklch(0.898015 0.193308 144.8432)')
    expect(oklch?.r).toBeCloseTo(129, 0)
    expect(oklch?.g).toBeCloseTo(254, 0)
    expect(oklch?.b).toBeCloseTo(136, 0)
  })

  it('devolve null para formatos que não sabe converter', () => {
    expect(parseColor('lab(25% 2 -3 / 0.7)')).toBeNull()
    expect(parseColor('color(display-p3 1 0 0)')).toBeNull()
    expect(parseColor('')).toBeNull()
  })
})

describe('contraste', () => {
  it('calcula 21:1 entre preto e branco', () => {
    const ratio = contrastRatio(parseColor('#000000')!, parseColor('#ffffff')!)

    expect(ratio).toBeCloseTo(21, 1)
  })

  it('calcula 1:1 entre cores iguais', () => {
    const ratio = contrastRatio(parseColor('#171d1f')!, parseColor('#171d1f')!)

    expect(ratio).toBeCloseTo(1, 5)
  })

  it('usa a luminância relativa do WCAG', () => {
    expect(relativeLuminance(parseColor('#ffffff')!)).toBeCloseTo(1, 5)
    expect(relativeLuminance(parseColor('#000000')!)).toBeCloseTo(0, 5)
  })

  it('compõe as camadas de fundo antes de comparar', () => {
    const background = resolveBackground(['rgb(136, 136, 136)'])

    expect(background).toEqual({ r: 136, g: 136, b: 136, a: 1 })
  })
})

describe('contrastBetween', () => {
  it('compara um texto opaco com o fundo', () => {
    const result = contrastBetween('#171d1f', ['rgb(136, 136, 136)'])

    expect(result?.ratio).toBeCloseTo(4.82, 1)
  })

  it('compara um texto translúcido já composto com o fundo', () => {
    const result = contrastBetween('oklab(0.225514 -0.00743005 -0.00622378 / 0.7)', ['rgb(136, 136, 136)'])

    // O placeholder do Input fica abaixo de 4.5:1 sobre o campo cinza.
    expect(result?.ratio).toBeGreaterThan(2.9)
    expect(result?.ratio).toBeLessThan(3.2)
  })

  it('devolve null quando não consegue ler a cor', () => {
    expect(contrastBetween('lab(25% 2 -3)', ['rgb(136, 136, 136)'])).toBeNull()
  })
})
