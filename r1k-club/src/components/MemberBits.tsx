import { Link } from 'react-router-dom'
import { memberTag, money } from '@/lib/format'
import { tierSpec } from '@/lib/tiers'
import type { PublicBadge, Tier } from '@/types'

export function TierPill({ tier, size = 'md' }: { tier: Tier; size?: 'sm' | 'md' | 'lg' }) {
  const spec = tierSpec(tier)
  const cls =
    size === 'lg'
      ? 'text-base px-5 py-2'
      : size === 'sm'
        ? 'text-[10px] px-2.5 py-1'
        : 'text-xs px-3.5 py-1.5'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-gold-300/30 bg-gold-300/[0.07] font-semibold uppercase tracking-[0.16em] text-gold-200 ${cls}`}
    >
      <span aria-hidden="true">{spec.icon}</span>
      {spec.label}
    </span>
  )
}

export function MemberNumber({
  value,
  className = '',
}: {
  value: number
  className?: string
}) {
  return (
    <span className={`font-mono tabular-nums tracking-tight ${className}`}>{memberTag(value)}</span>
  )
}

export function BadgeChip({ badge }: { badge: PublicBadge }) {
  return (
    <span
      title={badge.description}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-100"
    >
      <span aria-hidden="true" className="text-base">
        {badge.icon}
      </span>
      {badge.name}
    </span>
  )
}

const MEDALS = ['🥇', '🥈', '🥉']

export function RankRow({
  position,
  username,
  displayName,
  memberNumber,
  tier,
  amountPaid,
  trailing,
}: {
  position: number
  username: string
  displayName: string
  memberNumber: number
  tier: Tier
  amountPaid?: number
  trailing?: string
}) {
  const medal = MEDALS[position - 1]

  return (
    <Link
      to={`/u/${username}`}
      className="focus-gold group flex items-center gap-4 border-b border-white/[0.05] px-4 py-4 transition-colors last:border-0 hover:bg-white/[0.03]"
    >
      <span className="w-10 shrink-0 text-center font-mono text-sm text-white/40">
        {medal ?? position}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-lg text-gold-50 group-hover:text-gold-200">
          {displayName}
        </span>
        <span className="block truncate text-xs text-white/35">@{username}</span>
      </span>

      <span className="hidden sm:block">
        <TierPill tier={tier} size="sm" />
      </span>

      <span className="w-24 shrink-0 text-right font-mono text-sm text-gold-300/80">
        {trailing ?? (amountPaid !== undefined ? money(amountPaid) : memberTag(memberNumber))}
      </span>
    </Link>
  )
}
