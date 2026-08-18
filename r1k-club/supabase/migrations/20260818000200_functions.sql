-- =============================================================================
-- R$1K CLUB — funcoes de dominio
-- Tudo que decide "quem e membro" e "qual e o numero" vive aqui, em
-- SECURITY DEFINER, chamado apenas pelo service role (webhook do gateway).
-- =============================================================================

-- O tipo citext vive no schema `extensions`; sem isto o DDL nao o resolve.
set search_path = public, extensions;

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select coalesce(
    (select u.is_admin from public.users u where u.id = auth.uid()),
    false
  );
$$;

create or replace function public.tier_for_amount(p_amount bigint)
returns membership_tier
language sql
immutable
as $$
  select case
    when p_amount >= 5000000 then 'legend'::membership_tier   -- R$50.000
    when p_amount >= 1000000 then 'whale'::membership_tier     -- R$10.000
    when p_amount >=  500000 then 'very_rich'::membership_tier -- R$5.000
    else 'rich'::membership_tier                               -- R$1.000
  end;
$$;

-- ---------------------------------------------------------------------------
-- next_member_number
-- Trava a unica linha de member_counter e devolve o proximo numero.
-- Gapless e serializado: duas compras simultaneas nunca recebem o mesmo numero.
-- ---------------------------------------------------------------------------
create or replace function public.next_member_number()
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_next integer;
begin
  update public.member_counter
     set last = last + 1
   where id = true
  returning last into v_next;

  if v_next is null then
    raise exception 'member_counter nao inicializado';
  end if;

  return v_next;
end;
$$;

revoke all on function public.next_member_number() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- award_badges — recalcula as badges de um usuario (idempotente)
-- ---------------------------------------------------------------------------
create or replace function public.award_badges(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_number    integer;
  v_total     bigint;
  v_referrals integer;
begin
  select m.member_number into v_number
    from public.memberships m
   where m.user_id = p_user_id;

  if v_number is null then
    return;
  end if;

  select coalesce(sum(p.amount), 0) into v_total
    from public.payments p
   where p.user_id = p_user_id and p.status = 'paid';

  select count(*) into v_referrals
    from public.referrals r
   where r.referrer_id = p_user_id;

  if v_number <= 50 then
    insert into public.user_badges (user_id, badge_id) values (p_user_id, 'og')
    on conflict do nothing;
  end if;

  if v_number <= 100 then
    insert into public.user_badges (user_id, badge_id) values (p_user_id, 'first_100')
    on conflict do nothing;
  end if;

  if v_number <= 1000 then
    insert into public.user_badges (user_id, badge_id) values (p_user_id, 'founding_member')
    on conflict do nothing;
  end if;

  if v_total >= 1000000 then
    insert into public.user_badges (user_id, badge_id) values (p_user_id, 'whale')
    on conflict do nothing;
  end if;

  if v_referrals >= 10 then
    insert into public.user_badges (user_id, badge_id) values (p_user_id, 'influencer')
    on conflict do nothing;
  end if;
end;
$$;

revoke all on function public.award_badges(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- grant_membership — o unico caminho para virar membro.
--
-- Chamado pelo webhook (service role) depois da confirmacao server-side do
-- pagamento. Registra o pagamento, atribui o member_number, vincula o referral
-- e concede badges — tudo na mesma transacao.
--
-- Idempotente pela chave (provider, transaction_id): reentregas do webhook
-- caem no ON CONFLICT e devolvem o estado ja existente.
-- ---------------------------------------------------------------------------
create or replace function public.grant_membership(
  p_user_id        uuid,
  p_provider       text,
  p_transaction_id text,
  p_amount         bigint,
  p_currency       text default 'BRL',
  p_referrer_code  text default null,
  p_raw_event      jsonb default null
)
returns table (member_number integer, tier membership_tier, is_new boolean)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_tier          membership_tier;
  v_number        integer;
  v_is_new        boolean := false;
  v_existing_tier membership_tier;
  v_referrer_id   uuid;
  v_payment_id    uuid;
begin
  if p_user_id is null then
    raise exception 'grant_membership: user_id obrigatorio';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'grant_membership: amount invalido';
  end if;

  v_tier := public.tier_for_amount(p_amount);

  -- Serializa concorrencia por usuario: duas entregas simultaneas do mesmo
  -- webhook nao podem tentar criar duas memberships para a mesma pessoa.
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  -- 0) Idempotencia. O gateway reentrega o mesmo evento sempre que recebe 5xx
  --    (e as vezes sem motivo). Se esta transacao ja foi processada, devolve o
  --    estado atual sem tocar em nada: o valor NAO pode ser somado de novo.
  select p.id into v_payment_id
    from public.payments p
   where p.provider = p_provider
     and p.transaction_id = p_transaction_id
     and p.status = 'paid';

  if v_payment_id is not null then
    select m.member_number, m.tier into v_number, v_existing_tier
      from public.memberships m
     where m.user_id = p_user_id;

    if v_number is not null then
      return query select v_number, v_existing_tier, false;
      return;
    end if;
    -- Sem membership apesar do pagamento pago: estado inconsistente, segue e
    -- concede (o insert de payments abaixo cai no ON CONFLICT sem duplicar).
  end if;

  -- 1) Pagamento.
  insert into public.payments (user_id, provider, transaction_id, amount, currency, status, tier, raw_event)
  values (p_user_id, p_provider, p_transaction_id, p_amount, p_currency, 'paid', v_tier, p_raw_event)
  on conflict (provider, transaction_id) do update
    set status  = 'paid',
        user_id = coalesce(public.payments.user_id, excluded.user_id)
  returning id into v_payment_id;

  -- 2) Membership. O numero so e consumido se a linha realmente for criada.
  select m.member_number, m.tier into v_number, v_existing_tier
    from public.memberships m
   where m.user_id = p_user_id;

  if v_number is null then
    v_number := public.next_member_number();
    v_is_new := true;

    insert into public.memberships (user_id, member_number, tier, amount_paid, status)
    values (p_user_id, v_number, v_tier, p_amount, 'active');
  else
    -- Upgrade: soma o valor e sobe o tier se o novo for maior.
    update public.memberships m
       set amount_paid = m.amount_paid + p_amount,
           tier = public.tier_for_amount(m.amount_paid + p_amount)
     where m.user_id = p_user_id
    returning m.tier into v_tier;
  end if;

  -- 3) Referral — so no primeiro pagamento, e so se o codigo for valido.
  if v_is_new and p_referrer_code is not null and length(trim(p_referrer_code)) > 0 then
    select m.user_id into v_referrer_id
      from public.memberships m
     where m.member_number = nullif(regexp_replace(p_referrer_code, '\D', '', 'g'), '')::integer;

    if v_referrer_id is null then
      select u.id into v_referrer_id
        from public.users u
       where u.username = p_referrer_code;
    end if;

    if v_referrer_id is not null and v_referrer_id <> p_user_id then
      insert into public.referrals (referrer_id, referred_user_id)
      values (v_referrer_id, p_user_id)
      on conflict (referred_user_id) do nothing;

      perform public.award_badges(v_referrer_id);
    end if;
  end if;

  -- 4) Badges do proprio membro.
  perform public.award_badges(p_user_id);

  insert into public.audit_log (actor_id, action, target, metadata)
  values (
    null,
    case when v_is_new then 'membership.granted' else 'membership.upgraded' end,
    p_user_id::text,
    jsonb_build_object(
      'provider', p_provider,
      'transaction_id', p_transaction_id,
      'amount', p_amount,
      'member_number', v_number,
      'payment_id', v_payment_id
    )
  );

  return query select v_number, v_tier, v_is_new;
