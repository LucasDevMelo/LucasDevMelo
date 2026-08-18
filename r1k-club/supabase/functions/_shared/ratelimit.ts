import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('cf-connecting-ip') ?? 'unknown'
}

/**
 * Janela fixa por (bucket, identificador), contada atomicamente no Postgres.
 * Retorna true quando a requisicao esta dentro do limite.
 */
export async function rateLimit(
  db: SupabaseClient,
  bucket: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await db.rpc('check_rate_limit', {
    p_bucket: bucket,
    p_identifier: identifier,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  })

  if (error) {
    // Falha do limitador nao pode derrubar o checkout — registra e libera.
    console.error('rateLimit', error.message)
    return true
  }

  return data === true
}
