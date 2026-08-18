import { Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, ButtonLink, EmptyState, Section, Skeleton } from '@/components/ui'
import { TierPill } from '@/components/MemberBits'
import { ShareSheet } from '@/components/ShareSheet'
import { CertificatePanel } from '@/components/CertificatePanel'
import { fetchMyAccount } from '@/lib/api'
import { memberTag, money } from '@/lib/format'
import { useAuth, signOut } from '@/hooks/useAuth'
import { env, isConfigured } from '@/lib/env'
import { copyText } from '@/features/download'
import { useState } from 'react'

/** Secao 12 — dashboard do usuario. */
export function Dashboard() {
  const { session, loading } = useAuth()

  const { data: account, isLoading } = useQuery({
    queryKey: ['my-account', session?.user.id],
    queryFn: fetchMyAccount,
    enabled: Boolean(session),
  })

  if (!isConfigured) {
    return (
      <Section className="max-w-lg">
        <EmptyState as="h1" title="Área do membro">
          Configure o Supabase para ativar login, dashboard e área administrativa.
        </EmptyState>
      </Section>
    )
  }

  if (loading) {
    return (
      <Section className="max-w-3xl">
        <Skeleton className="h-40 w-full" />
      </Section>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  if (isLoading) {
    return (
      <Section className="max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-40 w-full" />
      </Section>
    )
  }

  if (!account?.membership) {
    return (
      <Section className="max-w-lg">
        <EmptyState as="h1" title="Você ainda não é membro.">
          <p>Seu pagamento pode estar em processamento, ou você ainda não comprou a entrada.</p>
          <div className="mt-8">
            <ButtonLink to="/checkout">Entrar no clube</ButtonLink>
          </div>
        </EmptyState>
      </Section>
    )
  }

  const { membership } = account

  return (
    <Section className="max-w-3xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-gold-300/50">Seu status</p>
          <h1 className="mt-3 font-display text-4xl">{account.display_name}</h1>
          <p className="mt-1 text-sm text-white/35">@{account.username}</p>
        </div>
        <div className="flex items-center gap-3">
          <TierPill tier={membership.tier} size="lg" />
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            Sair
          </Button>
        </div>
      </header>

      {membership.status !== 'active' && (
        <p className="mt-8 rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
          Sua membership está com status <strong>{membership.status}</strong> e não aparece nos
          rankings públicos.
        </p>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Stat label="Membro" value={memberTag(membership.member_number)} />
        <Stat label="Membros indicados" value={String(account.referral_count)} />
        <Stat label="Total investido" value={money(membership.amount_paid)} />
      </div>

      <ReferralPanel memberNumber={membership.member_number} />

      <div className="mt-6">
        <ShareSheet
          subject={{
            displayName: account.display_name,
            username: account.username,
            memberNumber: membership.member_number,
            tier: membership.tier,
            amountPaid: membership.amount_paid,
          }}
        />
      </div>

      <div className="mt-6">
        <CertificatePanel
          data={{
            displayName: account.display_name,
            username: account.username,
            memberNumber: membership.member_number,
            tier: membership.tier,
            amountPaid: membership.amount_paid,
            purchasedAt: membership.purchased_at,
          }}
        />
      </div>

      <nav className="mt-10 grid gap-3 sm:grid-cols-3">
        <ButtonLink to={`/u/${account.username}`} variant="ghost">
          Meu perfil
        </ButtonLink>
        <ButtonLink to="/ranking" variant="ghost">
          Ranking
        </ButtonLink>
        <ButtonLink to="/checkout?tier=very_rich" variant="outline">
          Fazer upgrade
        </ButtonLink>
      </nav>

      {account.is_admin && (
        <p className="mt-10 text-center text-xs text-white/30">
          <Link to="/admin" className="focus-gold text-gold-300/80 underline">
            Abrir painel administrativo
          </Link>
        </p>
      )}
    </Section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface px-5 py-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">{label}</p>
      <p className="mt-2 font-display text-3xl text-gold-100">{value}</p>
    </div>
  )
}

function ReferralPanel({ memberNumber }: { memberNumber: number }) {
  const [copied, setCopied] = useState(false)
  const link = `${env.siteUrl}/join?ref=${memberNumber}`

  return (
    <div className="surface mt-4 flex flex-wrap items-center gap-4 px-5 py-5">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Seu link de convite</p>
        <p className="mt-1.5 truncate font-mono text-sm text-gold-300/85">{link}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={async () => {
          setCopied(await copyText(link))
          setTimeout(() => setCopied(false), 2200)
        }}
      >
        {copied ? 'Copiado' : 'Copiar'}
      </Button>
    </div>
  )
}
