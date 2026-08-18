import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente com service role. Ignora RLS — use apenas dentro das Edge Functions,
 * nunca exponha essa chave no frontend.
 */
export function adminClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
