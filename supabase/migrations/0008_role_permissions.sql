-- Per-request-type permissions: for each role, which request types it may
-- submit and which it may approve. Replaces the global roles.can_submit flag.

create table if not exists public.role_permissions (
  role text not null references public.roles (key) on delete cascade on update cascade,
  doc_type text not null check (doc_type in ('honour_certificate', 'fund_request', 'expense_form', 'leave_form', 'invoice')),
  can_submit boolean not null default false,
  can_approve boolean not null default false,
  primary key (role, doc_type)
);

-- Seed from the current state so nothing changes on day one:
-- every role except admin may submit every type (the prior default), and
-- roles already in the approval chain may approve every type.
insert into public.role_permissions (role, doc_type, can_submit, can_approve)
select
  r.key,
  dt.doc_type,
  (r.key <> 'admin') as can_submit,
  exists (select 1 from public.approval_stages s where s.role = r.key) as can_approve
from public.roles r
cross join (
  values ('honour_certificate'), ('fund_request'), ('expense_form'), ('leave_form'), ('invoice')
) as dt(doc_type)
on conflict (role, doc_type) do nothing;

-- Does the current user's role allow submitting this request type?
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
    join public.profiles p on p.role = rp.role
    where p.id = auth.uid() and rp.doc_type = p_type and rp.can_submit
  );
$$;

-- Rewrite the submission policy to enforce per-type permission in the DB.
drop policy if exists "owner insert" on public.ops_documents;
create policy "owner insert" on public.ops_documents
  for insert with check (
    submitted_by = auth.uid() and public.can_submit_doc(doc_type)
  );

-- The global flag is superseded by the per-type matrix.
alter table public.roles drop column if exists can_submit;

alter table public.role_permissions enable row level security;

drop policy if exists "role_permissions readable" on public.role_permissions;
create policy "role_permissions readable" on public.role_permissions
  for select to authenticated using (true);

drop policy if exists "role_permissions admin manage" on public.role_permissions;
create policy "role_permissions admin manage" on public.role_permissions
  for all using (public.is_admin()) with check (public.is_admin());
