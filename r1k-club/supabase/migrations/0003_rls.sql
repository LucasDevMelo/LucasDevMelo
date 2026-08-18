-- =============================================================================
-- R$1K CLUB — Row Level Security
--
-- Regra geral: tudo fechado. O publico so enxerga o clube atraves das views
-- public_profiles / public_ranking / public_referrers, que expoem apenas as
-- colunas seguras. E-mail, pagamentos e logs nunca saem para o anon.
-- =============================================================================

alter table public.users              enable row level security;
alter table public.memberships        enable row level security;
alter table public.payments           enable row level security;
alter table public.referrals          enable row level security;
alter table public.badges             enable row level security;
alter table public.user_badges        enable row level security;
alter table public.waitlist           enable row level security;
alter table public.rate_limits        enable row level security;
alter table public.audit_log          enable row level security;
alter table public.member_counter     enable row level security;
alter table public.reserved_usernames enable row level security;

-- Sem policy = sem acesso para anon/authenticated. O service role ignora RLS.
-- Abaixo, apenas as excecoes conscientes.

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
drop policy if exists users_select_self on public.users;
create policy users_select_self on public.users
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Colunas sensiveis nao podem ser editadas pelo proprio usuario.
-- (username/email/is_admin ficam fora do grant de UPDATE.)
revoke update on public.users from authenticated;
grant update (display_name, avatar_url) on public.users to authenticated;

-- ---------------------------------------------------------------------------
-- memberships — leitura da propria membership. O resto vai pela view.
-- ---------------------------------------------------------------------------
drop policy if exists memberships_select_self on public.memberships;
create policy memberships_select_self on public.memberships
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- payments — nunca legivel pelo anon; o dono ve os proprios.
-- ---------------------------------------------------------------------------
drop policy if exists payments_select_self on public.payments;
create policy payments_select_self on public.payments
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- referrals — o dono ve quem ele trouxe.
-- ---------------------------------------------------------------------------
drop policy if exists referrals_select_self on public.referrals;
create policy referrals_select_self on public.referrals
  for select to authenticated
  using (referrer_id = auth.uid() or referred_user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- badges — catalogo publico.
-- ---------------------------------------------------------------------------
drop policy if exists badges_select_all on public.badges;
create policy badges_select_all on public.badges
  for select to anon, authenticated
  using (true);

-- user_badges e publico: badge no perfil publico faz parte do produto.
drop policy if exists user_badges_select_all on public.user_badges;
create policy user_badges_select_all on public.user_badges
  for select to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- waitlist — qualquer um se inscreve, ninguem le.
-- ---------------------------------------------------------------------------
drop policy if exists waitlist_insert_any on public.waitlist;
create policy waitlist_insert_any on public.waitlist
  for insert to anon, authenticated
  with check (true);

drop policy if exists waitlist_select_admin on public.waitlist;
create policy waitlist_select_admin on public.waitlist
  for select to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- audit_log — somente admin le. Escrita so via SECURITY DEFINER.
-- ---------------------------------------------------------------------------
drop policy if exists audit_log_select_admin on public.audit_log;
create policy audit_log_select_admin on public.audit_log
  for select to authenticated
  using (public.is_admin());

-- =============================================================================
-- Views publicas (security_invoker = off: rodam com o dono e furam o RLS de
-- forma controlada, expondo apenas as colunas listadas).
-- =============================================================================

create or replace view public.public_profiles
with (security_invoker = off) as
  select
    u.username,
    u.display_name,
    u.avatar_url,
    m.member_number,
    m.tier,
    m.amount_paid,
    m.purchased_at,
    (select count(*) from public.referrals r where r.referrer_id = u.id) as referral_count
  from public.users u
  join public.memberships m on m.user_id = u.id
  where m.status = 'active'
    and u.is_blocked = false;

create or replace view public.public_ranking
with (security_invoker = off) as
  select
    u.username,
    u.display_name,
    u.avatar_url,
    m.member_number,
    m.tier,
    m.amount_paid,
    m.purchased_at
  from public.users u
  join public.memberships m on m.user_id = u.id
  where m.status = 'active'
    and u.is_blocked = false
  order by m.member_number asc;

create or replace view public.public_referrers
with (security_invoker = off) as
  select
    u.username,
    u.display_name,
    u.avatar_url,
    m.member_number,
    m.tier,
    count(r.id) as referral_count
  from public.users u
  join public.memberships m on m.user_id = u.id
  join public.referrals r on r.referrer_id = u.id
  where m.status = 'active'
    and u.is_blocked = false
  group by u.username, u.display_name, u.avatar_url, m.member_number, m.tier
  order by count(r.id) desc, m.member_number asc;

create or replace view public.public_badges
with (security_invoker = off) as
  select
    u.username,
    b.id as badge_id,
    b.name,
    b.description,
    b.icon,
    b.sort_order,
    ub.earned_at
  from public.user_badges ub
  join public.users u on u.id = ub.user_id
  join public.badges b on b.id = ub.badge_id
  where u.is_blocked = false;

grant select on public.public_profiles, public.public_ranking,
                public.public_referrers, public.public_badges
  to anon, authenticated;

-- Garantia extra: nenhuma tabela sensivel exposta direto ao anon.
revoke all on public.users, public.payments, public.memberships,
              public.referrals, public.audit_log, public.rate_limits,
              public.member_counter
  from anon;
