/**
 * Preview de link do perfil publico.
 *
 * O app e uma SPA: quando alguem cola /u/joaosilva no WhatsApp, o crawler le o
 * index.html estatico e mostra o texto generico. O vercel.json redireciona
 * apenas os crawlers conhecidos para ca, e esta funcao devolve um HTML minimo
 * com os metadados certos do membro. Navegadores de verdade nunca passam aqui.
 */

interface Req {
  query: Record<string, string | string[] | undefined>
  headers: Record<string, string | string[] | undefined>
}

interface Res {
  status(code: number): Res
  setHeader(name: string, value: string): void
  send(body: string): void
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? ''
const SITE_URL = process.env.VITE_SITE_URL ?? 'https://r1kclub.com'

const TIER_LABEL: Record<string, string> = {
  rich: '💎 RICH',
  very_rich: '🔷 VERY RICH',
  whale: '🐋 WHALE',
  legend: '👑 LEGEND',
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function brl(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export default async function handler(req: Req, res: Res) {
  const raw = req.query.username
  const username = String(Array.isArray(raw) ? raw[0] : (raw ?? ''))

  let title = 'R$1K CLUB'
  let description = 'Prove que você pode gastar R$1.000 em algo que ninguém pediu.'
  const url = `${SITE_URL}/u/${encodeURIComponent(username)}`

  if (/^[a-zA-Z0-9_]{3,20}$/.test(username) && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const endpoint =
        `${SUPABASE_URL}/rest/v1/public_profiles` +
        `?username=eq.${encodeURIComponent(username)}` +
        `&select=display_name,member_number,tier,amount_paid`

      const response = await fetch(endpoint, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      })

      if (response.ok) {
        const rows = (await response.json()) as {
          display_name: string
          member_number: number
          tier: string
          amount_paid: number
        }[]
        const profile = rows[0]

        if (profile) {
          const tag = `#${String(profile.member_number).padStart(4, '0')}`
          title = `${profile.display_name} — MEMBRO ${tag} | R$1K CLUB`
          description =
            `${TIER_LABEL[profile.tier] ?? '💎 RICH'} · ` +
            `${brl(profile.amount_paid)} investidos em status. Você pode pagar para entrar?`
        }
      }
    } catch {
      // Fica com o texto generico — nunca derruba o preview.
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
  res.status(200).send(`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="R$1K CLUB">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:image" content="${escapeHtml(SITE_URL)}/og-default.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(SITE_URL)}/og-default.png">
<link rel="canonical" href="${escapeHtml(url)}">
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(description)}</p>
<p><a href="${escapeHtml(url)}">Ver perfil</a></p>
</body>
</html>`)
}
