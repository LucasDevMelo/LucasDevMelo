\pset pager off
\echo '========== COMO ANON (visitante nao logado) =========='
set role anon;

\echo '-- users: e-mails NAO podem vazar'
select count(*) as linhas_visiveis from public.users;
\echo '-- payments'
select count(*) as linhas_visiveis from public.payments;
\echo '-- memberships'
select count(*) as linhas_visiveis from public.memberships;
\echo '-- audit_log'
select count(*) as linhas_visiveis from public.audit_log;
\echo '-- member_counter (manipular isso = manipular numero de membro)'
select count(*) as linhas_visiveis from public.member_counter;

\echo '-- view publica: DEVE funcionar, e sem coluna de e-mail'
select username, member_number, tier from public.public_profiles order by member_number limit 3;
select column_name from information_schema.columns
 where table_name = 'public_profiles' and column_name in ('email','id','user_id');
\echo '   (vazio acima = nenhuma coluna sensivel exposta)'

\echo '-- anon tentando incrementar o contador'
do $$ begin
  update public.member_counter set last = 999;
  raise notice 'FALHA DE SEGURANCA: anon conseguiu escrever no contador';
exception when insufficient_privilege or others then
  raise notice 'OK: anon bloqueado (%)', sqlerrm;
end $$;

\echo '-- anon tentando virar membro na marra'
do $$ begin
  perform public.grant_membership('11111111-1111-1111-1111-111111111111','x','y',1);
  raise notice 'FALHA DE SEGURANCA: anon executou grant_membership';
exception when insufficient_privilege then
  raise notice 'OK: grant_membership negado para anon';
end $$;

\echo '-- anon tentando ler metricas do admin'
do $$ begin
  perform public.admin_metrics();
  raise notice 'FALHA DE SEGURANCA: anon leu admin_metrics';
exception when insufficient_privilege then
  raise notice 'OK: admin_metrics negado para anon';
end $$;

reset role;

\echo ''
\echo '========== COMO AUTHENTICATED (pedro, membro comum) =========='
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

\echo '-- ve apenas a propria linha em users'
select username from public.users;
\echo '-- ve apenas os proprios pagamentos'
select count(*) as meus_pagamentos from public.payments;
\echo '-- ve apenas a propria membership'
select member_number from public.memberships;

\echo '-- tentando se auto-promover a admin'
do $$ begin
  update public.users set is_admin = true where id = auth.uid();
  raise notice 'FALHA DE SEGURANCA: usuario virou admin';
exception when insufficient_privilege then
  raise notice 'OK: coluna is_admin fora do grant de UPDATE';
end $$;

\echo '-- tentando trocar o proprio username'
do $$ begin
  update public.users set username = 'joaosilva2' where id = auth.uid();
  raise notice 'FALHA DE SEGURANCA: usuario trocou o username';
exception when insufficient_privilege then
  raise notice 'OK: coluna username fora do grant de UPDATE';
end $$;

\echo '-- pode editar o proprio display_name (permitido)'
update public.users set display_name = 'Pedro L.' where id = auth.uid();
select display_name from public.users;

\echo '-- tentando editar o nome de OUTRA pessoa'
update public.users set display_name = 'HACKED'
 where id = '11111111-1111-1111-1111-111111111111';
\echo '   (0 linhas acima = RLS bloqueou)'

\echo '-- tentando ler metricas do admin sendo membro comum'
do $$ begin
  perform public.admin_metrics();
  raise notice 'FALHA DE SEGURANCA: membro comum leu admin_metrics';
exception when insufficient_privilege then
  raise notice 'OK: admin_metrics exige is_admin';
end $$;

\echo '-- tentando bloquear outra conta'
do $$ begin
  perform public.admin_set_blocked('11111111-1111-1111-1111-111111111111', true);
  raise notice 'FALHA DE SEGURANCA: membro comum bloqueou outra conta';
exception when insufficient_privilege then
  raise notice 'OK: admin_set_blocked exige is_admin';
end $$;

reset role;

\echo ''
\echo '========== COMO ADMIN =========='
update public.users set is_admin = true where id = '11111111-1111-1111-1111-111111111111';
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select jsonb_pretty(public.admin_metrics() - 'members_by_day') as metricas;
select count(*) as usuarios_visiveis_para_admin from public.users;
reset role;
