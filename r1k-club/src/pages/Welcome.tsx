import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, ButtonLink, Section, Spinner } from '@/components/ui'
import { ShareSheet } from '@/components/ShareSheet'
import { TierPill } from '@/components/MemberBits'
import { fetchSessionStatus } from '@/lib/api'
import { memberTag, money } from '@/lib/format'
import { useCountUp } from '@/hooks/useCountUp'
import { track, identify } from '@/lib/analytics'
import { clearRef } from '@/hooks/useReferral'
import { copyText } from '@/features/download'
import { env } from '@/lib/env'

type Step = 'congrats' | 'amount' | 'number' | 'status' | 'share'

const SEQUENCE: [Step, number][] = [
  ['congrats', 1800],
  ['amount', 2200],
  ['number', 2600],
  ['status', 2400],
]

/** Secao 4 — a primeira experiencia precisa ser absurda. */
export function Welcome() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['session-status', sessionId],
    queryFn: () => fetchSessionStatus(sessionId!),
    enabled: Boolean(sessionId),
    // O webhook normalmente chega em segundos, mas pix/boleto podem levar
    // minutos: depois das primeiras tentativas o intervalo abre para nao
    // martelar a funcao (nem bater no rate limit).
    refetchInterval: (query) => {
      if (query.state.data?.status !== 'pending') return false
      return query.state.dataUpdateCount > 15 ? 15_000 : 2_000
    },
    retry: 3,
  })

  if (!sessionId) {
    return (
      <Section className="max-w-lg text-center">
        <h1 className="font-display text-3xl">Nada para mostrar aqui.</h1>
        <p className="mt-4 text-sm text-white/45">
          Esta página aparece logo depois do pagamento.
        </p>
        <div className="mt-10">
          <ButtonLink to="/">Voltar para a landing</ButtonLink>
        </div>
      </Section>
    )
  }

  if (isLoading || data?.status === 'pending') {
    return <Waiting />
  }

  if (isError || data?.status === 'expired' || data?.status === 'unknown' || !data?.member) {
    return (
      <Section className="max-w-lg text-center">
        <h1 className="font-display text-3xl">Não consegui confirmar esse pagamento.</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/45">
          Se o valor saiu da sua conta, ele está registrado — o acesso é liberado assim que a
          confirmação chega. Tente recarregar; se persistir, fale com o suporte com o código{' '}
          <code className="font-mono text-gold-300">{sessionId.slice(-12)}</code>.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Button onClick={() => refetch()}>Tentar de novo</Button>
          <ButtonLink to="/" variant="ghost">
            Início
          </ButtonLink>
        </div>
      </Section>
    )
  }

  return <Ceremony member={data.member} />
}

// ---------------------------------------------------------------------------
function Waiting() {
  return (
    <Section className="flex max-w-lg flex-col items-center py-32 text-center">
      <Spinner className="h-8 w-8 text-gold-300" />
      <p className="mt-8 font-display text-2xl">Confirmando o pagamento…</p>
      <p className="mt-3 text-sm text-white/40">
        Não feche esta página. Seu número está sendo reservado.
      </p>
    </Section>
  )
}

// ---------------------------------------------------------------------------
function Ceremony({
  member,
}: {
  member: NonNullable<Awaited<ReturnType<typeof fetchSessionStatus>>['member']>
}) {
  const [step, setStep] = useState<Step>('congrats')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    clearRef()
    track('checkout_completed', {
      member_number: member.member_number,
      tier: member.tier,
      amount: member.amount_paid,
    })
    identify(member.username, { member_number: member.member_number, tier: member.tier })
  }, [member])

  useEffect(() => {
    const timers: number[] = []
    let elapsed = 0

    SEQUENCE.forEach(([, duration], i) => {
      elapsed += duration
      const next = SEQUENCE[i + 1]?.[0] ?? 'share'
      timers.push(window.setTimeout(() => setStep(next), elapsed))
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (step === 'share') track('onboarding_completed', { member_number: member.member_number })
  }, [step, member.member_number])

  const number = useCountUp(member.member_number, 1600, step === 'number')

  async function handleCopyProfile() {
    const ok = await copyText(`${env.siteUrl}/u/${member.username}`)
    setCopied(ok)
    setTimeout(() => setCopied(false), 2200)
  }

  if (step !== 'share') {
    return (
      <div className="grid min-h-[70dvh] place-items-center px-5 text-center">
        <div key={step} className="animate-count-in">
          {step === 'congrats' && (
            <>
              <p className="text-6xl" aria-hidden="true">
                🎉
              </p>
              <h1 className="mt-8 font-display text-6xl font-black text-gold-foil sm:text-7xl">
                PARABÉNS.
              </h1>
              <p className="mt-6 text-sm uppercase tracking-[0.3em] text-white/35">Você entrou.</p>
            </>
          )}

          {step === 'amount' && (
            <>
              <p className="text-sm uppercase tracking-[0.3em] text-white/35">
                Você acaba de gastar
              </p>
              <p className="mt-6 font-display text-7xl font-black text-gold-foil sm:text-8xl">
                {money(member.amount_paid)}
              </p>
              <p className="mt-6 text-sm text-white/35">Em algo que ninguém pediu.</p>
            </>
          )}

          {step === 'number' && (
            <>
              <p className="text-sm uppercase tracking-[0.3em] text-white/35">Seu número oficial</p>
              <p className="mt-8 font-mono text-7xl font-bold tabular-nums text-gold-200 sm:text-8xl">
                {memberTag(number)}
              </p>
              <p className="mt-8 text-sm text-white/35">Ninguém mais vai ter esse.</p>
            </>
          )}

          {step === 'status' && (
            <>
              <p className="text-sm uppercase tracking-[0.3em] text-white/35">Seu status</p>
              <div className="mt-8 flex justify-center">
                <TierPill tier={member.tier} size="lg" />
              </div>
              <p className="mt-10 font-display text-3xl text-gold-100">
                Agora mostre para alguém.
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <Section className="max-w-3xl">
      <div className="animate-fade-up text-center">
        <p className="text-[11px] uppercase tracking-[0.4em] text-gold-300/60">
          Bem-vindo ao clube
        </p>
        <h1 className="mt-6 font-display text-4xl font-bold sm:text-5xl">{member.display_name}</h1>
        <p className="mt-4 font-mono text-2xl text-gold-200">
          MEMBRO {memberTag(member.member_number)}
        </p>
        <div className="mt-5 flex justify-center">
          <TierPill tier={member.tier} size="lg" />
        </div>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-3">
        <ButtonLink to={`/u/${member.username}`} variant="ghost">
          Meu perfil
        </ButtonLink>
        <Button variant="ghost" onClick={handleCopyProfile}>
          {copied ? 'Copiado' : 'Copiar link'}
        </Button>
        <ButtonLink to="/dashboard" variant="ghost">
          Minha conta
        </ButtonLink>
      </div>

      <div className="mt-10">
        <ShareSheet
          subject={{
            displayName: member.display_name,
            username: member.username,
            memberNumber: member.member_number,
            tier: member.tier,
            amountPaid: member.amount_paid,
          }}
        />
      </div>

      <p className="mt-8 text-center text-xs text-white/30">
        Enviamos o recibo para o seu e-mail. Para acessar sua conta depois, use{' '}
        <Link to="/login" className="focus-gold text-gold-300/80 underline">
          o login por link mágico
        </Link>
        .
      </p>
    </Section>
  )
}
