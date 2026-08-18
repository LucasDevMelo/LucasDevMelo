\set ON_ERROR_STOP on
\pset pager off

-- ============ preparo: 3 usuarios ============
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111','joao@x.com'),
  ('22222222-2222-2222-2222-222222222222','pedro@x.com'),
  ('33333333-3333-3333-3333-333333333333','maria@x.com');

insert into public.users (id, email, username, display_name) values
  ('11111111-1111-1111-1111-111111111111','joao@x.com','joaosilva','João Silva'),
  ('22222222-2222-2222-2222-222222222222','pedro@x.com','pedrolima','Pedro Lima'),
  ('33333333-3333-3333-3333-333333333333','maria@x.com','mariacosta','Maria Costa');

\echo '=== 1. constraint de username ==='
select public.username_available('jo')      as "muito_curto_false",
       public.username_available('_joao')   as "underscore_inicio_false",
       public.username_available('admin')   as "reservado_false",
       public.username_available('JoaoSilva') as "ja_existe_case_insens_false",
       public.username_available('novomembro') as "livre_true";

\echo '=== 2. grant_membership: primeiro membro ==='
select * from public.grant_membership(
  '11111111-1111-1111-1111-111111111111','stripe','cs_aaa',100000,'BRL',null,null);

\echo '=== 3. idempotencia: MESMO evento reentregue 3x ==='
select * from public.grant_membership(
  '11111111-1111-1111-1111-111111111111','stripe','cs_aaa',100000,'BRL',null,null);
select * from public.grant_membership(
  '11111111-1111-1111-1111-111111111111','stripe','cs_aaa',100000,'BRL',null,null);

\echo '--> membership deve ter 1 linha, amount ainda 100000, contador em 1'
select count(*) as memberships, max(member_number) as numero, max(amount_paid) as valor
  from public.memberships;
select last as contador from public.member_counter;
select count(*) as payments from public.payments;

\echo '=== 4. referral: pedro entra pelo link do membro 1 ==='
select * from public.grant_membership(
  '22222222-2222-2222-2222-222222222222','stripe','cs_bbb',100000,'BRL','0001',null);
select referrer_id, referred_user_id from public.referrals;

\echo '=== 5. referral por username tambem funciona ==='
select * from public.grant_membership(
  '33333333-3333-3333-3333-333333333333','stripe','cs_ccc',100000,'BRL','joaosilva',null);
select count(*) as total_referrals_do_joao from public.referrals
 where referrer_id = '11111111-1111-1111-1111-111111111111';

\echo '=== 6. referral invalido nao quebra nem cria lixo ==='
insert into auth.users (id,email) values ('44444444-4444-4444-4444-444444444444','ana@x.com');
insert into public.users (id,email,username,display_name)
  values ('44444444-4444-4444-4444-444444444444','ana@x.com','anasouza','Ana Souza');
select member_number from public.grant_membership(
  '44444444-4444-4444-4444-444444444444','stripe','cs_ddd',100000,'BRL','9999',null);
select count(*) as referrals_total from public.referrals;

\echo '=== 7. badges automaticas ==='
select u.username, string_agg(ub.badge_id, ', ' order by ub.badge_id) as badges
  from public.user_badges ub join public.users u on u.id = ub.user_id
 group by u.username order by u.username;

\echo '=== 8. upgrade soma o valor e sobe o tier ==='
select * from public.grant_membership(
  '11111111-1111-1111-1111-111111111111','stripe','cs_upgrade',900000,'BRL',null,null);
select member_number, tier, amount_paid from public.memberships
 where user_id = '11111111-1111-1111-1111-111111111111';
\echo '--> numero de membro NAO pode ter mudado, e badge whale deve aparecer'
select badge_id from public.user_badges
 where user_id = '11111111-1111-1111-1111-111111111111' order by badge_id;

\echo '=== 9. tier_for_amount nas fronteiras ==='
select public.tier_for_amount(99999) a, public.tier_for_amount(100000) b,
       public.tier_for_amount(500000) c, public.tier_for_amount(1000000) d,
       public.tier_for_amount(5000000) e;

\echo '=== 10. rate limit ==='
select public.check_rate_limit('t','ip1',3,60) as t1,
       public.check_rate_limit('t','ip1',3,60) as t2,
       public.check_rate_limit('t','ip1',3,60) as t3,
       public.check_rate_limit('t','ip1',3,60) as "t4_deve_ser_false";

\echo '=== 11. club_stats ==='
select * from public.club_stats();

\echo '=== 12. views publicas ==='
select username, member_number, tier, amount_paid, referral_count
  from public.public_profiles order by member_number;
select username, tier, referral_count from public.public_referrers;
