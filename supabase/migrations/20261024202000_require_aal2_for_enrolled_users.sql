-- Optional TOTP enforcement for The Outfit Path.
-- SUPERSEDED: this version reads auth.mfa_factors inside the rule, which
-- signed-in accounts may not read, so every cloud read and write fails with
-- "permission denied for table mfa_factors". Applied 2026-10-26 and replaced
-- the same day by 20261026200000_fix_aal2_policy_lookup.sql. Run both in
-- order on a new database; never this one alone.
-- Review and run this in Supabase only after the frontend MFA flows are deployed
-- and the two-account isolation test has passed. It preserves existing rows.

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'wardrobe_documents'
      and policyname = 'Require AAL2 for enrolled wardrobe users'
  ) then
    create policy "Require AAL2 for enrolled wardrobe users"
      on public.wardrobe_documents
      as restrictive
      for all
      to authenticated
      using (
        array[(select auth.jwt()->>'aal')] <@ (
          select case
            when count(id) > 0 then array['aal2']
            else array['aal1', 'aal2']
          end
          from auth.mfa_factors
          where (select auth.uid()) = user_id
            and status = 'verified'
        )
      )
      with check (
        array[(select auth.jwt()->>'aal')] <@ (
          select case
            when count(id) > 0 then array['aal2']
            else array['aal1', 'aal2']
          end
          from auth.mfa_factors
          where (select auth.uid()) = user_id
            and status = 'verified'
        )
      );
  end if;
end
$$;
