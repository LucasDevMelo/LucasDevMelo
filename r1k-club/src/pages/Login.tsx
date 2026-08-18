import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Field, Section } from '@/components/ui'
import { sendMagicLink } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { env, isConfigured } from '@/lib/env'

export function Login() {
  const { session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  if (!loading && session) return <Navigate to="/dashboard" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setState('sending')
    try {
      await sendMagicLink(email.trim().toLowerCase(), `${env.siteUrl}/dashboard`)
      setState('sent')
    } catch {
      setState('error')
    }
  }

  return (
    <Section className="max-w-md">
      <h1 className="text-center font-display text-4xl">Entrar na sua conta</h1>
      <p className="mt-4 text-center text-sm leading-relaxed text-white/45">
        Sem senha. Mandamos um link para o e-mail que você usou na compra.
      </p>

      {state === 'sent' ? (
        <p className="mt-10 rounded-2xl border border-gold-300/25 bg-gold-300/[0.06] px-6 py-8 text-center font-display text-xl text-gold-100">
          Link enviado. Confira sua caixa de entrada.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4">
          <Field
            label="E-mail"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={
              state === 'error'
                ? 'Não consegui enviar. Esse e-mail comprou uma entrada?'
                : null
            }
          />
          <Button type="submit" size="lg" loading={state === 'sending'} disabled={!isConfigured}>
            Enviar link mágico
          </Button>
          {!isConfigured && (
            <p className="text-center text-xs text-white/35">
              Modo demonstração: login indisponível sem o Supabase configurado.
            </p>
          )}
        </form>
      )}
    </Section>
  )
}
