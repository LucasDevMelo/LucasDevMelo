export type Tier = 'rich' | 'very_rich' | 'whale' | 'legend'

export interface TierSpec {
  id: Tier
  label: string
  /** valor em centavos */
  amount: number
  icon: string
}

/** Fonte de verdade do preco. O cliente manda o id do tier, nunca o valor. */
export const TIERS: Record<Tier, TierSpec> = {
  rich: { id: 'rich', label: 'RICH', amount: 100_000, icon: '💎' },
  very_rich: { id: 'very_rich', label: 'VERY RICH', amount: 500_000, icon: '🔷' },
  whale: { id: 'whale', label: 'WHALE', amount: 1_000_000, icon: '🐋' },
  legend: { id: 'legend', label: 'LEGEND', amount: 5_000_000, icon: '👑' },
}

export function resolveTier(input: unknown): TierSpec {
  if (typeof input === 'string' && input in TIERS) return TIERS[input as Tier]
  return TIERS.rich
}
