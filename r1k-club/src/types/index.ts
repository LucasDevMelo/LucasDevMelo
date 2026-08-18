export type Tier = 'rich' | 'very_rich' | 'whale' | 'legend'

export interface TierSpec {
  id: Tier
  label: string
  /** valor em centavos */
  amount: number
  icon: string
  blurb: string
}

export interface PublicProfile {
  username: string
  display_name: string
  avatar_url: string | null
  member_number: number
  tier: Tier
  amount_paid: number
  purchased_at: string
  referral_count: number
}

export type RankingRow = Omit<PublicProfile, 'referral_count'>

export interface ReferrerRow {
  username: string
  display_name: string
  avatar_url: string | null
  member_number: number
  tier: Tier
  referral_count: number
}

export interface PublicBadge {
  username: string
  badge_id: string
  name: string
  description: string
  icon: string
  sort_order: number
  earned_at: string
}

export interface ClubStats {
  members: number
  spots_left: number
  last_member_at: string | null
}

export interface Membership {
  member_number: number
  tier: Tier
  amount_paid: number
  purchased_at: string
  status: 'active' | 'blocked' | 'refunded'
}

export interface AdminMetrics {
  users: number
  members: number
  revenue_cents: number
  payments_paid: number
  payments_failed: number
  referrals: number
  waitlist: number
  conversion: number
  members_by_day: { day: string; count: number }[]
}
