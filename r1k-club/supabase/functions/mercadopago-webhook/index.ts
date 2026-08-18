// =============================================================================
// mercadopago-webhook
//
// Unico lugar do sistema que libera um membro. Regras:
//   1. A assinatura (x-signature) e verificada antes de qualquer outra coisa.
//   2. Nada do corpo da notificacao e usado como verdade: pegamos so o id do
//      pagamento e consultamos a API do Mercado Pago para saber status e valor.
//   3. O dono do pagamento sai do external_reference -> checkout_intents, e o
//      valor pago precisa ser >= o combinado quando a intencao foi criada.
//   4. grant_membership e idempotente por (provider, transaction_id), entao as
//      reentregas do Mercado Pago nao geram um segundo numero de membro.
//
// Deploy sem verificacao de JWT (o Mercado Pago nao manda um):
//   supabase functions deploy mercadopago-webhook --no-verify-jwt
// =============================================================================
import { adminClient } from '../_shared/supabase.ts'
import { getPayment, toCents, verifyWebhookSignature } from '../_shared/mercadopago.ts'

/** Status do Mercado Pago que significam "dinheiro entrou". */
const PAID = new Set(['approved'])
/** Status que devem encerrar a membership. */
const REVERSED = new Set(['refunded', 'charged_back'])
/** Status que significam "ainda nao" — Pix e boleto passam por aqui. */
const PENDING = new Set(['pending', 'in_process', 'authorized', 'in_mediation'])

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })

  const url = new URL(req.url)
  const raw = await req.text()

  // O id do pagamento chega na query (?data.id=) ou no corpo ({data:{id}}).
  let dataId = url.searchParams.get('data.id') ?? url.searchParams.get('id')
  let topic = url.searchParams.get('type') ?? url.searchParams.get('topic')

  let payload: { type?: string; action?: string; data?: { id?: string | number } } = {}
  try {
    payload = raw ? JSON.parse(raw) : {}
  } catch {
    // Notificacoes antigas (IPN) vem sem corpo JSON — seguimos com a query.
  }

  if (!dataId && payload.data?.id != null) dataId = String(payload.data.id)
  if (!topic && payload.type) topic = payload.type

  // ---- 1. assinatura -------------------------------------------------------
  const signature = await verifyWebhookSignature(req, dataId)
  if (!signature.ok) {
    console.error('assinatura recusada:', signature.reason)
    return new Response('invalid signature', { status: 401 })
  }

  // merchant_order tambem chega aqui; o que interessa e o pagamento.
  if (topic && topic !== 'payment') {
    return new Response(JSON.stringify({ ignored: topic }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!dataId) return new Response('missing data.id', { status: 400 })

  const db = adminClient()

  try {
    // ---- 2. estado real, direto da API do Mercado Pago ---------------------
    const payment = await getPayment(dataId)
    const amount = toCents(payment.transaction_amount)
    const intentId = payment.external_reference

    if (!intentId) {
      console.error('pagamento sem external_reference', payment.id)
      return ok({ ignored: 'sem external_reference' })
    }

    // ---- reembolso / chargeback -------------------------------------------
    if (REVERSED.has(payment.status)) {
      const { data: intent } = await db
        .from('checkout_intents')
        .select('user_id')
        .eq('id', intentId)
        .maybeSingle()

      if (intent?.user_id) {
        await db.from('memberships').update({ status: 'refunded' }).eq('user_id', intent.user_id)
        await db
          .from('payments')
          .update({ status: 'refunded' })
          .eq('provider', 'mercadopago')
          .eq('transaction_id', String(payment.id))
        await db.from('audit_log').insert({
          action: 'membership.refunded',
          target: intent.user_id,
          metadata: { payment_id: payment.id, status: payment.status },
        })
      }
      return ok({ handled: payment.status })
    }

    // ---- ainda pendente ----------------------------------------------------
    if (PENDING.has(payment.status)) {
      console.log('pagamento pendente', payment.id, payment.status_detail)
      return ok({ pending: payment.status })
    }

    // ---- recusado / cancelado ---------------------------------------------
    if (!PAID.has(payment.status)) {
      const { data: intent } = await db
        .from('checkout_intents')
        .select('user_id')
        .eq('id', intentId)
        .maybeSingle()

      await db.from('payments').upsert(
        {
          user_id: intent?.user_id ?? null,
          provider: 'mercadopago',
          transaction_id: String(payment.id),
          amount,
          currency: payment.currency_id ?? 'BRL',
          status: 'failed',
          raw_event: { status: payment.status, status_detail: payment.status_detail },
        },
        { onConflict: 'provider,transaction_id' },
      )
      return ok({ handled: payment.status })
    }

    // ---- 3. aprovado: resolve a intencao e confere o valor -----------------
    const { data: resolved, error: intentErr } = await db
      .rpc('consume_checkout_intent', { p_intent_id: intentId, p_paid_amount: amount })
      .single()

    if (intentErr) {
      // Intencao desconhecida ou valor abaixo do combinado: nao concede nada.
      console.error('intencao recusada', intentId, intentErr.message)
      await db.from('audit_log').insert({
        action: 'checkout.rejected',
        target: intentId,
        metadata: { payment_id: payment.id, amount, reason: intentErr.message },
      })
      return ok({ rejected: 'intent' })
    }

    const intent = resolved as { user_id: string; ref: string | null }

    // ---- 4. concessao (idempotente) ---------------------------------------
    const { data, error } = await db.rpc('grant_membership', {
      p_user_id: intent.user_id,
      p_provider: 'mercadopago',
      p_transaction_id: String(payment.id),
      p_amount: amount,
      p_currency: payment.currency_id ?? 'BRL',
      p_referrer_code: intent.ref,
      p_raw_event: {
        payment_id: payment.id,
        payment_type: payment.payment_type_id,
        method: payment.payment_method_id,
        intent_id: intentId,
      },
    })

    if (error) throw error

    console.log('membership concedida', JSON.stringify(data))
    return ok({ granted: true })
  } catch (err) {
    console.error('mercadopago-webhook', err)
    // 500 faz o Mercado Pago reentregar — e a reentrega e segura porque
    // grant_membership e idempotente.
    return new Response('handler error', { status: 500 })
  }
})

function ok(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
