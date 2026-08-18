import type { PostHog } from 'posthog-js'
import { env } from './env'

/** Eventos da secao 14 do escopo. */
export type AnalyticsEvent =
  | 'landing_view'
  | 'checkout_started'
  | 'checkout_completed'
  | 'onboarding_completed'
  | 'profile_viewed'
  | 'share_clicked'
  | 'referral_clicked'
  | 'referral_signup'
  | 'upgrade_started'
  | 'upgrade_completed'
  | 'waitlist_joined'
  | 'certificate_downloaded'

let client: PostHog | null = null
const queue: [AnalyticsEvent, Record<string, unknown>][] = []

/**
 * PostHog entra por import dinamico: sao ~180kb que nao podem atrasar a
 * primeira renderizacao da landing. Eventos disparados antes de ele carregar
 * ficam na fila e sao enviados depois.
 */
export function initAnalytics(): void {
  if (client || !env.posthogKey) return

  void import('posthog-js').then(({ default: posthog }) => {
    posthog.init(env.posthogKey!, {
      api_host: env.posthogHost,
      person_profiles: 'identified_only',
      capture_pageview: false,
      autocapture: false,
    })
    client = posthog

    for (const [event, props] of queue.splice(0)) posthog.capture(event, props)
  })
}

export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  const payload = { ...attribution(), ...props }

  if (!client) {
    if (import.meta.env.DEV) console.debug('[analytics]', event, payload)
    if (env.posthogKey) queue.push([event, payload])
    return
  }

  client.capture(event, payload)
}

export function identify(id: string, props?: Record<string, unknown>): void {
  client?.identify(id, props)
}

export function pageview(path: string): void {
  client?.capture('$pageview', { $current_url: window.location.origin + path })
}

/**
 * Origem do usuario (secao 13: TikTok / Instagram / direto). Guardamos na
 * primeira visita para nao perder a atribuicao depois do redirect do Stripe.
 */
const ATTR_KEY = 'r1k:attribution'

export interface Attribution {
  source: string
  ref: string | null
  landed_at: string
}

export function captureAttribution(): Attribution {
  const existing = readAttribution()
  if (existing) return existing

  const params = new URLSearchParams(window.location.search)
  const utm = params.get('utm_source')
  const referrer = document.referrer

  let source = utm ?? 'direct'
  if (!utm && referrer) {
    if (/tiktok/i.test(referrer)) source = 'tiktok'
    else if (/instagram/i.test(referrer)) source = 'instagram'
    else if (/(twitter|x\.com)/i.test(referrer)) source = 'x'
    else if (/whatsapp/i.test(referrer)) source = 'whatsapp'
    else source = 'referral_site'
  }

  const attribution: Attribution = {
    source,
    ref: params.get('ref'),
    landed_at: new Date().toISOString(),
  }

  try {
    localStorage.setItem(ATTR_KEY, JSON.stringify(attribution))
  } catch {
    /* modo privado */
  }
  return attribution
}

export function readAttribution(): Attribution | null {
  try {
    const raw = localStorage.getItem(ATTR_KEY)
    return raw ? (JSON.parse(raw) as Attribution) : null
  } catch {
    return null
  }
}

function attribution(): Record<string, unknown> {
  const a = readAttribution()
  return a ? { source: a.source, ref: a.ref } : {}
}
