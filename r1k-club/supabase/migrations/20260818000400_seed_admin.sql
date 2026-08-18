-- =============================================================================
-- Promover a primeira conta a admin.
--
-- Rode DEPOIS de criar sua conta (pelo checkout ou pelo painel do Supabase
-- Auth). Troque o e-mail e execute no SQL Editor.
-- =============================================================================

-- O tipo citext vive no schema `extensions`; sem isto o DDL nao o resolve.
set search_path = public, extensions;

-- update public.users
--    set is_admin = true
--  where email = 'voce@email.com';

-- Conferencia rapida do estado do clube:
--   select member_number, u.username, m.tier, m.amount_paid, m.purchased_at
--     from public.memberships m
--     join public.users u on u.id = m.user_id
--    order by member_number;
