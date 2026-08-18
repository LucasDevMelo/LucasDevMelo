// =============================================================================
// session-status
//
// A pagina /welcome pergunta aqui "ja sou membro?". Consulta o Stripe direto
// (server-side) e, se o pagamento estiver confirmado mas o webhook ainda nao
// tiver chegado, concede a membership na hora. Seguro porque grant_membership
// e idempotente e o valor vem do Stripe.
// =============================================================================
import Stripe from 'https://esm.sh/stripe@16.12.0?target=deno'
import { adminClient } from '../_shared/supabase.ts'
import { json, preflight } from '../_shared/cors.ts'
import { clientIp, rateLimit } from '../_shared/ratelimit.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const pre = preflight(req)
  if (pre) return pre

  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin)

  const db = adminClient()

  try {
    if (!(await rateLimit(db, 'session-status', clientIp(req), 120, 600))) {
      return json({ error: 'rate_limited' }, 429, origin)
    }

    const body = await req.json().catch(() => null)
    const sessionId = String(body?.session_id ?? '')
    if (!sessionId.startsWith('cs_')) return json({ error: 'invalid_session' }, 400, origin)

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const userId = session.metadata?.user_id ?? session.client_reference_id

    if (!userId) return json({ status: 'unknown' }, 200, origin)

    if (session.payment_status !== 'paid') {
      return json({ status: session.status === 'expired' ? 'expired' : 'pending' }, 200, origin)
    }

    // Rede de seguranca: se o webhook atrasou, concede aqui.
    const { error: grantErr } = await db.rpc('grant_membership', {
      p_user_id: userId,
      p_provider: 'stripe',
      p_transaction_id: session.id,
      p_amount: session.amount_total ?? 0,
      p_currency: (session.currency ?? 'brl').toUpperCase(),
      p_referrer_code: session.metadata?.ref || null,
      p_raw_event: { source: 'session-status' },
    })
    if (grantErr) throw grantErr

    const { data: profile, error } = await db
      .from('users')
      .select('username, display_name, memberships(member_number, tier, amount_paid, purchased_at)')
      .eq('id', userId)
      .single()

    if (error) throw error

    const membership = Array.isArray(profile.memberships)
      ? profile.memberships[0]
      : profile.memberships

    return json(
      {
        status: 'paid',
        member: {
          username: profile.username,
          display_name: profile.display_name,
          member_number: membership?.member_number,
          tier: membership?.tier,
          amount_paid: membership?.amount_paid,
          purchased_at: membership?.purchased_at,
        },
      },
      200,
      origin,
    )
  } catch (err) {
    console.error('session-status', err)
    return json({ error: 'internal_error' }, 500, origin)
  }
})
