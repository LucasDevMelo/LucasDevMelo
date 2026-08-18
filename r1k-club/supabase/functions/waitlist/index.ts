// =============================================================================
// waitlist — Fase 0 (validacao). Coleta e-mail antes de existir produto.
// =============================================================================
import { adminClient } from '../_shared/supabase.ts'
import { json, preflight } from '../_shared/cors.ts'
import { clientIp, rateLimit } from '../_shared/ratelimit.ts'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const pre = preflight(req)
  if (pre) return pre

  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin)

  const db = adminClient()

  try {
    if (!(await rateLimit(db, 'waitlist', clientIp(req), 10, 600))) {
      return json({ error: 'rate_limited' }, 429, origin)
    }

    const body = await req.json().catch(() => null)
    const email = String(body?.email ?? '').trim().toLowerCase()
    if (!EMAIL_RE.test(email)) return json({ error: 'invalid_email' }, 400, origin)

    await db.from('waitlist').upsert(
      {
        email,
        source: body?.source ? String(body.source).slice(0, 60) : null,
        ref: body?.ref ? String(body.ref).slice(0, 40) : null,
      },
      { onConflict: 'email', ignoreDuplicates: true },
    )

    const { data: count } = await db
      .from('waitlist')
      .select('id', { count: 'exact', head: true })

    return json({ ok: true, position: count ?? null }, 200, origin)
  } catch (err) {
    console.error('waitlist', err)
    return json({ error: 'internal_error' }, 500, origin)
  }
})
