import { canvasToBlob } from './canvas'

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoga no proximo tick para o Safari conseguir iniciar o download.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string) {
  downloadBlob(await canvasToBlob(canvas), filename)
}

export async function downloadCanvasPdf(canvas: HTMLCanvasElement, filename: string) {
  // jsPDF entra sob demanda: sao ~350kb que so quem baixa o PDF precisa.
  const { jsPDF } = await import('jspdf')
  const landscape = canvas.width >= canvas.height

  const pdf = new jsPDF({
    orientation: landscape ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  })

  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height)
  pdf.save(filename)
}

/**
 * Compartilhamento nativo (Web Share API nivel 2). Volta para false quando o
 * dispositivo nao suporta, e ai a UI cai para os botoes por rede.
 */
export async function shareImage(blob: Blob, filename: string, text: string): Promise<boolean> {
  const file = new File([blob], filename, { type: 'image/png' })

  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text })
      return true
    } catch (err) {
      // AbortError = usuario fechou a folha de compartilhamento.
      if (err instanceof Error && err.name === 'AbortError') return true
      return false
    }
  }

  return false
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
