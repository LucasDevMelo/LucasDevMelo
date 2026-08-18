#!/usr/bin/env bash
# =============================================================================
# Roda as migrations e a suite de testes num Postgres descartavel.
#
#   ./supabase/tests/run.sh
#
# Precisa de postgresql-16 instalado localmente. Nao toca no banco do projeto.
# =============================================================================
set -euo pipefail

PGBIN=${PGBIN:-/usr/lib/postgresql/16/bin}
PGDATA=${PGDATA:-/tmp/r1k-pgdata}
PGPORT=${PGPORT:-55432}
SOCK=/tmp
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$HERE/../.."

psqlc() { psql -h "$SOCK" -p "$PGPORT" -U postgres "$@"; }

if ! pg_isready -h "$SOCK" -p "$PGPORT" >/dev/null 2>&1; then
  echo "==> subindo Postgres em $PGDATA"
  rm -rf "$PGDATA"
  "$PGBIN/initdb" -D "$PGDATA" -A trust -U postgres >/dev/null
  "$PGBIN/pg_ctl" -D "$PGDATA" -o "-p $PGPORT -k $SOCK" -l /tmp/r1k-pg.log start >/dev/null
  sleep 2
fi

echo "==> recriando banco r1k_test"
psqlc -q -c "drop database if exists r1k_test;" -c "create database r1k_test;"
psqlc -d r1k_test -q -f "$HERE/00_shim.sql" 2>&1 | grep -v "already exists" || true

echo "==> aplicando migrations"
for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "    $(basename "$f")"
  psqlc -d r1k_test -q -v ON_ERROR_STOP=1 -f "$f" 2>&1 | grep -v NOTICE || true
done

echo "==> 01_domain.sql"
psqlc -d r1k_test -v ON_ERROR_STOP=1 -f "$HERE/01_domain.sql"

echo "==> 02_rls.sql"
psqlc -d r1k_test -f "$HERE/02_rls.sql"

echo "==> 03_concurrency: 40 compras simultaneas + 20 reentregas"
psqlc -d r1k_test -q -c "
  truncate public.memberships, public.payments, public.referrals,
           public.user_badges, public.audit_log restart identity cascade;
  update public.member_counter set last = 0;
  insert into auth.users (id, email)
    select ('00000000-0000-0000-0000-' || lpad(i::text,12,'0'))::uuid, 'c'||i||'@x.com'
      from generate_series(1,40) i on conflict do nothing;
  insert into public.users (id, email, username, display_name)
    select ('00000000-0000-0000-0000-' || lpad(i::text,12,'0'))::uuid,
           'c'||i||'@x.com', 'conc'||i, 'Conc '||i
      from generate_series(1,40) i on conflict do nothing;"

for i in $(seq 1 40); do
  uuid="00000000-0000-0000-0000-$(printf '%012d' "$i")"
  psqlc -d r1k_test -q -c \
    "select public.grant_membership('$uuid','stripe','cc_$i',100000,'BRL',null,null);" >/dev/null 2>&1 &
  if [ $((i % 2)) -eq 0 ]; then
    psqlc -d r1k_test -q -c \
      "select public.grant_membership('$uuid','stripe','cc_$i',100000,'BRL',null,null);" >/dev/null 2>&1 &
  fi
done
wait

psqlc -d r1k_test -c "
select count(*)                        as memberships,
       count(distinct member_number)   as numeros_distintos,
       min(member_number)              as menor,
       max(member_number)              as maior,
       (max(member_number) - min(member_number) + 1) - count(*) as gaps,
       sum(amount_paid)                as total_cobrado
  from public.memberships;
-- esperado: 40 | 40 | 1 | 40 | 0 | 4000000"

echo
echo "==> fim. para derrubar: $PGBIN/pg_ctl -D $PGDATA stop"
