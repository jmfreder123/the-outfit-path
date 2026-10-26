-- Minimal stand-in for the parts of Supabase the wardrobe rules depend on.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end $$;
create schema auth;
grant usage on schema auth to anon, authenticated;
create table auth.users (id uuid primary key, email text);
create table auth.mfa_factors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  status text not null,
  secret text
);
-- As on the live project: signed-in accounts cannot read this table.
revoke all on auth.mfa_factors from public, anon, authenticated;
create function auth.jwt() returns jsonb language sql stable as
  $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(auth.jwt()->>'sub', '')::uuid $$;
grant execute on all functions in schema auth to anon, authenticated;
grant usage on schema public to anon, authenticated;

insert into auth.users values
  ('00000000-0000-0000-0000-00000000000a', 'no-authenticator@test'),
  ('00000000-0000-0000-0000-00000000000b', 'with-authenticator@test'),
  ('00000000-0000-0000-0000-00000000000c', 'unverified-authenticator@test');
insert into auth.mfa_factors (user_id, status, secret) values
  ('00000000-0000-0000-0000-00000000000b', 'verified', 'SECRET-B'),
  ('00000000-0000-0000-0000-00000000000c', 'unverified', 'SECRET-C');
