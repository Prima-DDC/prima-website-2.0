-- Multiple workspace roles per user. profiles.role stays as the "primary"
-- (most-privileged) role for display and default routing; the full set of
-- roles a user holds now lives in public.profile_roles, which drives every
-- role-based authorization check.

create table if not exists public.profile_roles (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null references public.roles (key) on delete cascade on update cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, role)
);

-- Backfill: every existing profile keeps the role it has today.
insert into public.profile_roles (profile_id, role)
select id, role from public.profiles
on conflict do nothing;

-- The primary role is always a member of the set: mirror profiles.role into
-- profile_roles on insert and whenever it changes. Removing a role is done
-- explicitly by the application; this trigger only ever adds the primary.
create or replace function public.sync_primary_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profile_roles (profile_id, role)
  values (new.id, new.role)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists profiles_sync_primary_role on public.profiles;
create trigger profiles_sync_primary_role
  after insert or update of role on public.profiles
  for each row execute function public.sync_primary_role();

-- --------------------------------------------------------- authorization
-- All role-based checks read the full set from profile_roles, so a user is
-- treated as holding a role if it is any of their assigned roles.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profile_roles
    where profile_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_approver()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profile_roles pr
    where pr.profile_id = auth.uid()
      and (pr.role = 'admin' or pr.role in (select role from public.approval_stages))
  );
$$;

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
    join public.profile_roles pr on pr.role = rc.role
    where pr.profile_id = auth.uid() and rc.capability = p_cap
  );
$$;

create or replace function public.can_submit_doc(p_type text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.role_permissions rp
    join public.profile_roles pr on pr.role = rp.role
    where pr.profile_id = auth.uid() and rp.doc_type = p_type and rp.can_submit
  );
$$;

-- ------------------------------------------------------------------- RLS
alter table public.profile_roles enable row level security;

drop policy if exists "profile_roles readable" on public.profile_roles;
create policy "profile_roles readable" on public.profile_roles
  for select using (profile_id = auth.uid() or public.has_capability('manage_users'));

drop policy if exists "profile_roles manage" on public.profile_roles;
create policy "profile_roles manage" on public.profile_roles
  for all using (public.has_capability('manage_users'))
  with check (public.has_capability('manage_users'));
