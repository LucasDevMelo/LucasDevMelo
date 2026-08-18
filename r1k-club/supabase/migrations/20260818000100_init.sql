-- =============================================================================
-- R$1K CLUB — schema inicial
--
-- Princípios (secao 17 do escopo):
--   * O member_number NUNCA e gerado no cliente. Ele sai de um contador
--     travado por linha dentro da mesma transacao que cria a membership.
--   * Nenhuma tabela sensivel e legivel pelo anon. O perfil publico sai de
--     views que expoem apenas as colunas seguras.
--   * Liberar membro so acontece server-side, a partir do webhook de pagamento.
-- =============================================================================

-- O tipo citext vive no schema `extensions`; sem isto o DDL nao o resolve.
set search_path = public, extensions;

create schema if not exists extensions;

-- pgcrypto pode ficar em `extensions` (o Supabase ja o instala la).
create extension if not exists "pgcrypto" with schema extensions;

-- citext, nao. O operador `citext = text` precisa estar visivel para o role
-- anon nas consultas do PostgREST — e o search_path do anon nao inclui
-- `extensions` de forma garantida. Fora do public, a comparacao cai
-- silenciosamente num `text = text` case-sensitive e /u/JoaoSilva vira 404
-- enquanto /u/joaosilva funciona. Sem erro, so resultado errado.
create extension if not exists "citext" with schema public;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
do $$ begin
  create type membership_tier as enum ('rich', 'very_rich', 'whale', 'legend');
exception when duplicate_object then null; end $$;

do $$ begin
  create type membership_status as enum ('active', 'blocked', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        citext not null unique,
  username     citext not null unique,
  display_name text   not null,
  avatar_url   text,
  is_admin     boolean not null default false,
  is_blocked   boolean not null default false,
  created_at   timestamptz not null default now()
);

-- username: 3-20 chars, letras/numeros/underscore, sem underscore nas pontas
alter table public.users drop constraint if exists users_username_format;
alter table public.users add constraint users_username_format
  check (username ~ '^[a-zA-Z0-9](?:[a-zA-Z0-9_]{1,18})[a-zA-Z0-9]$');

create index if not exists users_created_at_idx on public.users (created_at desc);

-- Usernames que nao podem ser tomados por membros.
create table if not exists public.reserved_usernames (
  username citext primary key
);

insert into public.reserved_usernames (username) values
  ('admin'), ('api'), ('app'), ('r1k'), ('r1kclub'), ('club'), ('checkout'),
  ('dashboard'), ('ranking'), ('login'), ('logout'), ('join'), ('u'), ('me'),
  ('welcome'), ('support'), ('suporte'), ('help'), ('root'), ('system'),
  ('settings'), ('billing'), ('terms'), ('privacy'), ('certificate'), ('share')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Contador de membros (fonte unica do member_number)
-- ---------------------------------------------------------------------------
create table if not exists public.member_counter (
  id   boolean primary key default true check (id),
  last integer not null default 0
);

insert into public.member_counter (id, last) values (true, 0) on conflict do nothing;

-- ---------------------------------------------------------------------------
-- memberships
-- ---------------------------------------------------------------------------
create table if not exists public.memberships (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references public.users(id) on delete cascade,
  member_number integer not null unique check (member_number > 0),
  tier          membership_tier not null default 'rich',
  amount_paid   bigint not null check (amount_paid >= 0), -- centavos
  purchased_at  timestamptz not null default now(),
  status        membership_status not null default 'active'
);

create index if not exists memberships_member_number_idx on public.memberships (member_number);
create index if not exists memberships_purchased_at_idx on public.memberships (purchased_at);

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.users(id) on delete set null,
  provider       text not null,
  transaction_id text not null,
  amount         bigint not null check (amount >= 0), -- centavos
  currency       text not null default 'BRL',
  status         payment_status not null default 'pending',
  tier           membership_tier not null default 'rich',
  raw_event      jsonb,
  created_at     timestamptz not null default now(),
  -- Idempotencia: o mesmo evento do gateway nunca vira dois pagamentos.
  unique (provider, transaction_id)
);

create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_created_at_idx on public.payments (created_at desc);

-- ---------------------------------------------------------------------------
-- referrals
-- ---------------------------------------------------------------------------
create table if not exists public.referrals (
  id               uuid primary key default gen_random_uuid(),
  referrer_id      uuid not null references public.users(id) on delete cascade,
  referred_user_id uuid not null unique references public.users(id) on delete cascade,
  created_at       timestamptz not null default now(),
  check (referrer_id <> referred_user_id)
);

create index if not exists referrals_referrer_idx on public.referrals (referrer_id);

-- ---------------------------------------------------------------------------
-- badges / user_badges
-- ---------------------------------------------------------------------------
create table if not exists public.badges (
  id          text primary key,
  name        text not null,
  description text not null,
  icon        text not null,
  sort_order  integer not null default 100
);

insert into public.badges (id, name, description, icon, sort_order) values
  ('og',              'OG',              'Um dos 50 primeiros membros.',      '👑', 10),
  ('first_100',       'FIRST 100',       'Um dos 100 primeiros membros.',     '💎', 20),
  ('founding_member', 'FOUNDING MEMBER', 'Um dos 1.000 primeiros membros.',   '🥇', 30),
  ('whale',           'WHALE',           'Investiu R$10.000 ou mais.',        '🐋', 40),
  ('influencer',      'INFLUENCER',      'Trouxe 10 membros para o clube.',   '🔥', 50)
on conflict (id) do update
  set name = excluded.name,
      description = excluded.description,
      icon = excluded.icon,
      sort_order = excluded.sort_order;

create table if not exists public.user_badges (
  user_id   uuid not null references public.users(id) on delete cascade,
  badge_id  text not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- ---------------------------------------------------------------------------
-- waitlist (fase 0 — validacao)
-- ---------------------------------------------------------------------------
create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      citext not null unique,
  source     text,
  ref        text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- rate_limits (secao 17 — rate limiting)
-- ---------------------------------------------------------------------------
create table if not exists public.rate_limits (
  bucket     text not null,
  identifier text not null,
  window_start timestamptz not null,
  count      integer not null default 0,
  primary key (bucket, identifier, window_start)
);

-- ---------------------------------------------------------------------------
-- audit_log (secao 17 — logs)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id         bigserial primary key,
  actor_id   uuid,
  action     text not null,
  target     text,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
