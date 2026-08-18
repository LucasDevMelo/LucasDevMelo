-- =============================================================================
-- Aproximacao local do ambiente Supabase (roles, schema auth, auth.uid()).
-- Existe so para rodar as migrations num Postgres limpo — no projeto real o
-- Supabase ja fornece tudo isto.
-- =============================================================================
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;

create schema if not exists auth;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique
);

create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
