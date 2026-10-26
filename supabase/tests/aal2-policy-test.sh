#!/bin/bash
# Tests the authenticator rule on wardrobe_documents against a local
# Postgres (never the live project). Builds a throwaway database "wt" with a
# stand-in for the Supabase auth schema, applies the migrations in order, and
# checks who can read and write. Usage: PGHOST=/path/to/socket PGPORT=5499 bash supabase/tests/aal2-policy-test.sh
set -u
H=${PGHOST:?set PGHOST to a local test server socket or host}; P=${PGPORT:-5432}
HERE=$(cd "$(dirname "$0")" && pwd); REPO=$HERE/../migrations
T=$HERE
q() { psql -h $H -p $P -U postgres -d wt -v ON_ERROR_STOP=1 -qAt "$@" 2>&1; }
psql -h $H -p $P -U postgres -qc 'drop database if exists wt' -c 'create database wt' >/dev/null
q -f $T/mock-supabase.sql >/dev/null
q -f $REPO/20261024180000_create_wardrobe_documents.sql >/dev/null
q -c "insert into public.wardrobe_documents (user_id, data) values
  ('00000000-0000-0000-0000-00000000000a', '{\"who\":\"A\"}'),
  ('00000000-0000-0000-0000-00000000000b', '{\"who\":\"B\"}'),
  ('00000000-0000-0000-0000-00000000000c', '{\"who\":\"C\"}')"

# as USER AAL SQL -> runs SQL as a signed-in account with that assurance level
as() {
  local u=$1 aal=$2; shift 2
  q -c "begin; set local role authenticated; select set_config('request.jwt.claims', '{\"sub\":\"00000000-0000-0000-0000-00000000000$u\",\"role\":\"authenticated\",\"aal\":\"$aal\"}', true); $*; commit;" | sed -n '2,$p'
}
FAILED=0
check() { # name expected actual
  if [ "$2" = "$3" ]; then echo "PASS  $1"; else FAILED=$((FAILED+1)); echo "FAIL  $1"; echo "      expected: $2"; echo "      got:      $3"; fi
}
READ="select coalesce(string_agg(data->>'who', ',' order by data->>'who'), 'none') from public.wardrobe_documents"
UPD() { echo "update public.wardrobe_documents set data = jsonb_set(data, '{n}', '1') where user_id = '00000000-0000-0000-0000-00000000000$1' returning 'updated'"; }

echo "== Before: the first version of the rule"
q -f $REPO/20261024202000_require_aal2_for_enrolled_users.sql >/dev/null
check "no authenticator, read own (reproduces live error)" "ERROR:  permission denied for table mfa_factors" "$(as a aal1 "$READ" | head -1)"

echo "== After: the corrected rule"
q -f $REPO/20261026200000_fix_aal2_policy_lookup.sql >/dev/null || { echo "fix migration failed"; q -f $REPO/20261026200000_fix_aal2_policy_lookup.sql; exit 1; }
q -f $REPO/20261026200000_fix_aal2_policy_lookup.sql >/dev/null && echo "PASS  fix migration can run twice"
check "only one authenticator rule" "1" "$(q -c "select count(*) from pg_policies where tablename='wardrobe_documents' and policyname='Require AAL2 for enrolled wardrobe users'")"
check "original three rules still there" "4" "$(q -c "select count(*) from pg_policies where tablename='wardrobe_documents'")"
check "rows unchanged" "A,B,C" "$(q -c "select string_agg(data->>'who', ',' order by data->>'who') from public.wardrobe_documents")"

check "no authenticator, aal1: reads only own copy" "A" "$(as a aal1 "$READ")"
check "no authenticator, aal1: updates own copy" "updated" "$(as a aal1 "$(UPD a)")"
check "no authenticator, aal1: cannot update another's copy" "" "$(as a aal1 "$(UPD b)")"
check "authenticator, aal1 (no code yet): reads nothing" "none" "$(as b aal1 "$READ")"
check "authenticator, aal1: update blocked" "" "$(as b aal1 "$(UPD b)")"
check "authenticator, aal2 (code entered): reads only own copy" "B" "$(as b aal2 "$READ")"
check "authenticator, aal2: updates own copy" "updated" "$(as b aal2 "$(UPD b)")"
check "authenticator, aal2: cannot update another's copy" "" "$(as b aal2 "$(UPD a)")"
check "unfinished (unverified) authenticator counts as none" "C" "$(as c aal1 "$READ")"
check "signed-in account still cannot read the authenticator table" "ERROR:  permission denied for table mfa_factors" \
  "$(as a aal1 "select secret from auth.mfa_factors" | head -1)"
check "helper only answers for the signed-in account (A asks: false)" "f" "$(as a aal1 "select private.has_verified_authenticator()")"
check "helper only answers for the signed-in account (B asks: true)" "t" "$(as b aal1 "select private.has_verified_authenticator()")"
check "signed-out visitors cannot use the helper" "ERROR:  permission denied for schema private" \
  "$(q -c "begin; set local role anon; select private.has_verified_authenticator(); commit;" | head -1)"
check "signed-out visitors cannot read wardrobes" "ERROR:  permission denied for table wardrobe_documents" \
  "$(q -c "begin; set local role anon; select * from public.wardrobe_documents; commit;" | head -1)"
check "rows unchanged apart from the test updates" "A,B,C" "$(q -c "select string_agg(data->>'who', ',' order by data->>'who') from public.wardrobe_documents")"

# First upload (insert) for an account with an authenticator and no copy yet.
q -c "delete from public.wardrobe_documents where user_id = '00000000-0000-0000-0000-00000000000b'"
INS="insert into public.wardrobe_documents (user_id, data) values ('00000000-0000-0000-0000-00000000000b', '{\"who\":\"B2\"}') returning 'inserted'"
check "authenticator, aal1: first upload blocked" "ERROR:  new row violates row-level security policy \"Require AAL2 for enrolled wardrobe users\" for table \"wardrobe_documents\"" "$(as b aal1 "$INS" | head -1)"
check "authenticator, aal2: first upload allowed" "inserted" "$(as b aal2 "$INS")"
q -c "delete from public.wardrobe_documents where user_id = '00000000-0000-0000-0000-00000000000a'"
INSA="insert into public.wardrobe_documents (user_id, data) values ('00000000-0000-0000-0000-00000000000a', '{\"who\":\"A2\"}') returning 'inserted'"
check "no authenticator, aal1: first upload allowed" "inserted" "$(as a aal1 "$INSA")"
check "no authenticator: cannot create a copy for someone else" "ERROR:  new row violates row-level security policy for table \"wardrobe_documents\"" \
  "$(as a aal1 "insert into public.wardrobe_documents (user_id, data) values ('00000000-0000-0000-0000-00000000000c', '{}')" | head -1)"
# The app uploads with upsert (insert ... on conflict update).
UPS="insert into public.wardrobe_documents (user_id, data) values ('00000000-0000-0000-0000-00000000000b', '{\"who\":\"B3\"}') on conflict (user_id) do update set data = excluded.data returning 'upserted'"
check "authenticator, aal1: upload (upsert) blocked" "ERROR:  new row violates row-level security policy \"Require AAL2 for enrolled wardrobe users\" for table \"wardrobe_documents\"" "$(as b aal1 "$UPS" | head -1)"
check "authenticator, aal2: upload (upsert) allowed" "upserted" "$(as b aal2 "$UPS")"

if [ "$FAILED" -eq 0 ]; then echo "All checks passed."; else echo "$FAILED check(s) failed."; exit 1; fi
