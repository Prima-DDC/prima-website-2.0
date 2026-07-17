-- Capability-based access to management features. Admins assign capabilities
-- to roles; admin implicitly holds every capability.
create table if not exists public.role_capabilities (
  role text not null references public.roles (key) on delete cascade on update cascade,
  capability text not null check (capability in (
    'manage_content', 'manage_media', 'manage_inbox',
    'manage_documents', 'manage_support', 'manage_users', 'manage_roles'
  )),
  primary key (role, capability)
);

-- Does the current user hold a capability (admins hold all)?
create or replace function public.has_capability(p_cap text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.role_capabilities rc
    join public.profiles p on p.role = rc.role
    where p.id = auth.uid() and rc.capability = p_cap
  );
$$;

alter table public.role_capabilities enable row level security;

drop policy if exists "role_capabilities readable" on public.role_capabilities;
create policy "role_capabilities readable" on public.role_capabilities
  for select to authenticated using (true);

drop policy if exists "role_capabilities manage" on public.role_capabilities;
create policy "role_capabilities manage" on public.role_capabilities
  for all using (public.has_capability('manage_roles'))
  with check (public.has_capability('manage_roles'));

-- Re-point existing admin-only policies at the matching capability so a role
-- granted the capability gains direct read/write where pages use the user
-- session client. Server actions additionally gate with requireCapability.

-- Website content
do $$
declare tbl text;
begin
  foreach tbl in array array['content_blocks', 'services', 'industries', 'offices', 'page_seo', 'site_settings']
  loop
    execute format('drop policy if exists "admin manage" on public.%I', tbl);
    execute format(
      'create policy "admin manage" on public.%I for all using (public.has_capability(''manage_content'')) with check (public.has_capability(''manage_content''))',
      tbl
    );
  end loop;
end $$;

-- Enquiry inbox
drop policy if exists "admin read" on public.contact_submissions;
create policy "admin read" on public.contact_submissions
  for select using (public.has_capability('manage_inbox'));
drop policy if exists "admin update" on public.contact_submissions;
create policy "admin update" on public.contact_submissions
  for update using (public.has_capability('manage_inbox')) with check (public.has_capability('manage_inbox'));
drop policy if exists "admin delete" on public.contact_submissions;
create policy "admin delete" on public.contact_submissions
  for delete using (public.has_capability('manage_inbox'));

-- Media library (storage objects)
drop policy if exists "admin insert public-media" on storage.objects;
create policy "admin insert public-media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'public-media' and public.has_capability('manage_media'));
drop policy if exists "admin update public-media" on storage.objects;
create policy "admin update public-media" on storage.objects
  for update to authenticated
  using (bucket_id = 'public-media' and public.has_capability('manage_media'));
drop policy if exists "admin delete public-media" on storage.objects;
create policy "admin delete public-media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'public-media' and public.has_capability('manage_media'));

-- Support desk
drop policy if exists "ticket owner or admin select" on public.support_tickets;
create policy "ticket owner or admin select" on public.support_tickets
  for select using (created_by = auth.uid() or public.has_capability('manage_support'));
drop policy if exists "ticket admin update" on public.support_tickets;
create policy "ticket admin update" on public.support_tickets
  for update using (public.has_capability('manage_support')) with check (public.has_capability('manage_support'));

drop policy if exists "message insert" on public.support_messages;
create policy "message insert" on public.support_messages
  for insert with check (
    author = auth.uid()
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and (t.created_by = auth.uid() or public.has_capability('manage_support'))
    )
  );
drop policy if exists "message select" on public.support_messages;
create policy "message select" on public.support_messages
  for select using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and (t.created_by = auth.uid() or public.has_capability('manage_support'))
    )
  );

-- Roles, permissions, and the approval chain
do $$
declare tbl text;
begin
  foreach tbl in array array['roles', 'approval_stages', 'role_permissions']
  loop
    execute format('drop policy if exists "%s" on public.%I',
      case tbl when 'roles' then 'roles admin manage' when 'approval_stages' then 'stages admin manage' else 'role_permissions admin manage' end, tbl);
    execute format(
      'create policy "cap manage" on public.%I for all using (public.has_capability(''manage_roles'')) with check (public.has_capability(''manage_roles''))',
      tbl
    );
  end loop;
end $$;
