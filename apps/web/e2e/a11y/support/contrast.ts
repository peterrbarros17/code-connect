/**
 * Matemática de contraste de cor (WCAG 2.x) e leitura das cores que o
 * navegador devolve em `getComputedStyle`.
 *
 * O Tailwind v4 compila `text-field-text/70` em `color-mix(in oklab, ...)`, e o
 * Chrome devolve esse valor já convertido para `oklab(...)`. O axe-core não
 * entende esse formato e ignora o elemento na regra de contraste, então o
 * contraste é calculado aqui.
 */

export type Rgba = {
  /** 0 a 255 */
  r: number
  /** 0 a 255 */
  g: number
  /** 0 a 255 */
  b: number
  /** 0 a 1 */
  a: number
}

export type ContrastResult = {
  ratio: number
  formatted: string
  foreground: Rgba
  background: Rgba
}

const NAMED_COLORS: Record<string, string> = {
  transparent: 'rgba(0, 0, 0, 0)',
  black: 'rgb(0, 0, 0)',
  white: 'rgb(255, 255, 255)',
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

type Part = {
  value: number
  /** `true` quando o número vinha com `%`. */
  percent: boolean
}

/** Lê `rgb()`, `rgba()`, `hsl()`, `hsla()`, `color(srgb ...)`, `oklab()`, `oklch()` e hex. */
export function parseColor(value: string): Rgba | null {
  const input = value.trim().toLowerCase()
  if (!input) return null

  if (NAMED_COLORS[input]) return parseColor(NAMED_COLORS[input])

  const hex = input.match(/^#([0-9a-f]{3,8})$/)
  if (hex) return parseHex(hex[1])

  const functional = input.match(/^([a-z-]+)\(([^)]*)\)$/)
  if (!functional) return null

  const name = functional[1]
  const rawParts = functional[2]
    .split('/')
    .flatMap((part) => part.trim().split(/[\s,]+/))
    .filter(Boolean)

  if (name === 'color' && !input.includes('srgb')) return null

  // Em color(srgb ...) o primeiro argumento é o espaço de cor.
  const parts = parseParts(name === 'color' ? rawParts.slice(1) : rawParts)

  if (!parts) return null

  switch (name) {
    case 'rgb':
    case 'rgba': {
      if (parts.length < 3) return null
      const channel = (part: Part) =>
        clamp(Math.round(part.percent ? (part.value / 100) * 255 : part.value), 0, 255)
      return {
        r: channel(parts[0]),
        g: channel(parts[1]),
        b: channel(parts[2]),
        a: parts.length > 3 ? clamp(alphaOf(parts[3]), 0, 1) : 1,
      }
    }
    case 'hsl':
    case 'hsla': {
      if (parts.length < 3) return null
      const hue = ((parts[0].value % 360) + 360) % 360
      const saturation = clamp(parts[1].percent ? parts[1].value / 100 : parts[1].value / 100, 0, 1)
      const lightness = clamp(parts[2].percent ? parts[2].value / 100 : parts[2].value / 100, 0, 1)
      const alpha = parts.length > 3 ? clamp(alphaOf(parts[3]), 0, 1) : 1
      const c = (1 - Math.abs(2 * lightness - 1)) * saturation
      const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
      const m = lightness - c / 2
      const [r, g, b] =
        hue < 60
          ? [c, x, 0]
          : hue < 120
            ? [x, c, 0]
            : hue < 180
              ? [0, c, x]
              : hue < 240
                ? [0, x, c]
                : hue < 300
                  ? [x, 0, c]
                  : [c, 0, x]
      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
        a: alpha,
      }
    }
    case 'color': {
      // color(srgb r g b / a)
      if (parts.length < 3) return null
      const channel = (part: Part) =>
        clamp(Math.round(part.percent ? (part.value / 100) * 255 : part.value * 255), 0, 255)
      return {
        r: channel(parts[0]),
        g: channel(parts[1]),
        b: channel(parts[2]),
        a: parts.length > 3 ? clamp(alphaOf(parts[3]), 0, 1) : 1,
      }
    }
    case 'oklab': {
      if (parts.length < 3) return null
      const { r, g, b } = oklabToSrgb(parts[0].value, parts[1].value, parts[2].value)
      return { r, g, b, a: parts.length > 3 ? clamp(alphaOf(parts[3]), 0, 1) : 1 }
    }
    case 'oklch': {
      if (parts.length < 3) return null
      const { L, a, b } = oklchToOklab(parts[0].value, parts[1].value, parts[2].value)
      const { r, g, b: blue } = oklabToSrgb(L, a, b)
      return { r, g, b: blue, a: parts.length > 3 ? clamp(alphaOf(parts[3]), 0, 1) : 1 }
    }
    default:
      // Formatos ainda não suportados (lab, lch, hwb, color(display-p3 ...)).
      // Retornar null é melhor do que chutar um valor errado.
      return null
  }
}

