-- Applied to the live project by John on 2026-10-26, after the first version
-- (20261024202000) turned out to block every account's cloud copy.
-- Replaces the authenticator rule on wardrobe_documents.
--
-- The first version read auth.mfa_factors directly inside the rule.
-- Signed-in accounts are not allowed to read that table, so every cloud
-- read and write failed with "permission denied for table mfa_factors".
--
-- This version asks a small helper function instead. The function runs
-- with its owner's rights, answers only "does the signed-in account have a
-- verified authenticator?", and lives in a schema the website's API does
-- not expose. Accounts without an authenticator are unaffected; accounts
-- with one need the six-digit code (aal2). No rows are changed.

begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.has_verified_authenticator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.mfa_factors
    where user_id = (select auth.uid())
      and status = 'verified'
  );
$$;

revoke all on function private.has_verified_authenticator() from public, anon;
grant execute on function private.has_verified_authenticator() to authenticated;

drop policy if exists "Require AAL2 for enrolled wardrobe users" on public.wardrobe_documents;

create policy "Require AAL2 for enrolled wardrobe users"
  on public.wardrobe_documents
  as restrictive
  for all
  to authenticated
  using (
    (select auth.jwt()->>'aal') = 'aal2'
    or not (select private.has_verified_authenticator())
  )
  with check (
    (select auth.jwt()->>'aal') = 'aal2'
    or not (select private.has_verified_authenticator())
  );

commit;
