import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ButtonLink, EmptyState, Section, Skeleton } from '@/components/ui'
import { BadgeChip, TierPill } from '@/components/MemberBits'
import { ShareSheet } from '@/components/ShareSheet'
import { CertificatePanel } from '@/components/CertificatePanel'
import { fetchProfile, fetchProfileBadges } from '@/lib/api'
import { longDate, memberTag, money } from '@/lib/format'
import { track } from '@/lib/analytics'

/** Secao 5 — perfil publico em /u/:username. */
export function Profile() {
  const { username = '' } = useParams()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username.toLowerCase()],
    queryFn: () => fetchProfile(username),
    enabled: Boolean(username),
  })

  const { data: badges } = useQuery({
    queryKey: ['profile-badges', username.toLowerCase()],
    queryFn: () => fetchProfileBadges(username),
    enabled: Boolean(profile),
  })

  useEffect(() => {
    if (profile) track('profile_viewed', { username: profile.username })
  }, [profile])

  // O título da aba é o que aparece quando alguém manda o link no WhatsApp.
  useEffect(() => {
    if (!profile) return
    const previous = document.title
    document.title = `${profile.display_name} — MEMBRO ${memberTag(profile.member_number)} | R$1K CLUB`
    return () => {
      document.title = previous
    }
  }, [profile])

  if (isLoading) {
    return (
      <Section className="max-w-3xl">
        <Skeleton className="mx-auto h-6 w-40" />
        <Skeleton className="mx-auto mt-6 h-14 w-72" />
        <Skeleton className="mx-auto mt-4 h-8 w-40" />
        <Skeleton className="mt-12 h-52 w-full" />
      </Section>
    )
  }

  if (!profile) {
    return (
      <Section className="max-w-lg">
        <EmptyState as="h1" title="Esse membro não existe.">
          <p>
            Ou o @ está errado, ou a pessoa ainda não teve coragem.
          </p>
          <div className="mt-8">
            <ButtonLink to="/checkout">Entrar no clube</ButtonLink>
          </div>
        </EmptyState>
      </Section>
    )
  }

  const subject = {
    displayName: profile.display_name,
    username: profile.username,
    memberNumber: profile.member_number,
    tier: profile.tier,
    amountPaid: profile.amount_paid,
  }

  return (
    <Section className="max-w-3xl">
      {/* Cabecalho */}
      <header className="animate-fade-up text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-gold-300/30 bg-gold-300/[0.06] font-display text-4xl text-gold-200">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            profile.display_name.charAt(0).toUpperCase()
          )}
        </div>

        <h1 className="mt-7 font-display text-4xl font-bold sm:text-5xl">{profile.display_name}</h1>
        <p className="mt-2 text-sm text-white/35">@{profile.username}</p>

        <p className="mt-6 font-mono text-2xl tracking-tight text-gold-200">
          MEMBRO {memberTag(profile.member_number)}
        </p>

        <div className="mt-5 flex justify-center">
          <TierPill tier={profile.tier} size="lg" />
        </div>
      </header>

      {/* Fatos */}
      <dl className="surface mt-12 grid grid-cols-2 divide-x divide-white/[0.06] sm:grid-cols-3">
        <Fact label="Entrou em" value={longDate(profile.purchased_at)} />
        <Fact label="Investimento em status" value={money(profile.amount_paid)} />
        <Fact
          label="Membros trazidos"
          value={String(profile.referral_count)}
          className="col-span-2 border-t border-white/[0.06] sm:col-span-1 sm:border-t-0"
        />
      </dl>

      {/* Badges */}
      {badges && badges.length > 0 && (
        <div className="mt-10">
          <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-gold-300/50">Conquistas</p>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <BadgeChip key={b.badge_id} badge={b} />
            ))}
          </div>
        </div>
      )}

      {/* Certificado */}
      <div className="mt-12">
        <CertificatePanel
          data={{
            displayName: profile.display_name,
            username: profile.username,
            memberNumber: profile.member_number,
            tier: profile.tier,
            amountPaid: profile.amount_paid,
            purchasedAt: profile.purchased_at,
          }}
        />
      </div>

      {/* Compartilhar */}
      <div className="mt-6">
        <ShareSheet subject={subject} />
      </div>

      {/* CTA para quem chegou de fora */}
      <div className="mt-16 rounded-2xl border border-gold-300/20 bg-gold-300/[0.04] px-6 py-12 text-center">
        <p className="font-display text-3xl text-gold-100">Você pode pagar para entrar?</p>
        <p className="mt-3 text-sm text-white/45">
          O próximo número livre é {memberTag(profile.member_number + 1)} — ou o que sobrar quando
          você decidir.
        </p>
        <div className="mt-8">
          <ButtonLink to={`/join?ref=${profile.member_number}`} size="lg">
            Entrar no clube — R$1.000
          </ButtonLink>
        </div>
      </div>
    </Section>
  )
}

function Fact({
  label,
  value,
  className = '',
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={`px-5 py-6 text-center ${className}`}>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-white/30">{label}</dt>
      <dd className="mt-2 font-display text-xl text-gold-100">{value}</dd>
    </div>
  )
}
