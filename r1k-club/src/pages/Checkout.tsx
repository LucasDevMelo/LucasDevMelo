import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Field, Section } from '@/components/ui'
import { checkUsername, createCheckout } from '@/lib/api'
import { money, memberTag } from '@/lib/format'
import { tierSpec } from '@/lib/tiers'
import { track } from '@/lib/analytics'
import { useReferral } from '@/hooks/useReferral'
import { isConfigured } from '@/lib/env'
import type { Tier } from '@/types'

type UsernameState = 'idle' | 'checking' | 'free' | 'taken' | 'invalid'

const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9_]{1,18})[a-zA-Z0-9]$/

const ERROR_COPY: Record<string, string> = {
  username_taken: 'Esse @ já foi levado. Escolha outro.',
  invalid_email: 'Esse e-mail não parece válido.',
  invalid_display_name: 'Coloque seu nome como quer que apareça no certificado.',
  rate_limited: 'Muitas tentativas. Espere um minuto e tente de novo.',
  blocked: 'Esta conta não pode entrar no clube.',
  demo_mode: 'Modo demonstração: o checkout precisa do Supabase e do Stripe configurados.',
}

/** Secao 3 — o fluxo tem que ser ridiculamente simples. */
export function Checkout() {
  const [params] = useSearchParams()
  const ref = useReferral()

  const tier = useMemo<Tier>(() => {
    const t = params.get('tier')
    return t === 'very_rich' || t === 'whale' || t === 'legend' ? t : 'rich'
  }, [params])

  const spec = tierSpec(tier)
  const canceled = params.get('canceled') === '1'

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [usernameState, setUsernameState] = useState<UsernameState>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    track(tier === 'rich' ? 'checkout_started' : 'upgrade_started', { tier })
  }, [tier])

  // Disponibilidade do @ com debounce.
  useEffect(() => {
    const value = username.trim()
    if (!value) {
      setUsernameState('idle')
      return
    }
    if (!USERNAME_RE.test(value)) {
      setUsernameState('invalid')
      return
    }

    setUsernameState('checking')
    const timer = setTimeout(() => {
      checkUsername(value)
        .then((free) => setUsernameState(free ? 'free' : 'taken'))
        .catch(() => setUsernameState('idle'))
    }, 450)

    return () => clearTimeout(timer)
  }, [username])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting || usernameState === 'taken' || usernameState === 'invalid') return

    setSubmitting(true)
    setError(null)

    try {
      const { url } = await createCheckout({
        email: email.trim().toLowerCase(),
        username: username.trim(),
        display_name: displayName.trim(),
        tier,
        ref,
      })
      // Sai do SPA: o Stripe assume daqui.
      window.location.assign(url)
    } catch (err) {
      const code = err instanceof Error ? err.message : 'unknown'
      setError(ERROR_COPY[code] ?? 'Algo deu errado. Tente novamente em instantes.')
      setSubmitting(false)
    }
  }

  const usernameHint: Record<UsernameState, string> = {
    idle: '3 a 20 caracteres. Letras, números e _',
    checking: 'Verificando…',
    free: '✓ Disponível',
    taken: '',
    invalid: '',
  }

  return (
    <Section className="max-w-lg">
      <div className="text-center">
        <h1>
          <span className="block text-[11px] uppercase tracking-[0.4em] text-gold-300/60">
            Entrada
          </span>
          <span className="mt-6 block font-display text-6xl font-black text-gold-foil">
            {money(spec.amount)}
          </span>
        </h1>
        <p className="mt-3 text-sm text-white/45">
          {spec.icon} {spec.label} — pagamento único, sem assinatura.
        </p>
      </div>

      {canceled && (
        <p className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm text-white/55">
          Você cancelou o pagamento. O número que você teria ainda está livre.
        </p>
      )}

      {ref && (
        <p className="mt-8 rounded-xl border border-gold-300/25 bg-gold-300/[0.06] px-4 py-3 text-center text-sm text-gold-100">
          Convite do membro {memberTag(Number(ref) || 0)} aplicado.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
        <Field
          label="Nome"
          name="display_name"
          required
          minLength={2}
          maxLength={60}
          autoComplete="name"
          placeholder="João Silva"
          hint="É esse nome que vai no certificado."
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <Field
          label="Username"
          name="username"
          required
          prefix="@"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="joaosilva"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20))}
          hint={usernameHint[usernameState]}
          error={
            usernameState === 'taken'
              ? 'Esse @ já foi levado.'
              : usernameState === 'invalid'
                ? 'Use 3 a 20 caracteres, sem _ no início ou no fim.'
                : null
          }
        />

        <Field
          label="E-mail"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="voce@email.com"
          hint="Para o recibo e o acesso à sua conta."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && (
          <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          loading={submitting}
          disabled={usernameState === 'taken' || usernameState === 'invalid'}
        >
          Pagar {money(spec.amount)}
        </Button>

        <p className="text-center text-xs leading-relaxed text-white/30">
          Pagamento processado pelo Stripe. Seu número de membro é gerado no servidor no momento em
          que o pagamento é confirmado.
        </p>

        {!isConfigured && (
          <p className="rounded-xl border border-gold-300/20 bg-gold-300/[0.05] px-4 py-3 text-center text-xs text-gold-200/80">
            Modo demonstração ativo: nenhum pagamento real será cobrado.
          </p>
        )}
      </form>
    </Section>
  )
}
