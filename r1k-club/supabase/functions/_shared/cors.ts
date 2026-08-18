const ALLOWED = (Deno.env.get('ALLOWED_ORIGINS') ?? '*')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

export function corsHeaders(origin: string | null): Record<string, string> {
  const allow =
    ALLOWED.includes('*') || (origin && ALLOWED.includes(origin)) ? origin ?? '*' : ALLOWED[0]

  return {
    'Access-Control-Allow-Origin': allow ?? '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

export function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  })
}

export function preflight(req: Request): Response | null {
  if (req.method !== 'OPTIONS') return null
  return new Response('ok', { headers: corsHeaders(req.headers.get('origin')) })
}
