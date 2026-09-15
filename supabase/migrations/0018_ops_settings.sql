-- Workspace-level operations settings (key/value JSON). First use: the
-- admin-configurable display columns for the document list views
-- (My Documents and Approvals).
create table if not exists public.ops_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ops_settings enable row level security;

-- Any signed-in user may read the settings (the list views apply them).
drop policy if exists "ops_settings readable" on public.ops_settings;
create policy "ops_settings readable" on public.ops_settings
  for select to authenticated using (true);

-- Only holders of the manage_documents capability may change them.
drop policy if exists "ops_settings manage" on public.ops_settings;
create policy "ops_settings manage" on public.ops_settings
  for all using (public.has_capability('manage_documents'))
  with check (public.has_capability('manage_documents'));