end;
$$;

revoke all on function public.grant_membership(uuid, text, text, bigint, text, text, jsonb)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- username_available — checagem publica, sem vazar a tabela de users
-- ---------------------------------------------------------------------------
create or replace function public.username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    p_username ~ '^[a-zA-Z0-9](?:[a-zA-Z0-9_]{1,18})[a-zA-Z0-9]$'
    and not exists (select 1 from public.reserved_usernames r where r.username = p_username::citext)
    and not exists (select 1 from public.users u where u.username = p_username::citext);
$$;

grant execute on function public.username_available(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- club_stats — contadores publicos da landing ("37 pessoas ja tiveram coragem")
-- ---------------------------------------------------------------------------
create or replace function public.club_stats()
returns table (members bigint, spots_left integer, last_member_at timestamptz)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    count(*)::bigint as members,
    greatest(1000 - count(*), 0)::integer as spots_left,
    max(purchased_at) as last_member_at
  from public.memberships
  where status = 'active';
$$;

grant execute on function public.club_stats() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- admin_metrics — secao 13
-- ---------------------------------------------------------------------------
create or replace function public.admin_metrics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
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
    'conversion',     (
      select case when (select count(*) from public.users) = 0 then 0
      else round(
        (select count(*) from public.memberships where status = 'active')::numeric
        / (select count(*) from public.users)::numeric, 4)
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

-- ---------------------------------------------------------------------------
-- check_rate_limit — janela fixa, contagem atomica (secao 17)
-- ---------------------------------------------------------------------------
create or replace function public.check_rate_limit(
  p_bucket         text,
  p_identifier     text,
  p_limit          integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_window timestamptz;
  v_count  integer;
begin
  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limits (bucket, identifier, window_start, count)
  values (p_bucket, p_identifier, v_window, 1)
  on conflict (bucket, identifier, window_start) do update
    set count = public.rate_limits.count + 1
  returning count into v_count;

  -- Limpeza oportunista das janelas antigas.
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.check_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- admin_set_blocked — bloquear/desbloquear membro (secao 13)
-- O UPDATE direto em users esta revogado para authenticated, entao a acao
-- administrativa passa por aqui e fica registrada no audit_log.
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_blocked(p_user_id uuid, p_blocked boolean)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.users set is_blocked = p_blocked where id = p_user_id;

  update public.memberships
     set status = case when p_blocked then 'blocked'::membership_status
                       else 'active'::membership_status end
   where user_id = p_user_id
     and status <> 'refunded';

  insert into public.audit_log (actor_id, action, target, metadata)
  values (auth.uid(),
          case when p_blocked then 'admin.block' else 'admin.unblock' end,
          p_user_id::text,
          jsonb_build_object('blocked', p_blocked));
end;
$$;

grant execute on function public.admin_set_blocked(uuid, boolean) to authenticated;
