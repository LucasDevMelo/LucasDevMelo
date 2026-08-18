import { supabase, callFunction, requireSupabase } from './supabase'
import { isConfigured } from './env'
import * as demo from './demo'
import type {
  AdminMetrics,
  ClubStats,
  Membership,
  PublicBadge,
  PublicProfile,
  RankingRow,
  ReferrerRow,
  Tier,
} from '@/types'

/** Atraso artificial no modo demo, so para as telas nao piscarem. */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------------------
// Leitura publica
// ---------------------------------------------------------------------------
export async function fetchClubStats(): Promise<ClubStats> {
  if (!isConfigured) {
    await sleep(120)
    return demo.demoStats
  }

  const { data, error } = await requireSupabase().rpc('club_stats').single()
  if (error) throw error
  return data as ClubStats
}

export async function fetchProfile(username: string): Promise<PublicProfile | null> {
  if (!isConfigured) {
    await sleep(120)
    return demo.demoProfile(username)
  }

  const { data, error } = await requireSupabase()
    .from('public_profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (error) throw error
  return (data as PublicProfile) ?? null
}

export async function fetchProfileBadges(username: string): Promise<PublicBadge[]> {
  if (!isConfigured) {
    await sleep(80)
    return demo.demoBadges(username)
  }

  const { data, error } = await requireSupabase()
    .from('public_badges')
    .select('*')
    .eq('username', username)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data as PublicBadge[]) ?? []
}

export async function fetchRanking(limit = 100): Promise<RankingRow[]> {
  if (!isConfigured) {
    await sleep(140)
    return demo.demoRanking.slice(0, limit)
  }

  const { data, error } = await requireSupabase()
    .from('public_ranking')
    .select('*')
    .order('member_number', { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data as RankingRow[]) ?? []
}

export async function fetchMoneyRanking(limit = 100): Promise<RankingRow[]> {
  if (!isConfigured) {
    await sleep(140)
    return [...demo.demoRanking].sort((a, b) => b.amount_paid - a.amount_paid).slice(0, limit)
  }

  const { data, error } = await requireSupabase()
    .from('public_ranking')
    .select('*')
    .order('amount_paid', { ascending: false })
    .order('member_number', { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data as RankingRow[]) ?? []
}

export async function fetchTopReferrers(limit = 20): Promise<ReferrerRow[]> {
  if (!isConfigured) {
    await sleep(140)
    return demo.demoReferrers.slice(0, limit)
  }

  const { data, error } = await requireSupabase()
    .from('public_referrers')
    .select('*')
    .order('referral_count', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data as ReferrerRow[]) ?? []
}

export async function checkUsername(username: string): Promise<boolean> {
  if (!isConfigured) {
    await sleep(200)
    return !demo.demoRanking.some((r) => r.username === username.toLowerCase())
  }

  const { data, error } = await requireSupabase().rpc('username_available', {
    p_username: username,
  })
  if (error) throw error
  return data === true
}

// ---------------------------------------------------------------------------
// Checkout / pagamento
// ---------------------------------------------------------------------------
export interface CheckoutInput {
  email: string
  username: string
  display_name: string
  tier: Tier
  ref: string | null
}

export async function createCheckout(input: CheckoutInput): Promise<{ url: string }> {
  if (!isConfigured) {
    throw new Error('demo_mode')
  }
  return callFunction<{ url: string }>('create-checkout', { ...input })
}

export interface SessionStatus {
  status: 'paid' | 'pending' | 'expired' | 'unknown'
  member?: {
    username: string
    display_name: string
    member_number: number
    tier: Tier
    amount_paid: number
    purchased_at: string
  }
}

export async function fetchSessionStatus(sessionId: string): Promise<SessionStatus> {
  if (!isConfigured) {
    await sleep(900)
    return {
      status: 'paid',
      member: {
        username: 'joaosilva',
        display_name: 'João Silva',
        member_number: 42,
        tier: 'rich',
        amount_paid: 100_000,
        purchased_at: new Date().toISOString(),
      },
    }
  }
  return callFunction<SessionStatus>('session-status', { session_id: sessionId })
}

export async function joinWaitlist(email: string, ref: string | null, source: string) {
  if (!isConfigured) {
    await sleep(400)
    return { ok: true }
  }
  return callFunction<{ ok: boolean }>('waitlist', { email, ref, source })
}

// ---------------------------------------------------------------------------
// Area logada
// ---------------------------------------------------------------------------
export interface MyAccount {
  id: string
  username: string
  display_name: string
  email: string
  avatar_url: string | null
  is_admin: boolean
  membership: Membership | null
  referral_count: number
}

export async function fetchMyAccount(): Promise<MyAccount | null> {
  const client = supabase
  if (!client) return null

  const { data: auth } = await client.auth.getUser()
  if (!auth.user) return null

  const { data, error } = await client
    .from('users')
    .select(
      'id, username, display_name, email, avatar_url, is_admin, memberships(member_number, tier, amount_paid, purchased_at, status)',
    )
    .eq('id', auth.user.id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const { count } = await client
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', auth.user.id)

  const memberships = data.memberships as unknown
  const membership = (Array.isArray(memberships) ? memberships[0] : memberships) as
    | Membership
    | undefined

  return {
    id: data.id,
    username: data.username,
    display_name: data.display_name,
    email: data.email,
    avatar_url: data.avatar_url,
    is_admin: data.is_admin,
    membership: membership ?? null,
    referral_count: count ?? 0,
  }
}

export async function sendMagicLink(email: string, redirectTo: string): Promise<void> {
  const { error } = await requireSupabase().auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
  })
  if (error) throw error
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const { data, error } = await requireSupabase().rpc('admin_metrics')
  if (error) throw error
  return data as AdminMetrics
}

export interface AdminMemberRow {
  id: string
  username: string
  display_name: string
  email: string
  is_blocked: boolean
  created_at: string
  memberships: Membership | Membership[] | null
}

export async function searchMembers(term: string): Promise<AdminMemberRow[]> {
  let query = requireSupabase()
    .from('users')
    .select(
      'id, username, display_name, email, is_blocked, created_at, memberships(member_number, tier, amount_paid, purchased_at, status)',
    )
    .order('created_at', { ascending: false })
    .limit(50)

  if (term.trim()) {
    const safe = term.trim().replace(/[^\p{L}\p{N} @._-]/gu, '')
    if (!safe) return []
    query = query.or(`username.ilike.%${safe}%,display_name.ilike.%${safe}%,email.ilike.%${safe}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data as AdminMemberRow[]) ?? []
}

export async function setMemberBlocked(userId: string, blocked: boolean): Promise<void> {
  // Passa por RPC: o UPDATE direto em users esta revogado para authenticated.
  const { error } = await requireSupabase().rpc('admin_set_blocked', {
    p_user_id: userId,
    p_blocked: blocked,
  })
  if (error) throw error
}
