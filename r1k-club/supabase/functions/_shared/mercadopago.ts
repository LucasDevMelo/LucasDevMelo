// =============================================================================
// Cliente minimo do Mercado Pago.
//
// Nao usamos o SDK oficial: ele e feito para Node e arrasta dependencias que
// nao valem a pena num Edge Function. A superficie que precisamos e pequena —
// criar preferencia, consultar pagamento e validar a assinatura do webhook.
// =============================================================================

const API = 'https://api.mercadopago.com'

function accessToken(): string {
  const token = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  if (!token) throw new Error('MERCADOPAGO_ACCESS_TOKEN ausente')
  return token
}

/** Credenciais de teste comecam com TEST- e usam o sandbox_init_point. */
export function isSandbox(): boolean {
  return (Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? '').startsWith('TEST-')
}

async function request<T>(
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {},
): Promise<T> {
  const { idempotencyKey, ...rest } = init

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken()}`,
    'Content-Type': 'application/json',
    ...((rest.headers as Record<string, string>) ?? {}),
  }
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey

  const response = await fetch(`${API}${path}`, { ...rest, headers })
  const text = await response.text()

  if (!response.ok) {
    throw new Error(`mercadopago ${path} ${response.status}: ${text.slice(0, 500)}`)
  }

  return (text ? JSON.parse(text) : {}) as T
}

// ---------------------------------------------------------------------------
// Preferencias (Checkout Pro)
// ---------------------------------------------------------------------------
export interface PreferenceInput {
  /** id da intencao de checkout — volta no pagamento como external_reference */
  externalReference: string
  title: string
  description: string
  /** em centavos; o Mercado Pago cobra em reais com decimais */
  amountCents: number
  payerEmail: string
  metadata: Record<string, string>
  successUrl: string
  failureUrl: string
  pendingUrl: string
  notificationUrl: string
}

export interface Preference {
  id: string
  init_point: string
  sandbox_init_point: string
}

export async function createPreference(input: PreferenceInput): Promise<Preference> {
  // auto_return exige back_urls em https — em localhost o MP recusa a preferencia.
  const autoReturn = input.successUrl.startsWith('https://')

  const preference = await request<Preference>('/checkout/preferences', {
    method: 'POST',
    idempotencyKey: input.externalReference,
    body: JSON.stringify({
      items: [
        {
          id: input.externalReference,
          title: input.title,
          description: input.description,
          category_id: 'services',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: input.amountCents / 100,
        },
      ],
      payer: { email: input.payerEmail },
      external_reference: input.externalReference,
      metadata: input.metadata,
      back_urls: {
        success: input.successUrl,
        failure: input.failureUrl,
        pending: input.pendingUrl,
      },
      ...(autoReturn ? { auto_return: 'approved' } : {}),
      notification_url: input.notificationUrl,
      statement_descriptor: 'R1KCLUB',
      // binary_mode fica false de proposito: com true o Pix e o boleto, que
      // passam por 'pending', seriam recusados.
      binary_mode: false,
    }),
  })

  return preference
}

export function checkoutUrl(preference: Preference): string {
  return isSandbox() ? preference.sandbox_init_point : preference.init_point
}

// ---------------------------------------------------------------------------
// Pagamentos
// ---------------------------------------------------------------------------
export type PaymentStatus =
  | 'pending'
  | 'approved'
  | 'authorized'
  | 'in_process'
  | 'in_mediation'
  | 'rejected'
  | 'cancelled'
  | 'refunded'
  | 'charged_back'

export interface Payment {
  id: number
  status: PaymentStatus
  status_detail: string
  /** em reais, com decimais */
  transaction_amount: number
  currency_id: string
  external_reference: string | null
  metadata: Record<string, unknown>
  date_approved: string | null
  payment_method_id: string
  payment_type_id: string
}

export async function getPayment(id: string): Promise<Payment> {
  return request<Payment>(`/v1/payments/${encodeURIComponent(id)}`)
}

/** transaction_amount vem em reais (1000.0) e o banco guarda centavos. */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

// ---------------------------------------------------------------------------
// Assinatura do webhook
//
// O Mercado Pago manda `x-signature: ts=<epoch>,v1=<hmac hex>` e `x-request-id`.
// O HMAC-SHA256 e calculado sobre o manifesto
//     id:<data.id>;request-id:<x-request-id>;ts:<ts>;
// com a chave secreta do webhook. Partes ausentes saem do manifesto.
// ---------------------------------------------------------------------------
export interface SignatureCheck {
  ok: boolean
  reason?: string
}

export async function verifyWebhookSignature(
  req: Request,
  dataId: string | null,
): Promise<SignatureCheck> {
  const secret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET')
  if (!secret) return { ok: false, reason: 'MERCADOPAGO_WEBHOOK_SECRET ausente' }

  const header = req.headers.get('x-signature')
  if (!header) return { ok: false, reason: 'x-signature ausente' }

  let ts: string | undefined
  let v1: string | undefined
  for (const part of header.split(',')) {
    const [rawKey, ...rest] = part.split('=')
    const key = rawKey?.trim()
    const value = rest.join('=').trim()
    if (key === 'ts') ts = value
    else if (key === 'v1') v1 = value
  }

  if (!ts || !v1) return { ok: false, reason: 'x-signature malformado' }

  const manifest = buildManifest(dataId, req.headers.get('x-request-id'), ts)

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(manifest))
  const expected = [...new Uint8Array(signed)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  if (!timingSafeEqual(expected, v1)) return { ok: false, reason: 'assinatura invalida' }

  // Rejeita replays antigos (a janela do MP e generosa; 10 min basta).
  const age = Math.abs(Date.now() - Number(ts))
  if (Number.isFinite(age) && age > 10 * 60 * 1000) {
    return { ok: false, reason: 'timestamp fora da janela' }
  }

  return { ok: true }
}

/**
 * Monta o manifesto exatamente como o Mercado Pago o assina. Exportado porque
 * o formato e a parte mais facil de errar — e a que os testes cobrem.
 */
export function buildManifest(
  dataId: string | null,
  requestId: string | null,
  ts: string,
): string {
  // Ids alfanumericos entram em minusculas; os numericos ficam como estao.
  const id = dataId ? (/^[0-9]+$/.test(dataId) ? dataId : dataId.toLowerCase()) : null

  let manifest = ''
  if (id) manifest += `id:${id};`
  if (requestId) manifest += `request-id:${requestId};`
  manifest += `ts:${ts};`
  return manifest
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
