-- Configurable request submission: which roles may create documents.
-- New roles default to allowed; admin is excluded by default (configurable).
alter table public.roles
  add column if not exists can_submit boolean not null default true;

update public.roles set can_submit = false where key = 'admin';

-- Defense in depth: the database itself refuses inserts from roles that
-- are not allowed to submit.
drop policy if exists "owner insert" on public.ops_documents;
create policy "owner insert" on public.ops_documents
  for insert with check (
    submitted_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      join public.roles r on r.key = p.role
      where p.id = auth.uid() and r.can_submit
    )
  );
