\pset pager off
-- =============================================================================
-- checkout_intents: a barreira que impede alguem de virar membro por R$0,01
-- apontando um pagamento para o proprio user_id.
-- =============================================================================

insert into auth.users (id, email) values
  ('55555555-5555-5555-5555-555555555555','intent@x.com') on conflict do nothing;
insert into public.users (id, email, username, display_name) values
  ('55555555-5555-5555-5555-555555555555','intent@x.com','intentuser','Intent User')
  on conflict do nothing;

\echo '=== 1. intencao valida, valor exato ==='
insert into public.checkout_intents (id, user_id, tier, amount, ref) values
  ('aaaaaaaa-0000-0000-0000-000000000001','55555555-5555-5555-5555-555555555555','rich',100000,null);
select user_id, tier, expected_amount
  from public.consume_checkout_intent('aaaaaaaa-0000-0000-0000-000000000001', 100000);
select status from public.checkout_intents where id = 'aaaaaaaa-0000-0000-0000-000000000001';

\echo '=== 2. pagamento MENOR que o combinado deve ser RECUSADO ==='
insert into public.checkout_intents (id, user_id, tier, amount) values
  ('aaaaaaaa-0000-0000-0000-000000000002','55555555-5555-5555-5555-555555555555','rich',100000);
do $$ begin
  perform public.consume_checkout_intent('aaaaaaaa-0000-0000-0000-000000000002', 1);
  raise notice 'FALHA DE SEGURANCA: R$0,01 foi aceito para uma entrada de R$1.000';
exception when others then
  raise notice 'OK: recusado (%)', sqlerrm;
end $$;
select status as deve_continuar_created
  from public.checkout_intents where id = 'aaaaaaaa-0000-0000-0000-000000000002';

\echo '=== 3. intencao inexistente (external_reference forjado) ==='
do $$ begin
  perform public.consume_checkout_intent('aaaaaaaa-0000-0000-0000-0000000000ff', 100000);
  raise notice 'FALHA DE SEGURANCA: intencao desconhecida foi aceita';
exception when others then
  raise notice 'OK: recusado (%)', sqlerrm;
end $$;

\echo '=== 4. pagar MAIS que o combinado e permitido (upgrade/gorjeta) ==='
insert into public.checkout_intents (id, user_id, tier, amount) values
  ('aaaaaaaa-0000-0000-0000-000000000003','55555555-5555-5555-5555-555555555555','rich',100000);
select expected_amount
  from public.consume_checkout_intent('aaaaaaaa-0000-0000-0000-000000000003', 500000);

\echo '=== 5. reentrega: consumir a mesma intencao duas vezes nao quebra ==='
select user_id from public.consume_checkout_intent('aaaaaaaa-0000-0000-0000-000000000001', 100000);
select count(*) as intencoes_pagas from public.checkout_intents where status = 'paid';

\echo '=== 6. anon e authenticated nao enxergam a tabela ==='
set role anon;
do $$ begin
  perform count(*) from public.checkout_intents;
  raise notice 'FALHA DE SEGURANCA: anon leu checkout_intents';
exception when insufficient_privilege then
  raise notice 'OK: anon bloqueado em checkout_intents';
end $$;
do $$ begin
  perform public.consume_checkout_intent('aaaaaaaa-0000-0000-0000-000000000001', 100000);
  raise notice 'FALHA DE SEGURANCA: anon executou consume_checkout_intent';
exception when insufficient_privilege then
  raise notice 'OK: consume_checkout_intent negado para anon';
end $$;
reset role;

set role authenticated;
set request.jwt.claim.sub = '55555555-5555-5555-5555-555555555555';
do $$ begin
  perform count(*) from public.checkout_intents;
  raise notice 'FALHA DE SEGURANCA: membro leu checkout_intents';
exception when insufficient_privilege then
  raise notice 'OK: authenticated bloqueado em checkout_intents';
end $$;
reset role;
