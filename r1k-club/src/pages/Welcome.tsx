import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, ButtonLink, Section, Spinner } from '@/components/ui'
import { ShareSheet } from '@/components/ShareSheet'
import { TierPill } from '@/components/MemberBits'
import { fetchPaymentStatus } from '@/lib/api'
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

/**
 * Secao 4 — a primeira experiencia precisa ser absurda.
 *
 * O Mercado Pago volta para ca com ?payment_id=&status=&external_reference=…
 * (e o alias antigo collection_id). Nada disso e tratado como verdade: o
 * payment_id so serve para perguntar o estado real a Edge Function.
 */
export function Welcome() {
  const [params] = useSearchParams()

  // O MP as vezes devolve a string "null" quando o pagamento ainda nao existe.
  const raw = params.get('payment_id') ?? params.get('collection_id')
  const paymentId = raw && raw !== 'null' && /^[0-9]+$/.test(raw) ? raw : null

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['payment-status', paymentId],
    queryFn: () => fetchPaymentStatus(paymentId!),
    enabled: Boolean(paymentId),
    // Cartao confirma em segundos; Pix costuma levar alguns e boleto pode levar
    // dias. Depois das primeiras tentativas o intervalo abre para nao martelar
    // a funcao (nem bater no rate limit).
    refetchInterval: (query) => {
      if (query.state.data?.status !== 'pending') return false
      return query.state.dataUpdateCount > 15 ? 15_000 : 2_000
    },
    retry: 3,
  })

  if (!paymentId) {
    return (
      <Section className="max-w-lg text-center">
        <h1 className="font-display text-3xl">Nada para mostrar aqui.</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/45">
          Esta página aparece logo depois do pagamento. Se você já pagou e caiu aqui,{' '}
          <Link to="/login" className="focus-gold text-gold-300/80 underline">
            entre com seu e-mail
          </Link>{' '}
          — a liberação não depende desta tela.
        </p>
        <div className="mt-10">
          <ButtonLink to="/">Voltar para a landing</ButtonLink>
        </div>
      </Section>
    )
  }

  if (isLoading || data?.status === 'pending') {
    return <Waiting method={data?.method} />
  }

  if (isError || data?.status === 'unknown' || data?.status === 'failed' || !data?.member) {
    const recusado = data?.status === 'failed'
    return (
      <Section className="max-w-lg text-center">
        <h1 className="font-display text-3xl">
          {recusado ? 'O pagamento não passou.' : 'Não consegui confirmar esse pagamento.'}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/45">
          {recusado ? (
            <>
              O Mercado Pago recusou a cobrança
              {data?.detail ? ` (${data.detail})` : ''}. Nada foi cobrado — dá para tentar de novo
              com outro método.
            </>
          ) : (
            <>
              Se o valor saiu da sua conta, ele está registrado — o acesso é liberado assim que a
              confirmação chega, mesmo que você feche esta página. Se persistir, fale com o suporte
              com o código <code className="font-mono text-gold-300">{paymentId}</code>.
            </>
          )}
        </p>
        <div className="mt-10 flex justify-center gap-3">
          {recusado ? (
            <ButtonLink to="/checkout">Tentar de novo</ButtonLink>
          ) : (
            <Button onClick={() => refetch()}>Verificar de novo</Button>
          )}
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
function Waiting({ method }: { method?: string }) {
  const boleto = method === 'ticket' || method === 'bank_transfer'

  return (
    <Section className="flex max-w-lg flex-col items-center py-32 text-center">
      <Spinner className="h-8 w-8 text-gold-300" />
      <p className="mt-8 font-display text-2xl">
        {boleto ? 'Aguardando a compensação…' : 'Confirmando o pagamento…'}
      </p>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/40">
        {boleto ? (
          <>
            Boleto pode levar até 3 dias úteis. Pode fechar a página: quando o Mercado Pago
            confirmar, seu número é gerado automaticamente e você entra pelo login com e-mail.
          </>
        ) : (
          <>Não feche esta página. Seu número está sendo reservado.</>
        )}
      </p>
    </Section>
  )
}

// ---------------------------------------------------------------------------
function Ceremony({
  member,
}: {
  member: NonNullable<Awaited<ReturnType<typeof fetchPaymentStatus>>['member']>
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
        O Mercado Pago envia o comprovante para o seu e-mail. Para acessar sua conta depois, use{' '}
        <Link to="/login" className="focus-gold text-gold-300/80 underline">
          o login por link mágico
        </Link>
        .
      </p>
    </Section>
  )
}
