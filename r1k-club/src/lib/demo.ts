import type { ClubStats, PublicBadge, PublicProfile, RankingRow, ReferrerRow } from '@/types'

/**
 * Dados de demonstracao usados quando o Supabase ainda nao esta configurado.
 * Servem para navegar o produto inteiro (e gravar os videos da secao 20) antes
 * de existir backend. Nenhum deles vaza para producao: assim que
 * VITE_SUPABASE_URL existe, o app passa a ler do banco.
 */
const NAMES: [string, string][] = [
  ['joaosilva', 'João Silva'],
  ['pedrolima', 'Pedro Lima'],
  ['mariacosta', 'Maria Costa'],
  ['luanaferraz', 'Luana Ferraz'],
  ['rafaelmoura', 'Rafael Moura'],
  ['biancaduarte', 'Bianca Duarte'],
  ['thiagoazevedo', 'Thiago Azevedo'],
  ['camilarocha', 'Camila Rocha'],
  ['gustavopires', 'Gustavo Pires'],
  ['isabelanunes', 'Isabela Nunes'],
  ['andremartins', 'André Martins'],
  ['helenacampos', 'Helena Campos'],
]

const START = new Date('2026-08-01T12:00:00Z').getTime()

export const demoRanking: RankingRow[] = NAMES.map(([username, display_name], i) => ({
  username,
  display_name,
  avatar_url: null,
  member_number: i + 1,
  tier: i === 0 ? 'whale' : i < 3 ? 'very_rich' : 'rich',
  amount_paid: i === 0 ? 1_000_000 : i < 3 ? 500_000 : 100_000,
  purchased_at: new Date(START + i * 7.5 * 3600 * 1000).toISOString(),
}))

const REFERRALS: Record<string, number> = {
  joaosilva: 32,
  pedrolima: 17,
  mariacosta: 11,
  luanaferraz: 4,
  rafaelmoura: 2,
}

export const demoStats: ClubStats = {
  members: demoRanking.length,
  spots_left: 1000 - demoRanking.length,
  last_member_at: demoRanking[demoRanking.length - 1].purchased_at,
}

export function demoProfile(username: string): PublicProfile | null {
  const row = demoRanking.find((r) => r.username.toLowerCase() === username.toLowerCase())
  if (!row) return null
  return { ...row, referral_count: REFERRALS[row.username] ?? 0 }
}

export const demoReferrers: ReferrerRow[] = Object.entries(REFERRALS)
  .map(([username, referral_count]) => {
    const row = demoRanking.find((r) => r.username === username)!
    return {
      username,
      display_name: row.display_name,
      avatar_url: null,
      member_number: row.member_number,
      tier: row.tier,
      referral_count,
    }
  })
  .sort((a, b) => b.referral_count - a.referral_count)

export function demoBadges(username: string): PublicBadge[] {
  const row = demoRanking.find((r) => r.username === username)
  if (!row) return []

  const earned: PublicBadge[] = []
  const push = (badge_id: string, name: string, description: string, icon: string, sort: number) =>
    earned.push({
      username,
      badge_id,
      name,
      description,
      icon,
      sort_order: sort,
      earned_at: row.purchased_at,
    })

  if (row.member_number <= 50) push('og', 'OG', 'Um dos 50 primeiros membros.', '👑', 10)
  if (row.member_number <= 100)
    push('first_100', 'FIRST 100', 'Um dos 100 primeiros membros.', '💎', 20)
  if (row.member_number <= 1000)
    push('founding_member', 'FOUNDING MEMBER', 'Um dos 1.000 primeiros membros.', '🥇', 30)
  if (row.amount_paid >= 1_000_000)
    push('whale', 'WHALE', 'Investiu R$10.000 ou mais.', '🐋', 40)
  if ((REFERRALS[username] ?? 0) >= 10)
    push('influencer', 'INFLUENCER', 'Trouxe 10 membros para o clube.', '🔥', 50)

  return earned.sort((a, b) => a.sort_order - b.sort_order)
}
