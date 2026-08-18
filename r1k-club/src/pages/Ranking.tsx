import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ButtonLink, EmptyState, Eyebrow, Heading, Section, Skeleton } from '@/components/ui'
import { RankRow } from '@/components/MemberBits'
import { fetchMoneyRanking, fetchRanking, fetchTopReferrers } from '@/lib/api'
import { memberTag } from '@/lib/format'

type Board = 'entry' | 'money' | 'influencers'

const TABS: { id: Board; label: string; caption: string }[] = [
  { id: 'entry', label: 'Ordem de entrada', caption: 'Quem chegou primeiro. Não muda nunca.' },
  { id: 'money', label: 'Por dinheiro', caption: 'Quem investiu mais em status.' },
  { id: 'influencers', label: 'Top influencers', caption: 'Quem trouxe mais gente para o clube.' },
]

/** Secoes 6 e 10 — ranking de entrada, por dinheiro e de indicacoes. */
export function Ranking() {
  const [board, setBoard] = useState<Board>('entry')
  const tab = TABS.find((t) => t.id === board)!

  const entry = useQuery({
    queryKey: ['ranking', 'entry'],
    queryFn: () => fetchRanking(100),
    enabled: board === 'entry',
  })

  const byMoney = useQuery({
    queryKey: ['ranking', 'money'],
    queryFn: () => fetchMoneyRanking(100),
    enabled: board === 'money',
  })

  const referrers = useQuery({
    queryKey: ['ranking', 'referrers'],
    queryFn: () => fetchTopReferrers(50),
    enabled: board === 'influencers',
  })

  const loading =
    (board === 'entry' && entry.isLoading) ||
    (board === 'money' && byMoney.isLoading) ||
    (board === 'influencers' && referrers.isLoading)

  return (
    <Section>
      <div className="text-center">
        <Eyebrow>Ranking</Eyebrow>
        <Heading as="h1" className="text-4xl sm:text-5xl">
          Quem teve coragem
        </Heading>
      </div>

      <div
        role="tablist"
        aria-label="Tipo de ranking"
        className="mx-auto mt-10 flex max-w-xl flex-wrap justify-center gap-1 rounded-full bg-black/40 p-1"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={board === t.id}
            onClick={() => setBoard(t.id)}
            className={`focus-gold flex-1 whitespace-nowrap rounded-full px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] transition-colors ${
              board === t.id ? 'bg-gold-300 text-ink-950' : 'text-white/45 hover:text-white/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-white/30">{tab.caption}</p>

      <div className="surface mt-10 overflow-hidden">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))
        ) : board === 'influencers' ? (
          referrers.data?.length ? (
            referrers.data.map((r, i) => (
              <RankRow
                key={r.username}
                position={i + 1}
                username={r.username}
                displayName={r.display_name}
                memberNumber={r.member_number}
                tier={r.tier}
                trailing={`${r.referral_count} membros`}
              />
            ))
          ) : (
            <EmptyState title="Ninguém indicou ninguém ainda.">
              Seja o primeiro a trazer alguém — e a aparecer aqui.
            </EmptyState>
          )
        ) : (
          (board === 'entry' ? entry.data : byMoney.data)?.map((m, i) => (
            <RankRow
              key={m.username}
              position={board === 'entry' ? m.member_number : i + 1}
              username={m.username}
              displayName={m.display_name}
              memberNumber={m.member_number}
              tier={m.tier}
              trailing={board === 'entry' ? memberTag(m.member_number) : undefined}
              amountPaid={board === 'money' ? m.amount_paid : undefined}
            />
          )) ?? null
        )}
      </div>

      <div className="mt-14 text-center">
        <p className="font-display text-2xl text-gold-100">Seu nome não está aqui.</p>
        <div className="mt-6">
          <ButtonLink to="/checkout" size="lg">
            Resolver isso — R$1.000
          </ButtonLink>
        </div>
      </div>
    </Section>
  )
}
