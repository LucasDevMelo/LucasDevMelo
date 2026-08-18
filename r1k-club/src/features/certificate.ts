import { money, shortDate, memberTag } from '@/lib/format'
import { tierSpec } from '@/lib/tiers'
import type { Tier } from '@/types'
import {
  backdrop,
  canvasToBlob,
  ensureFonts,
  fitText,
  goldGradient,
  makeCanvas,
  roundRect,
  tracked,
} from './canvas'

export interface CertificateData {
  displayName: string
  username: string
  memberNumber: number
  tier: Tier
  amountPaid: number
  purchasedAt: string
}

const W = 2000
const H = 1414 // proporcao A4 paisagem

/** Secao 8 — certificado digital, pronto para download em PNG ou PDF. */
export async function renderCertificate(data: CertificateData): Promise<HTMLCanvasElement> {
  await ensureFonts()
  const [canvas, ctx] = makeCanvas(W, H)
  const spec = tierSpec(data.tier)

  backdrop(ctx, W, H)

  // ---- moldura dupla --------------------------------------------------------
  ctx.strokeStyle = goldGradient(ctx, 0, 0, W, H)
  ctx.lineWidth = 6
  roundRect(ctx, 70, 70, W - 140, H - 140, 26)
  ctx.stroke()

  ctx.globalAlpha = 0.45
  ctx.lineWidth = 2
  roundRect(ctx, 100, 100, W - 200, H - 200, 16)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.textAlign = 'center'
  const cx = W / 2

  // ---- cabecalho ------------------------------------------------------------
  ctx.fillStyle = 'rgba(220,187,92,0.65)'
  ctx.font = '600 30px Inter, sans-serif'
  tracked(ctx, 'CERTIFICADO DE MEMBRO', cx, 250, 14)

  ctx.fillStyle = goldGradient(ctx, cx - 420, 0, cx + 420, 0)
  ctx.font = '900 128px "Playfair Display", Georgia, serif'
  ctx.fillText('R$1K CLUB', cx, 400)

  ctx.strokeStyle = 'rgba(220,187,92,0.35)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - 260, 450)
  ctx.lineTo(cx + 260, 450)
  ctx.stroke()

  // ---- corpo ----------------------------------------------------------------
  ctx.fillStyle = 'rgba(251,247,234,0.55)'
  ctx.font = '400 38px Inter, sans-serif'
  ctx.fillText('Certificamos que', cx, 560)

  const nameSize = fitText(
    ctx,
    data.displayName.toUpperCase(),
    W - 420,
    (s) => `700 ${s}px "Playfair Display", Georgia, serif`,
    118,
    52,
  )
  ctx.fillStyle = goldGradient(ctx, cx - 500, 0, cx + 500, 0)
  ctx.font = `700 ${nameSize}px "Playfair Display", Georgia, serif`
  ctx.fillText(data.displayName.toUpperCase(), cx, 690)

  ctx.fillStyle = 'rgba(251,247,234,0.55)'
  ctx.font = '400 38px Inter, sans-serif'
  ctx.fillText('gastou oficialmente', cx, 780)

  ctx.fillStyle = '#fbf7ea'
  ctx.font = '700 84px "Playfair Display", Georgia, serif'
  ctx.fillText(money(data.amountPaid), cx, 878)

  ctx.fillStyle = 'rgba(251,247,234,0.55)'
  ctx.font = '400 38px Inter, sans-serif'
  ctx.fillText('para entrar no clube.', cx, 946)

  // ---- rodape em tres colunas ----------------------------------------------
  const footerY = 1150
  const columns: [string, string][] = [
    ['MEMBRO', memberTag(data.memberNumber)],
    ['STATUS', `${spec.icon} ${spec.label}`],
    ['DATA', shortDate(data.purchasedAt)],
  ]

  columns.forEach(([label, value], i) => {
    const x = W / 4 + (i * (W / 2)) / 2
    ctx.fillStyle = 'rgba(220,187,92,0.5)'
    ctx.font = '600 24px Inter, sans-serif'
    tracked(ctx, label, x, footerY - 60, 8)

    ctx.fillStyle = '#dcbb5c'
    ctx.font = '700 48px "JetBrains Mono", monospace'
    ctx.fillText(value, x, footerY)
  })

  ctx.strokeStyle = 'rgba(220,187,92,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(200, footerY + 60)
  ctx.lineTo(W - 200, footerY + 60)
  ctx.stroke()

  ctx.fillStyle = 'rgba(251,247,234,0.3)'
  ctx.font = '400 28px "JetBrains Mono", monospace'
  ctx.fillText(`r1kclub.com/u/${data.username}`, cx, footerY + 130)

  return canvas
}

export async function certificateBlob(data: CertificateData): Promise<Blob> {
  return canvasToBlob(await renderCertificate(data))
}
