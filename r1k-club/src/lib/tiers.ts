import type { Tier, TierSpec } from '@/types'

/**
 * Espelho de supabase/functions/_shared/tiers.ts. Aqui e so para exibicao —
 * o valor cobrado e sempre resolvido no servidor.
 */
export const TIERS: Record<Tier, TierSpec> = {
  rich: {
    id: 'rich',
    label: 'RICH',
    amount: 100_000,
    icon: '💎',
    blurb: 'A entrada. Você provou que pode.',
  },
  very_rich: {
    id: 'very_rich',
    label: 'VERY RICH',
    amount: 500_000,
    icon: '🔷',
    blurb: 'Cinco vezes o necessário.',
  },
  whale: {
    id: 'whale',
    label: 'WHALE',
    amount: 1_000_000,
    icon: '🐋',
    blurb: 'A esta altura já não é sobre dinheiro.',
  },
  legend: {
    id: 'legend',
    label: 'LEGEND',
    amount: 5_000_000,
    icon: '👑',
    blurb: 'Nós nem sabemos o que dizer.',
  },
}

export const TIER_ORDER: Tier[] = ['rich', 'very_rich', 'whale', 'legend']

export function tierSpec(tier: Tier | string | null | undefined): TierSpec {
  if (tier && tier in TIERS) return TIERS[tier as Tier]
  return TIERS.rich
}
