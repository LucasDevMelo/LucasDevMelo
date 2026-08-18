import { money, memberTag } from '@/lib/format'
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

export type ShareFormat = 'story' | 'post'

export interface ShareCardData {
  displayName: string
  username: string
  memberNumber: number
  tier: Tier
  amountPaid: number
}

interface Layout {
  w: number
  h: number
  /** proporcao da altura do cartao em relacao a largura dele */
  cardRatio: number
  /** topo do cartao */
  cardTop: number
  /** distancia do rodape do cartao ate a linha do valor investido */
  investedGap: number
  /** linha da provocacao final, medida a partir do rodape */
  tagFromBottom: number
}

const LAYOUT: Record<ShareFormat, Layout> = {
  story: { w: 1080, h: 1920, cardRatio: 0.63, cardTop: 540, investedGap: 160, tagFromBottom: 260 },
  post: { w: 1080, h: 1080, cardRatio: 0.6, cardTop: 190, investedGap: 122, tagFromBottom: 112 },
}

/**
 * Secao 9 — o motor de crescimento. Gera a imagem que a pessoa posta.
 * A copy fecha com a provocacao: "CAN YOU AFFORD TO JOIN?".
 */
export async function renderShareCard(
  data: ShareCardData,
  format: ShareFormat = 'story',
): Promise<HTMLCanvasElement> {
  await ensureFonts()
  const layout = LAYOUT[format]
  const { w: W, h: H } = layout
  const [canvas, ctx] = makeCanvas(W, H)
  const spec = tierSpec(data.tier)

  backdrop(ctx, W, H)

  ctx.textAlign = 'center'
  const cx = W / 2

  // Cartao central com proporcao de cartao de credito.
  const cardW = W * 0.84
  const cardH = cardW * layout.cardRatio
  const cardX = (W - cardW) / 2
  const cardY = layout.cardTop

  ctx.save()
  ctx.shadowColor = 'rgba(220,187,92,0.28)'
  ctx.shadowBlur = 70
  ctx.shadowOffsetY = 26
  const face = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH)
  face.addColorStop(0, '#15130d')
  face.addColorStop(0.5, '#241d0f')
  face.addColorStop(1, '#0d0b07')
  ctx.fillStyle = face
  roundRect(ctx, cardX, cardY, cardW, cardH, 44)
  ctx.fill()
  ctx.restore()

  ctx.strokeStyle = goldGradient(ctx, cardX, cardY, cardX + cardW, cardY + cardH)
  ctx.lineWidth = 3
  roundRect(ctx, cardX, cardY, cardW, cardH, 44)
  ctx.stroke()

  // Conteudo do cartao
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(220,187,92,0.7)'
  ctx.font = '600 26px Inter, sans-serif'
  ctx.fillText('R$1K CLUB', cardX + 56, cardY + 84)

  ctx.textAlign = 'right'
  ctx.font = '700 34px "JetBrains Mono", monospace'
  ctx.fillStyle = '#dcbb5c'
  ctx.fillText(memberTag(data.memberNumber), cardX + cardW - 56, cardY + 84)

  ctx.textAlign = 'left'
  const nameSize = fitText(
    ctx,
    data.displayName.toUpperCase(),
    cardW - 112,
    (s) => `700 ${s}px "Playfair Display", Georgia, serif`,
    72,
    34,
  )
  ctx.fillStyle = goldGradient(ctx, cardX, 0, cardX + cardW, 0)
  ctx.font = `700 ${nameSize}px "Playfair Display", Georgia, serif`
  ctx.fillText(data.displayName.toUpperCase(), cardX + 56, cardY + cardH - 132)

  const handleSize = fitText(
    ctx,
    `@${data.username}`,
    cardW * 0.46,
    (s) => `500 ${s}px Inter, sans-serif`,
    30,
    18,
  )
  ctx.fillStyle = 'rgba(251,247,234,0.5)'
  ctx.font = `500 ${handleSize}px Inter, sans-serif`
  ctx.fillText(`@${data.username}`, cardX + 56, cardY + cardH - 84)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#fbf7ea'
  ctx.font = '700 46px "Playfair Display", Georgia, serif'
  ctx.fillText(`${spec.icon} ${spec.label}`, cardX + cardW - 56, cardY + cardH - 84)

  // Chamada acima do cartao
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(220,187,92,0.55)'
  ctx.font = '600 30px Inter, sans-serif'
  tracked(ctx, 'MEMBRO OFICIAL', cx, cardY - 96, 16)

  // Valor investido
  const investedLine = `${money(data.amountPaid)} INVESTIDOS`
  const investedSize = fitText(
    ctx,
    investedLine,
    W * 0.86,
    (s) => `900 ${s}px "Playfair Display", Georgia, serif`,
    96,
    48,
  )
  ctx.fillStyle = goldGradient(ctx, cx - 320, 0, cx + 320, 0)
  ctx.font = `900 ${investedSize}px "Playfair Display", Georgia, serif`
  ctx.fillText(investedLine, cx, cardY + cardH + layout.investedGap)

  // Provocacao final
  const tagY = H - layout.tagFromBottom
  const tagSize = fitText(
    ctx,
    'VOCÊ PODE PAGAR PARA ENTRAR?',
    W * 0.88,
    (s) => `700 ${s}px "Playfair Display", Georgia, serif`,
    46,
    28,
  )
  ctx.fillStyle = 'rgba(251,247,234,0.85)'
  ctx.font = `700 ${tagSize}px "Playfair Display", Georgia, serif`
  ctx.fillText('VOCÊ PODE PAGAR PARA ENTRAR?', cx, tagY)

  ctx.fillStyle = 'rgba(220,187,92,0.55)'
  ctx.font = '400 30px "JetBrains Mono", monospace'
  ctx.fillText(`r1kclub.com/u/${data.username}`, cx, tagY + 62)

  return canvas
}

export async function shareCardBlob(
  data: ShareCardData,
  format: ShareFormat = 'story',
): Promise<Blob> {
  return canvasToBlob(await renderShareCard(data, format))
}
