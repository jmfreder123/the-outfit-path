create table if not exists public.wardrobe_documents (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.wardrobe_documents enable row level security;
alter table public.wardrobe_documents force row level security;

revoke all on table public.wardrobe_documents from anon;
revoke all on table public.wardrobe_documents from authenticated;
grant select, insert, update on table public.wardrobe_documents to authenticated;

create policy "Users can read their own wardrobe"
on public.wardrobe_documents
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own wardrobe"
on public.wardrobe_documents
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own wardrobe"
on public.wardrobe_documents
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
