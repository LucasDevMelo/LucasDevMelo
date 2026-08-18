// =============================================================================
// payment-status
//
// A pagina /welcome pergunta aqui "ja sou membro?". Consulta o Mercado Pago
// direto (server-side) e, se o pagamento estiver aprovado mas o webhook ainda
// nao tiver chegado, concede a membership na hora.
//
// Seguro porque: o status e o valor vem da API do Mercado Pago, o dono sai da
// intencao de checkout (nao do que o navegador mandou) e grant_membership e
// idempotente. O payment_id vindo da URL e no maximo um palpite — se apontar
// para o pagamento de outra pessoa, o retorno e o perfil publico dela, que ja
// e publico de qualquer forma.
// =============================================================================
import { adminClient } from '../_shared/supabase.ts'
import { json, preflight } from '../_shared/cors.ts'
import { clientIp, rateLimit } from '../_shared/ratelimit.ts'
import { getPayment, toCents } from '../_shared/mercadopago.ts'

const PENDING = new Set(['pending', 'in_process', 'authorized', 'in_mediation'])

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const pre = preflight(req)
  if (pre) return pre

  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin)

  const db = adminClient()

  try {
    if (!(await rateLimit(db, 'payment-status', clientIp(req), 120, 600))) {
      return json({ error: 'rate_limited' }, 429, origin)
    }

    const body = await req.json().catch(() => null)
    const paymentId = String(body?.payment_id ?? '').trim()
    if (!/^[0-9]{1,24}$/.test(paymentId)) return json({ error: 'invalid_payment' }, 400, origin)

    const payment = await getPayment(paymentId)
    const amount = toCents(payment.transaction_amount)
    const intentId = payment.external_reference

    if (!intentId) return json({ status: 'unknown' }, 200, origin)

    if (PENDING.has(payment.status)) {
      return json(
        { status: 'pending', method: payment.payment_type_id },
        200,
        origin,
      )
    }

    if (payment.status !== 'approved') {
      return json({ status: 'failed', detail: payment.status_detail }, 200, origin)
    }

    // Rede de seguranca: se o webhook atrasou, concede aqui.
    const { data: resolved, error: intentErr } = await db
      .rpc('consume_checkout_intent', { p_intent_id: intentId, p_paid_amount: amount })
      .single()

    if (intentErr) {
      console.error('intencao recusada', intentId, intentErr.message)
      return json({ status: 'unknown' }, 200, origin)
    }

    const intent = resolved as { user_id: string; ref: string | null }

    const { error: grantErr } = await db.rpc('grant_membership', {
      p_user_id: intent.user_id,
      p_provider: 'mercadopago',
      p_transaction_id: String(payment.id),
      p_amount: amount,
      p_currency: payment.currency_id ?? 'BRL',
      p_referrer_code: intent.ref,
      p_raw_event: { source: 'payment-status', intent_id: intentId },
    })
    if (grantErr) throw grantErr

    const { data: profile, error } = await db
      .from('users')
      .select('username, display_name, memberships(member_number, tier, amount_paid, purchased_at)')
      .eq('id', intent.user_id)
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
    console.error('payment-status', err)
    return json({ error: 'internal_error' }, 500, origin)
  }
})
