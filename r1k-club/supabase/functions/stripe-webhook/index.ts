// =============================================================================
// stripe-webhook
//
// Unico lugar do sistema que libera um membro. Regras:
//   1. Assinatura do Stripe verificada antes de qualquer leitura do payload.
//   2. Valor e status vem do Stripe, nunca do cliente.
//   3. grant_membership e idempotente por (provider, transaction_id) — reentregas
//      do Stripe nao geram dois numeros de membro.
//
// Configurar sem verificacao de JWT:
//   supabase functions deploy stripe-webhook --no-verify-jwt
// =============================================================================
import Stripe from 'https://esm.sh/stripe@16.12.0?target=deno'
import { adminClient } from '../_shared/supabase.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
const cryptoProvider = Stripe.createSubtleCryptoProvider()

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })

  const signature = req.headers.get('stripe-signature')
  const payload = await req.text()

  if (!signature || !WEBHOOK_SECRET) {
    return new Response('missing signature', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      WEBHOOK_SECRET,
      undefined,
      cryptoProvider,
    )
  } catch (err) {
    console.error('assinatura invalida', err instanceof Error ? err.message : err)
    return new Response('invalid signature', { status: 400 })
  }

  const db = adminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.payment_status !== 'paid') {
          console.log('sessao ainda nao paga', session.id)
          break
        }

        const userId = session.metadata?.user_id ?? session.client_reference_id
        const amount = session.amount_total ?? 0
        const ref = session.metadata?.ref || null

        if (!userId) {
          console.error('sessao sem user_id', session.id)
          break
        }

        const { data, error } = await db.rpc('grant_membership', {
          p_user_id: userId,
          p_provider: 'stripe',
          p_transaction_id: session.id,
          p_amount: amount,
          p_currency: (session.currency ?? 'brl').toUpperCase(),
          p_referrer_code: ref,
          p_raw_event: { id: event.id, type: event.type },
        })

        if (error) throw error
        console.log('membership concedida', JSON.stringify(data))
        break
      }

      case 'checkout.session.async_payment_failed':
      case 'payment_intent.payment_failed': {
        const object = event.data.object as
          | Stripe.Checkout.Session
          | Stripe.PaymentIntent
        const userId = object.metadata?.user_id ?? null

        await db.from('payments').upsert(
          {
            user_id: userId,
            provider: 'stripe',
            transaction_id: object.id,
            amount: 'amount_total' in object ? object.amount_total ?? 0 : object.amount ?? 0,
            currency: (object.currency ?? 'brl').toUpperCase(),
            status: 'failed',
            raw_event: { id: event.id, type: event.type },
          },
          { onConflict: 'provider,transaction_id' },
        )
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const userId = charge.metadata?.user_id ?? null

        if (userId) {
          await db.from('memberships').update({ status: 'refunded' }).eq('user_id', userId)
          await db.from('audit_log').insert({
            action: 'membership.refunded',
            target: userId,
            metadata: { charge: charge.id, event: event.id },
          })
        }
        break
      }

      default:
        // Eventos nao tratados sao ignorados de proposito.
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('stripe-webhook', err)
    // 500 faz o Stripe reentregar — e a reentrega e segura porque grant_membership
    // e idempotente.
    return new Response('handler error', { status: 500 })
  }
})
