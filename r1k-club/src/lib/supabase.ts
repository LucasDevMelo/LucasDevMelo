import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, isConfigured } from './env'

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/** Acesso ao cliente quando ele e obrigatorio para a operacao. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
    )
  }
  return supabase
}

/** Chama uma Edge Function e normaliza o erro. */
export async function callFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const client = requireSupabase()
  const { data, error } = await client.functions.invoke<T>(name, { body })

  if (error) {
    let detail = error.message
    // O corpo do erro traz o codigo que a funcao devolveu (ex.: username_taken).
    const context = (error as unknown as { context?: Response }).context
    if (context && typeof context.json === 'function') {
      try {
        const parsed = (await context.json()) as { error?: string }
        if (parsed?.error) detail = parsed.error
      } catch {
        /* mantem a mensagem original */
      }
    }
    throw new Error(detail)
  }

  return data as T
}