function parseParts(raw: string[]): Part[] | null {
  const parts: Part[] = []

  for (const item of raw) {
    const percent = item.endsWith('%')
    const value = Number.parseFloat(item)
    if (Number.isNaN(value)) return null
    parts.push({ value, percent })
  }

  return parts
}

/** Alfa: número puro vale 0 a 1, porcentagem vale 0 a 100. */
function alphaOf(part: Part): number {
  return part.percent ? part.value / 100 : part.value
}

function parseHex(digits: string): Rgba | null {
  const expand =
    digits.length <= 4
      ? digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : digits

  if (expand.length !== 6 && expand.length !== 8) return null

  const r = Number.parseInt(expand.slice(0, 2), 16)
  const g = Number.parseInt(expand.slice(2, 4), 16)
  const b = Number.parseInt(expand.slice(4, 6), 16)
  const a = expand.length === 8 ? Number.parseInt(expand.slice(6, 8), 16) / 255 : 1

  if ([r, g, b].some(Number.isNaN)) return null

  return { r, g, b, a }
}

function gamma(channel: number): number {
  const value = channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055
  return clamp(value, 0, 1) * 255
}

export function oklabToSrgb(L: number, a: number, b: number): { r: number; g: number; b: number } {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3

  return {
    r: gamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: gamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: gamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  }
}

export function oklchToOklab(L: number, C: number, H: number): { L: number; a: number; b: number } {
  const hue = (H * Math.PI) / 180
  return { L, a: C * Math.cos(hue), b: C * Math.sin(hue) }
}

/** Luminância relativa conforme WCAG 2.x (canais sRGB). */
export function relativeLuminance(color: Rgba): number {
  const channel = (value: number) => {
    const srgb = value / 255
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b)
}

/** Razão de contraste entre duas cores, de 1:1 a 21:1. */
export function contrastRatio(foreground: Rgba, background: Rgba): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)

  return (lighter + 0.05) / (darker + 0.05)
}

/** Compõe uma camada com alfa sobre um fundo. */
export function compositeOver(foreground: Rgba, background: Rgba): Rgba {
  const alpha = foreground.a

  return {
    r: foreground.r * alpha + background.r * (1 - alpha),
    g: foreground.g * alpha + background.g * (1 - alpha),
    b: foreground.b * alpha + background.b * (1 - alpha),
    a: 1,
  }
}

/**
 * Resolve a cor de fundo efetiva a partir das camadas empilhadas
 * (da mais interna para a mais externa).
 */
export function resolveBackground(layers: string[], fallback: Rgba = { r: 255, g: 255, b: 255, a: 1 }): Rgba {
  const parsed = layers.map(parseColor).filter((color): color is Rgba => color !== null)

  let result = fallback
  for (let index = parsed.length - 1; index >= 0; index -= 1) {
    result = compositeOver(parsed[index], result)
  }

  return result
}

/** Formata a razão de contraste com duas casas decimais. */
export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`
}

/** Formata uma cor como `rgb(r, g, b)` para o relatório. */
export function formatColor(color: Rgba): string {
  return `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`
}

/**
 * Calcula o contraste entre o texto e o fundo, já considerando as camadas
 * translúcidas. Retorna `null` quando alguma cor não pode ser lida.
 */
export function contrastBetween(
  foreground: string,
  backgroundLayers: string[],
): ContrastResult | null {
  const parsedForeground = parseColor(foreground)
  if (!parsedForeground) return null

  const background = resolveBackground(backgroundLayers)
  const composed = compositeOver(parsedForeground, background)
  const ratio = contrastRatio(composed, background)

  return {
    ratio,
    formatted: formatRatio(ratio),
    foreground: composed,
    background,
  }
}
