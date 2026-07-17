-- Dynamic role management and admin-configurable sequential approval chain.

create table if not exists public.roles (
  key text primary key,
  label text not null,
  sort int not null default 100,
  -- Built-in roles are structural (admin access, signup default, public
  -- clients) and cannot be deleted.
  built_in boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.roles (key, label, sort, built_in) values
  ('admin', 'Admin', 1, true),
  ('hr', 'HR', 2, false),
  ('manager', 'Manager', 3, false),
  ('ceo', 'CEO', 4, false),
  ('employee', 'Employee', 5, true),
  ('client', 'Client', 6, true)
on conflict (key) do nothing;

-- profiles.role now references the roles table instead of a fixed check.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles drop constraint if exists profiles_role_fkey;
alter table public.profiles
  add constraint profiles_role_fkey
  foreign key (role) references public.roles (key)
  on update cascade;

-- The sequential sign-off chain, ordered by sort. Admin-configurable.
create table if not exists public.approval_stages (
  id uuid primary key default gen_random_uuid(),
  role text not null unique references public.roles (key) on update cascade,
  sort int not null,
  created_at timestamptz not null default now()
);

insert into public.approval_stages (role, sort)
select v.role, v.sort
from (values ('hr', 1), ('manager', 2), ('ceo', 3)) as v(role, sort)
where not exists (select 1 from public.approval_stages);

-- Historical approvals keep their stage text even if a role is later
-- removed from the chain; drop the fixed check.
alter table public.ops_approvals drop constraint if exists ops_approvals_stage_check;

-- Approver = admin or any role currently in the chain.
create or replace function public.is_approver()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.role = 'admin' or p.role in (select role from public.approval_stages))
  );
$$;

alter table public.roles enable row level security;
alter table public.approval_stages enable row level security;

drop policy if exists "roles readable" on public.roles;
create policy "roles readable" on public.roles
  for select to authenticated using (true);

drop policy if exists "roles admin manage" on public.roles;
create policy "roles admin manage" on public.roles
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "stages readable" on public.approval_stages;
create policy "stages readable" on public.approval_stages
  for select to authenticated using (true);

drop policy if exists "stages admin manage" on public.approval_stages;
create policy "stages admin manage" on public.approval_stages
  for all using (public.is_admin()) with check (public.is_admin());
