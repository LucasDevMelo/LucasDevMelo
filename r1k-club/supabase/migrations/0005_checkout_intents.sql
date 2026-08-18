-- =============================================================================
-- checkout_intents
--
-- O Mercado Pago devolve o pagamento com um `external_reference` escolhido por
-- nos. Se esse campo fosse o user_id, ele seria adivinhavel: bastaria alguem
-- fazer um pagamento de R$0,01 apontando para o proprio id para virar membro.
--
-- Entao o external_reference passa a ser o id (aleatorio) de uma intencao de
-- compra criada no servidor. O webhook resolve a intencao e so libera se:
--   * a intencao existir; e
--   * o valor pago for >= o valor daquele tier no momento em que foi criada.
--
-- De quebra, a tabela mostra os checkouts abandonados (funil da secao 13).
-- =============================================================================

create table if not exists public.checkout_intents (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  tier       membership_tier not null,
  amount     bigint not null check (amount > 0),  -- centavos, congelado na criacao
  ref        text,
  provider   text not null default 'mercadopago',
  preference_id text,
  status     text not null default 'created'
             check (status in ('created', 'paid', 'expired')),
  created_at timestamptz not null default now(),
  paid_at    timestamptz
);

create index if not exists checkout_intents_user_idx on public.checkout_intents (user_id);
create index if not exists checkout_intents_created_idx on public.checkout_intents (created_at desc);

alter table public.checkout_intents enable row level security;

-- Sem policy: so o service role (Edge Functions) enxerga.
revoke all on public.checkout_intents from anon, authenticated;

-- ---------------------------------------------------------------------------
-- consume_checkout_intent
--
-- Resolve a intencao e devolve os dados autorizados para a concessao. Roda no
-- servidor porque e ela que decide de quem e o pagamento.
-- ---------------------------------------------------------------------------
create or replace function public.consume_checkout_intent(
  p_intent_id   uuid,
  p_paid_amount bigint
)
returns table (user_id uuid, tier membership_tier, ref text, expected_amount bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_intent public.checkout_intents%rowtype;
begin
  select * into v_intent from public.checkout_intents ci where ci.id = p_intent_id;

  if v_intent.id is null then
    raise exception 'intencao de checkout desconhecida: %', p_intent_id
      using errcode = 'P0002';
  end if;

  -- O valor cobrado nao pode ser menor que o combinado na criacao.
  if p_paid_amount < v_intent.amount then
    raise exception 'valor pago (%) menor que o esperado (%) para a intencao %',
      p_paid_amount, v_intent.amount, p_intent_id
      using errcode = 'P0001';
  end if;

  update public.checkout_intents ci
     set status = 'paid',
         paid_at = coalesce(ci.paid_at, now())
   where ci.id = p_intent_id;

  return query
    select v_intent.user_id, v_intent.tier, v_intent.ref, v_intent.amount;
end;
$$;

revoke all on function public.consume_checkout_intent(uuid, bigint)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- admin_metrics passa a expor o funil de checkout.
-- ---------------------------------------------------------------------------
create or replace function public.admin_metrics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'users',          (select count(*) from public.users),
    'members',        (select count(*) from public.memberships where status = 'active'),
    'revenue_cents',  (select coalesce(sum(amount), 0) from public.payments where status = 'paid'),
    'payments_paid',  (select count(*) from public.payments where status = 'paid'),
    'payments_failed',(select count(*) from public.payments where status = 'failed'),
    'referrals',      (select count(*) from public.referrals),
    'waitlist',       (select count(*) from public.waitlist),
    'checkouts',      (select count(*) from public.checkout_intents),
    'checkouts_paid', (select count(*) from public.checkout_intents where status = 'paid'),
    'conversion',     (
      select case when (select count(*) from public.checkout_intents) = 0 then 0
      else round(
        (select count(*) from public.checkout_intents where status = 'paid')::numeric
        / (select count(*) from public.checkout_intents)::numeric, 4)
      end
    ),
    'members_by_day', (
      select coalesce(
        jsonb_agg(jsonb_build_object('day', s.day, 'count', s.total) order by s.day),
        '[]'::jsonb
      )
      from (
        select to_char(date_trunc('day', purchased_at), 'YYYY-MM-DD') as day,
               count(*) as total
          from public.memberships
         where purchased_at > now() - interval '30 days'
         group by 1
      ) s
    )
  ) into v;

  return v;
end;
$$;

grant execute on function public.admin_metrics() to authenticated;
