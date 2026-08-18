import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, EmptyState, Field, Heading, Section, Skeleton } from '@/components/ui'
import { fetchAdminMetrics, fetchMyAccount, searchMembers, setMemberBlocked } from '@/lib/api'
import { memberTag, money, shortDate } from '@/lib/format'
import { useAuth } from '@/hooks/useAuth'
import { isConfigured } from '@/lib/env'
import type { Membership } from '@/types'

/** Secao 13 — painel administrativo. Protegido por is_admin no banco. */
export function Admin() {
  const { session, loading } = useAuth()

  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ['my-account', session?.user.id],
    queryFn: fetchMyAccount,
    enabled: Boolean(session),
  })

  if (!isConfigured) {
    return (
      <Section className="max-w-lg">
        <EmptyState as="h1" title="Painel administrativo">
          Requer Supabase configurado e uma conta com is_admin = true.
        </EmptyState>
      </Section>
    )
  }

  if (loading || accountLoading) {
    return (
      <Section>
        <Skeleton className="h-40 w-full" />
      </Section>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  // A verificacao real acontece no Postgres — aqui e so para nao mostrar
  // uma tela quebrada a quem nao e admin.
  if (!account?.is_admin) {
    return (
      <Section className="max-w-lg">
        <EmptyState as="h1" title="Acesso negado.">Esta conta não tem permissão administrativa.</EmptyState>
      </Section>
    )
  }

  return (
    <Section>
      <Heading as="h1" className="text-4xl">
        Painel
      </Heading>
      <Metrics />
      <Members />
    </Section>
  )
}

// ---------------------------------------------------------------------------
function Metrics() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: fetchAdminMetrics,
    refetchInterval: 60_000,
  })

  if (isLoading) {
    return (
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mt-10">
        <EmptyState title="Não consegui carregar as métricas." />
      </div>
    )
  }

  const cards: [string, string, string?][] = [
    ['Receita', money(data.revenue_cents)],
    ['Membros pagos', String(data.members)],
    ['Usuários', String(data.users)],
    [
      'Conversão',
      `${(data.conversion * 100).toFixed(1)}%`,
      `${data.checkouts_paid} de ${data.checkouts} checkouts`,
    ],
    ['Checkouts iniciados', String(data.checkouts)],
    ['Referrals', String(data.referrals)],
    ['Lista de espera', String(data.waitlist)],
    ['Pagamentos recusados', String(data.payments_failed)],
  ]

  return (
    <>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, hint]) => (
          <div key={label} className="surface px-5 py-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">{label}</p>
            <p className="mt-2 font-display text-2xl text-gold-100">{value}</p>
            {hint && <p className="mt-1 text-[11px] text-white/30">{hint}</p>}
          </div>
        ))}
      </div>

      <MembersByDay series={data.members_by_day} />
    </>
  )
}

function MembersByDay({ series }: { series: { day: string; count: number }[] }) {
  if (!series?.length) return null
  const max = Math.max(...series.map((d) => d.count), 1)

  return (
    <div className="surface mt-4 px-5 py-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
        Novos membros — últimos 30 dias
      </p>
      <div className="mt-5 flex h-28 items-end gap-1">
        {series.map((d) => (
          <div
            key={d.day}
            title={`${d.day}: ${d.count}`}
            style={{ height: `${(d.count / max) * 100}%` }}
            className="min-h-[2px] flex-1 rounded-t bg-gold-300/60"
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
function Members() {
  const [term, setTerm] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-members', term],
    queryFn: () => searchMembers(term),
  })

  const block = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      setMemberBlocked(id, blocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] })
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] })
    },
  })

  return (
    <div className="mt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Heading as="h2" className="text-2xl">
          Membros
        </Heading>
        <div className="w-full max-w-xs">
          <Field
            label="Pesquisar"
            name="search"
            placeholder="nome, @ ou e-mail"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="surface mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/[0.07] text-[10px] uppercase tracking-[0.16em] text-white/30">
            <tr>
              <th className="px-4 py-3">Nº</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">@</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8">
                  <Skeleton className="h-4 w-full" />
                </td>
              </tr>
            ) : data?.length ? (
              data.map((row) => {
                const m = (
                  Array.isArray(row.memberships) ? row.memberships[0] : row.memberships
                ) as Membership | null

                return (
                  <tr key={row.id} className={row.is_blocked ? 'opacity-45' : ''}>
                    <td className="px-4 py-3 font-mono text-gold-300/80">
                      {m ? memberTag(m.member_number) : '—'}
                    </td>
                    <td className="px-4 py-3">{row.display_name}</td>
                    <td className="px-4 py-3 text-white/50">@{row.username}</td>
                    <td className="px-4 py-3 text-white/40">{row.email}</td>
                    <td className="px-4 py-3 font-mono">{m ? money(m.amount_paid) : '—'}</td>
                    <td className="px-4 py-3 text-white/40">
                      {m ? shortDate(m.purchased_at) : shortDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant={row.is_blocked ? 'outline' : 'ghost'}
                        loading={block.isPending && block.variables?.id === row.id}
                        onClick={() => block.mutate({ id: row.id, blocked: !row.is_blocked })}
                      >
                        {row.is_blocked ? 'Desbloquear' : 'Bloquear'}
                      </Button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-white/35">
                  Nenhum resultado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
