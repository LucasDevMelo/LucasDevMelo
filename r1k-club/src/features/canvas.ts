/**
 * Helpers de desenho compartilhados entre o certificado (secao 8) e o social
 * card (secao 9). Tudo em canvas puro: o navegador gera a imagem, sem servidor
 * e sem dependencia de renderizacao externa.
 */

export interface Palette {
  bg: string
  goldStops: [number, string][]
  paper: string
}

export const PALETTE: Palette = {
  bg: '#050505',
  goldStops: [
    [0, '#754f13'],
    [0.22, '#dcbb5c'],
    [0.45, '#fbf7ea'],
    [0.68, '#dcbb5c'],
    [1, '#9c6c17'],
  ],
  paper: '#0a0a0b',
}

/** Espera as webfonts para o canvas nao cair no fallback do sistema. */
export async function ensureFonts(): Promise<void> {
  if (!('fonts' in document)) return
  try {
    await Promise.all([
      document.fonts.load('700 80px "Playfair Display"'),
      document.fonts.load('900 120px "Playfair Display"'),
      document.fonts.load('600 40px Inter'),
      document.fonts.load('700 40px "JetBrains Mono"'),
      document.fonts.ready,
    ])
  } catch {
    /* segue com o fallback */
  }
}

export function goldGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): CanvasGradient {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  for (const [stop, color] of PALETTE.goldStops) g.addColorStop(stop, color)
  return g
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Texto centralizado com espacamento entre letras (canvas nao tem letterSpacing universal). */
export function tracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  spacing: number,
): void {
  const chars = [...text]
  const width =
    chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0) + spacing * (chars.length - 1)

  let x = cx - width / 2
  for (const ch of chars) {
    ctx.fillText(ch, x, y)
    x += ctx.measureText(ch).width + spacing
  }
}

/** Encaixa o texto em maxWidth reduzindo o corpo da fonte. */
export function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: (size: number) => string,
  startSize: number,
  minSize = 24,
): number {
  let size = startSize
  ctx.font = font(size)
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2
    ctx.font = font(size)
  }
  return size
}

export function backdrop(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = PALETTE.bg
  ctx.fillRect(0, 0, w, h)

  // brilho dourado no topo
  const glow = ctx.createRadialGradient(w / 2, -h * 0.15, 0, w / 2, -h * 0.15, h * 0.85)
  glow.addColorStop(0, 'rgba(220,187,92,0.20)')
  glow.addColorStop(1, 'rgba(220,187,92,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  // vinheta
  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.85)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.65)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, w, h)
}

export function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d indisponível neste navegador')
  ctx.textBaseline = 'alphabetic'
  return [canvas, ctx]
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('falha ao gerar a imagem'))
    }, 'image/png')
  })
}
