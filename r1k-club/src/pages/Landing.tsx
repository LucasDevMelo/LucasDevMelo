import { useEffect, useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Button, ButtonLink, Divider, Eyebrow, Field, Heading, Section, Skeleton } from '@/components/ui'
import { TierPill } from '@/components/MemberBits'
import { fetchClubStats, fetchRanking, joinWaitlist } from '@/lib/api'
import { memberTag, money, shortDate } from '@/lib/format'
import { track, captureAttribution, readAttribution } from '@/lib/analytics'
import { useReferral } from '@/hooks/useReferral'
import { TIERS } from '@/lib/tiers'

export function Landing() {
  const ref = useReferral()

  useEffect(() => {
    captureAttribution()
    track('landing_view')
  }, [])

  return (
    <>
      <Hero ref_={ref} />
      <Divider />
      <WhatYouGet />
      <Divider />
      <RecentMembers />
      <Divider />
      <Tiers />
      <Divider />
      <Waitlist />
      <Divider />
      <FinalCta />
    </>
  )
}

// ---------------------------------------------------------------------------
function Hero({ ref_ }: { ref_: string | null }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['club-stats'],
    queryFn: fetchClubStats,
    staleTime: 30_000,
  })

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-4xl px-5 pb-24 pt-24 text-center sm:px-8 sm:pt-32">
        <p className="animate-fade-up text-[11px] uppercase tracking-[0.45em] text-gold-300/60">
          Membros por convite próprio
        </p>

        <h1
          className="mt-8 animate-fade-up font-display text-6xl font-black leading-[0.95] sm:text-8xl"
          style={{ animationDelay: '90ms' }}
        >
          <span className="text-gold-foil">R$1K CLUB</span>
        </h1>

        <p
          className="mx-auto mt-8 max-w-xl animate-fade-up text-lg leading-relaxed text-white/60 sm:text-xl"
          style={{ animationDelay: '180ms' }}
        >
          Prove que você pode gastar <strong className="text-gold-100">R$1.000</strong> em algo que
          ninguém pediu.
        </p>

        <div
          className="mt-12 flex animate-fade-up flex-col items-center gap-4"
          style={{ animationDelay: '270ms' }}
        >
          <ButtonLink
            to={ref_ ? `/checkout?ref=${encodeURIComponent(ref_)}` : '/checkout'}
            size="lg"
            className="animate-pulse-gold"
          >
            Entrar no clube — R$1.000
          </ButtonLink>

          <p className="text-sm text-white/45">
            {isLoading ? (
              <span className="inline-block h-4 w-56 animate-pulse rounded bg-white/10" />
            ) : (
              <>
                🔥{' '}
                <strong className="text-gold-200">{stats?.members ?? 0} pessoas</strong> já tiveram
                coragem.
              </>
            )}
          </p>

          {ref_ && (
            <p className="rounded-full border border-gold-300/25 px-4 py-1.5 text-xs text-gold-200/80">
              Você chegou pelo convite do membro {memberTag(Number(ref_) || 0)}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
const PERKS = [
  ['🔢', 'Número exclusivo', 'Um número de membro que só existe uma vez. Quem entra antes, tem menor.'],
  ['👤', 'Perfil público', 'Um endereço seu, para mandar para quem duvidar.'],
  ['🪪', 'Certificado digital', 'PNG e PDF prontos para emoldurar — ou postar.'],
  ['💎', 'Badge oficial', 'OG, First 100, Founding Member. Escassez de verdade.'],
  ['🏆', 'Ranking', 'Sua posição, para sempre, na ordem de entrada.'],
  ['📱', 'Social card', 'A imagem que faz a próxima pessoa perguntar o que é isso.'],
]

function WhatYouGet() {
  return (
    <Section>
      <Eyebrow>O que você recebe</Eyebrow>
      <Heading className="max-w-2xl">
        Nada disso é útil.
        <br />
        <span className="text-white/40">Todo o resto também não era.</span>
      </Heading>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
        {PERKS.map(([icon, title, body]) => (
          <div key={title} className="bg-ink-950 p-7 transition-colors hover:bg-ink-900">
            <span aria-hidden="true" className="text-2xl">
              {icon}
            </span>
            <h3 className="mt-4 font-display text-xl text-gold-100">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/45">{body}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
function RecentMembers() {
  const { data, isLoading } = useQuery({
    queryKey: ['ranking', 'recent'],
    queryFn: () => fetchRanking(6),
    staleTime: 30_000,
  })

  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Quem já entrou</Eyebrow>
          <Heading>Os primeiros nomes</Heading>
        </div>
        <Link
          to="/ranking"
          className="focus-gold text-xs uppercase tracking-[0.18em] text-gold-300/70 hover:text-gold-200"
        >
          Ver ranking completo →
        </Link>
      </div>

      <div className="surface mt-10 divide-y divide-white/[0.05]">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          : data?.map((m) => (
              <Link
                key={m.username}
                to={`/u/${m.username}`}
                className="focus-gold flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03]"
              >
                <span className="font-mono text-sm text-gold-300/70">
                  {memberTag(m.member_number)}
                </span>
                <span className="min-w-0 flex-1 truncate font-display text-lg">
                  {m.display_name}
                </span>
                <TierPill tier={m.tier} size="sm" />
                <span className="hidden w-24 text-right text-xs text-white/30 sm:block">
                  {shortDate(m.purchased_at)}
                </span>
              </Link>
            ))}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
function Tiers() {
  return (
    <Section>
      <Eyebrow>Níveis</Eyebrow>
      <Heading className="max-w-2xl">
        R$1.000 é o mínimo.
        <br />
        <span className="text-white/40">Não é o máximo.</span>
      </Heading>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.values(TIERS).map((tier, i) => (
          <div
            key={tier.id}
            className={`surface p-6 transition-transform hover:-translate-y-1 ${
              i === 0 ? 'ring-1 ring-gold-300/30' : ''
            }`}
          >
            <span aria-hidden="true" className="text-3xl">
              {tier.icon}
            </span>
            <h3 className="mt-4 font-display text-2xl text-gold-100">{tier.label}</h3>
            <p className="mt-1 font-mono text-lg text-gold-300">{money(tier.amount)}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/40">{tier.blurb}</p>
            {i === 0 && (
              <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-gold-300/60">
                Disponível agora
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-white/30">
        Os níveis acima de RICH abrem depois das primeiras vendas. Primeiro precisamos provar que
        alguém paga R$1.000.
      </p>
    </Section>
  )
}

// ---------------------------------------------------------------------------
function Waitlist() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const ref = useReferral()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (state === 'sending') return

    setState('sending')
    try {
      await joinWaitlist(email, ref, readAttribution()?.source ?? 'direct')
      track('waitlist_joined')
      setState('done')
    } catch {
      setState('error')
    }
  }

  return (
    <Section className="max-w-2xl text-center">
      <Eyebrow>Ainda pensando?</Eyebrow>
      <Heading>Quero ser o #001 do próximo lote</Heading>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/45">
        Deixe seu e-mail. Avisamos quando os números baixos acabarem — e eles vão acabar.
      </p>

      {state === 'done' ? (
        <p className="mt-10 rounded-2xl border border-gold-300/25 bg-gold-300/[0.06] px-6 py-8 font-display text-xl text-gold-100">
          Anotado. Você já sabe o que vem depois.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto mt-10 flex max-w-md flex-col gap-3">
          <Field
            label="Seu e-mail"
            name="waitlist-email"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={state === 'error' ? 'Não consegui salvar. Tente de novo.' : null}
          />
          <Button type="submit" loading={state === 'sending'} size="lg">
            Entrar na lista
          </Button>
        </form>
      )}
    </Section>
  )
}

// ---------------------------------------------------------------------------
function FinalCta() {
  return (
    <Section className="text-center">
      <Heading as="h2" className="mx-auto max-w-2xl text-4xl sm:text-5xl">
        Uma experiência de status digital
        <br />
        <span className="text-gold-foil">para quem não precisa provar nada.</span>
      </Heading>

      <div className="mt-12">
        <ButtonLink to="/checkout" size="lg">
          Entrar no clube — R$1.000
        </ButtonLink>
      </div>

      <p className="mt-6 text-xs text-white/30">
        Pagamento único. Sem assinatura. Sem reembolso por arrependimento estético.
      </p>
    </Section>
  )
}
