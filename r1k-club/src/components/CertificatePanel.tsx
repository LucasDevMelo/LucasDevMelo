import { useEffect, useRef, useState } from 'react'
import { Button, Spinner } from './ui'
import { renderCertificate, type CertificateData } from '@/features/certificate'
import { downloadCanvasPdf, downloadCanvasPng } from '@/features/download'
import { track } from '@/lib/analytics'

/** Secao 8 — certificado digital com download em PNG e PDF. */
export function CertificatePanel({ data }: { data: CertificateData }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [pdfBusy, setPdfBusy] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let alive = true
    let url: string | null = null

    renderCertificate(data)
      .then((canvas) => {
        if (!alive) return
        canvasRef.current = canvas
        url = canvas.toDataURL('image/png')
        setPreview(url)
      })
      .catch((err) => console.error('certificado', err))

    return () => {
      alive = false
    }
  }, [data])

  async function handlePng() {
    if (!canvasRef.current) return
    track('certificate_downloaded', { format: 'png' })
    await downloadCanvasPng(canvasRef.current, `certificado-r1k-${data.username}.png`)
  }

  async function handlePdf() {
    if (!canvasRef.current) return
    setPdfBusy(true)
    track('certificate_downloaded', { format: 'pdf' })
    try {
      await downloadCanvasPdf(canvasRef.current, `certificado-r1k-${data.username}.pdf`)
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <div className="surface overflow-hidden">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="font-display text-lg">Seu certificado</h3>
      </div>

      <div className="p-5">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/50">
          {preview ? (
            <img
              src={preview}
              alt={`Certificado de membro de ${data.displayName}`}
              className="w-full"
            />
          ) : (
            <div className="flex aspect-[2000/1414] items-center justify-center">
              <Spinner className="text-gold-300" />
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button onClick={handlePng} disabled={!preview}>
            Baixar PNG
          </Button>
          <Button variant="ghost" onClick={handlePdf} disabled={!preview} loading={pdfBusy}>
            Baixar PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
