import { useEffect, useRef, useState } from 'react'
import { Button, Spinner } from './ui'
import { renderShareCard, type ShareFormat } from '@/features/shareCard'
import { canvasToBlob } from '@/features/canvas'
import { copyText, downloadBlob, shareImage } from '@/features/download'
import { track } from '@/lib/analytics'
import { env } from '@/lib/env'
import type { Tier } from '@/types'

export interface ShareSubject {
  displayName: string
  username: string
  memberNumber: number
  tier: Tier
  amountPaid: number
}

const FORMATS: { id: ShareFormat; label: string }[] = [
  { id: 'story', label: 'Story 9:16' },
  { id: 'post', label: 'Post 1:1' },
]

/** Secao 9 — o motor de crescimento: gera a imagem e abre as redes. */
export function ShareSheet({ subject }: { subject: ShareSubject }) {
  const [format, setFormat] = useState<ShareFormat>('story')
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const blobRef = useRef<Blob | null>(null)

  const profileUrl = `${env.siteUrl}/u/${subject.username}`
  const referralUrl = `${env.siteUrl}/join?ref=${subject.memberNumber}`
  const message = `Eu entrei no R$1K CLUB. Membro #${String(subject.memberNumber).padStart(4, '0')}. Você pode pagar para entrar? ${referralUrl}`

  useEffect(() => {
    let alive = true
    let objectUrl: string | null = null

    setBusy(true)
    renderShareCard(subject, format)
      .then(canvasToBlob)
      .then((blob) => {
        if (!alive) return
        blobRef.current = blob
        objectUrl = URL.createObjectURL(blob)
        setPreview(objectUrl)
      })
      .catch((err) => console.error('share card', err))
      .finally(() => alive && setBusy(false))

    return () => {
      alive = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
    // subject e estavel por pagina; o formato e o que muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, subject.username, subject.memberNumber])

  async function handleNativeShare() {
    if (!blobRef.current) return
    track('share_clicked', { channel: 'native', format })
    const shared = await shareImage(
      blobRef.current,
      `r1k-club-${subject.username}.png`,
      message,
    )
    if (!shared) downloadBlob(blobRef.current, `r1k-club-${subject.username}.png`)
  }

  function handleDownload() {
    if (!blobRef.current) return
    track('share_clicked', { channel: 'download', format })
    downloadBlob(blobRef.current, `r1k-club-${subject.username}-${format}.png`)
  }

  async function handleCopy() {
    track('share_clicked', { channel: 'copy_link' })
    const ok = await copyText(referralUrl)
    setCopied(ok)
    setTimeout(() => setCopied(false), 2200)
  }

  const networks = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(message)}`,
    },
    {
      id: 'x',
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(
        message,
      )}`,
    },
  ]

  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <h3 className="font-display text-lg">Mostrar que sou rico</h3>
        <div className="flex gap-1 rounded-full bg-black/40 p-1">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              aria-pressed={format === f.id}
              className={`focus-gold rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                format === f.id ? 'bg-gold-300 text-ink-950' : 'text-white/45 hover:text-white/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:grid-cols-[minmax(0,240px)_1fr]">
        <div className="relative mx-auto w-full max-w-[240px] overflow-hidden rounded-xl border border-white/10 bg-black/50">
          {preview ? (
            <img
              src={preview}
              alt={`Prévia do card de compartilhamento de ${subject.displayName}`}
              className="w-full"
            />
          ) : (
            <div className="flex aspect-[9/16] items-center justify-center">
              <Spinner className="text-gold-300" />
            </div>
          )}
          {busy && preview && (
            <div className="absolute inset-0 grid place-items-center bg-ink-950/60">
              <Spinner className="text-gold-300" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleNativeShare} disabled={!preview} size="lg">
            Compartilhar imagem
          </Button>

          <div className="grid grid-cols-3 gap-2">
            {networks.map((n) => (
              <a
                key={n.id}
                href={n.href}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => track('share_clicked', { channel: n.id })}
                className="focus-gold rounded-xl border border-white/10 bg-white/[0.03] py-3 text-center text-[11px] uppercase tracking-[0.14em] text-white/70 transition-colors hover:border-gold-300/40 hover:text-gold-200"
              >
                {n.label}
              </a>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={handleDownload} disabled={!preview}>
              Baixar PNG
            </Button>
            <Button variant="ghost" onClick={handleCopy}>
              {copied ? 'Link copiado' : 'Copiar convite'}
            </Button>
          </div>

          <p className="mt-1 text-xs leading-relaxed text-white/35">
            Instagram e TikTok não aceitam publicação direta pelo navegador. Baixe a imagem e
            publique — o link do seu convite já vai junto na legenda copiada.
          </p>

          <div className="mt-auto rounded-xl border border-white/[0.07] bg-black/30 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Seu perfil</p>
            <p className="mt-1 break-all font-mono text-xs text-gold-300/80">{profileUrl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
