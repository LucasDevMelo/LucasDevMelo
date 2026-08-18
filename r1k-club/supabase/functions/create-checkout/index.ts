// =============================================================================
// create-checkout
//
// Recebe nome / username / e-mail, reserva o username, garante o usuario no
// Auth e devolve a URL do Stripe Checkout. O valor cobrado vem SEMPRE da
// tabela de tiers do servidor — o cliente so escolhe o id do tier.
// =============================================================================
import Stripe from 'https://esm.sh/stripe@16.12.0?target=deno'
import { adminClient } from '../_shared/supabase.ts'
import { json, preflight } from '../_shared/cors.ts'
import { clientIp, rateLimit } from '../_shared/ratelimit.ts'
import { resolveTier } from '../_shared/tiers.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const pre = preflight(req)
  if (pre) return pre

  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin)

  const db = adminClient()

  try {
    const ip = clientIp(req)
    const allowed = await rateLimit(db, 'create-checkout', ip, 8, 600)
    if (!allowed) return json({ error: 'rate_limited' }, 429, origin)

    const body = await req.json().catch(() => null)
    if (!body) return json({ error: 'invalid_body' }, 400, origin)

    const email = String(body.email ?? '').trim().toLowerCase()
    const username = String(body.username ?? '').trim()
    const displayName = String(body.display_name ?? '').trim()
    const ref = body.ref ? String(body.ref).trim().slice(0, 40) : null
    const tier = resolveTier(body.tier)

    if (!EMAIL_RE.test(email)) return json({ error: 'invalid_email' }, 400, origin)
    if (displayName.length < 2 || displayName.length > 60) {
      return json({ error: 'invalid_display_name' }, 400, origin)
    }

    // ---- usuario existente? -------------------------------------------------
    const { data: existing } = await db
      .from('users')
      .select('id, username, is_blocked')
      .eq('email', email)
      .maybeSingle()

    if (existing?.is_blocked) return json({ error: 'blocked' }, 403, origin)

    let userId = existing?.id as string | undefined

    if (!userId) {
      const { data: available, error: availErr } = await db.rpc('username_available', {
        p_username: username,
      })
      if (availErr) throw availErr
      if (available !== true) return json({ error: 'username_taken' }, 409, origin)

      const { data: created, error: createErr } = await db.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { username, display_name: displayName },
      })

      if (createErr || !created?.user) {
        // Corrida, ou usuario que ja existe no Auth sem linha em public.users
        // (tentativa anterior que falhou no meio).
        const { data: retry } = await db
          .from('users')
          .select('id')
          .eq('email', email)
          .maybeSingle()

        if (retry) {
          userId = retry.id
        } else {
          // generateLink resolve o usuario existente sem disparar e-mail.
          const { data: link } = await db.auth.admin.generateLink({
            type: 'magiclink',
            email,
          })
          if (!link?.user) throw createErr ?? new Error('nao foi possivel criar o usuario')
          userId = link.user.id
        }
      } else {
        userId = created.user.id
      }

      const { error: profileErr } = await db.from('users').insert({
        id: userId,
        email,
        username,
        display_name: displayName,
      })

      // 23505 = username/email ja tomados por outra requisicao concorrente.
      if (profileErr && profileErr.code === '23505') {
        const { data: settled } = await db
          .from('users')
          .select('id')
          .eq('email', email)
          .maybeSingle()

        // Se o conflito foi no e-mail (mesma pessoa, duas abas), seguimos com a
        // conta existente. Se foi no username, o @ e de outra pessoa.
        if (!settled) return json({ error: 'username_taken' }, 409, origin)
        userId = settled.id
      } else if (profileErr) {
        throw profileErr
      }
    }

    // ---- sessao de checkout -------------------------------------------------
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        customer_email: email,
        client_reference_id: userId,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'brl',
              unit_amount: tier.amount,
              product_data: {
                name: `R$1K CLUB — ${tier.label}`,
                description: 'Entrada no clube. Numero de membro, perfil publico e certificado.',
              },
            },
          },
        ],
        metadata: { user_id: userId!, tier: tier.id, ref: ref ?? '' },
        payment_intent_data: {
          metadata: { user_id: userId!, tier: tier.id, ref: ref ?? '' },
        },
        success_url: `${SITE_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE_URL}/checkout?canceled=1`,
      },
      // Evita cobrar duas vezes se o usuario clicar duas vezes no botao.
      { idempotencyKey: `checkout:${userId}:${tier.id}:${Math.floor(Date.now() / 900_000)}` },
    )

    await db.from('audit_log').insert({
      actor_id: userId,
      action: 'checkout.created',
      target: session.id,
      metadata: { tier: tier.id, amount: tier.amount, ip, ref },
    })

    return json({ url: session.url, session_id: session.id }, 200, origin)
  } catch (err) {
    console.error('create-checkout', err)
    return json({ error: 'internal_error' }, 500, origin)
  }
})
