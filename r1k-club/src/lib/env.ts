interface Env {
  supabaseUrl: string
  supabaseAnonKey: string
  siteUrl: string
  posthogKey?: string
  posthogHost: string
}

function read(name: string): string | undefined {
  const value = import.meta.env[name as keyof ImportMetaEnv] as string | undefined
  return value && value.length > 0 ? value : undefined
}

export const env: Env = {
  supabaseUrl: read('VITE_SUPABASE_URL') ?? '',
  supabaseAnonKey: read('VITE_SUPABASE_ANON_KEY') ?? '',
  siteUrl: read('VITE_SITE_URL') ?? window.location.origin,
  posthogKey: read('VITE_POSTHOG_KEY'),
  posthogHost: read('VITE_POSTHOG_HOST') ?? 'https://us.i.posthog.com',
}

/**
 * Sem Supabase configurado o app entra em modo demo: as telas continuam
 * navegaveis com dados de exemplo, o que serve para gravar os videos da
 * secao 20 antes de o backend existir.
 */
export const isConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey)
