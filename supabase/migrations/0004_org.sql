-- Phase 5: organizational roles, sequential approvals, staff profiles,
-- avatars, and support ticketing.

-- ------------------------------------------------------------------ roles
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'hr', 'manager', 'ceo', 'employee', 'client'));

-- Reviewer roles (or admin) participate in the approval chain.
create or replace function public.is_approver()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'hr', 'manager', 'ceo')
  );
$$;

-- ------------------------------------------------------- staff directory
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists job_title text,
  add column if not exists photo_path text,
  add column if not exists division text,
  add column if not exists start_date date,
  add column if not exists contract_staff boolean not null default false,
  add column if not exists business_line text,
  add column if not exists direct_line text,
  add column if not exists whatsapp_number text,
  add column if not exists alt_email text;

-- Internal workspace: any signed-in member can read the staff directory
-- (names on approvals, tickets, and documents). Writes stay locked down.
drop policy if exists "profiles select own or admin" on public.profiles;
drop policy if exists "profiles select authenticated" on public.profiles;
create policy "profiles select authenticated" on public.profiles
  for select to authenticated using (true);

-- ------------------------------------------------------ approval chain
create table if not exists public.ops_approvals (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid not null references public.ops_documents (id) on delete cascade,
  stage text not null check (stage in ('hr', 'manager', 'ceo')),
  status text not null check (status in ('approved', 'rejected')),
  approver uuid references public.profiles (id) on delete set null,
  comment text,
  created_at timestamptz not null default now(),
  unique (doc_id, stage)
);

alter table public.ops_approvals enable row level security;

drop policy if exists "approvals visible" on public.ops_approvals;
create policy "approvals visible" on public.ops_approvals
  for select using (
    public.is_approver()
    or exists (
      select 1 from public.ops_documents d
      where d.id = doc_id and d.submitted_by = auth.uid()
    )
  );
-- Approval rows are written exclusively through vetted server actions
-- using the service role; no insert/update policies on purpose.

-- Approvers see the full queue; owners keep seeing their own documents.
drop policy if exists "owner or admin select" on public.ops_documents;
drop policy if exists "owner or approver select" on public.ops_documents;
create policy "owner or approver select" on public.ops_documents
  for select using (submitted_by = auth.uid() or public.is_approver());

drop policy if exists "owner or admin select events" on public.ops_events;
drop policy if exists "owner or approver select events" on public.ops_events;
create policy "owner or approver select events" on public.ops_events
  for select using (
    public.is_approver()
    or exists (
      select 1 from public.ops_documents d
      where d.id = doc_id and d.submitted_by = auth.uid()
    )
  );

drop policy if exists "actor insert" on public.ops_events;
create policy "actor insert" on public.ops_events
  for insert with check (
    actor = auth.uid()
    and exists (
      select 1 from public.ops_documents d
      where d.id = doc_id and (d.submitted_by = auth.uid() or public.is_approver())
    )
  );

alter table public.ops_events drop constraint if exists ops_events_action_check;
alter table public.ops_events add constraint ops_events_action_check
  check (action in ('submitted', 'signed', 'approved', 'rejected', 'commented', 'edited', 'deleted'));

-- ------------------------------------------------------------- counters
create or replace function public.next_doc_number(p_type text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year int := extract(year from now())::int;
  v_seq int;
  v_code text;
begin
  v_code := case p_type
    when 'honour_certificate' then 'HC'
    when 'fund_request' then 'FR'
    when 'expense_form' then 'EX'
    when 'leave_form' then 'LV'
    when 'invoice' then 'INV'
    when 'support_ticket' then 'TK'
    else 'DOC'
  end;

  insert into public.ops_counters (doc_type, year, seq)
  values (p_type, v_year, 1)
  on conflict (doc_type, year)
  do update set seq = public.ops_counters.seq + 1
  returning seq into v_seq;

  return 'PRIMA-' || v_code || '-' || v_year || '-' || lpad(v_seq::text, 4, '0');
end;
$$;

-- --------------------------------------------------------------- avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
-- Uploads go through the profile server action (service role) only.

-- ------------------------------------------------------ support tickets
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique,
  subject text not null,
  category text not null check (category in ('profile_change', 'it_support', 'access_request', 'other')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_ticket_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.ticket_number is null or new.ticket_number = '' then
    new.ticket_number := public.next_doc_number('support_ticket');
  end if;
  return new;
end;
$$;

drop trigger if exists support_tickets_number on public.support_tickets;
create trigger support_tickets_number
  before insert on public.support_tickets
  for each row execute function public.set_ticket_number();

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  author uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;

drop policy if exists "ticket owner insert" on public.support_tickets;
create policy "ticket owner insert" on public.support_tickets
  for insert with check (created_by = auth.uid() and ticket_number is not null);

drop policy if exists "ticket owner or admin select" on public.support_tickets;
create policy "ticket owner or admin select" on public.support_tickets
  for select using (created_by = auth.uid() or public.is_admin());

drop policy if exists "ticket admin update" on public.support_tickets;
create policy "ticket admin update" on public.support_tickets
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "message insert" on public.support_messages;
create policy "message insert" on public.support_messages
  for insert with check (
    author = auth.uid()
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and (t.created_by = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "message select" on public.support_messages;
create policy "message select" on public.support_messages
  for select using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and (t.created_by = auth.uid() or public.is_admin())
    )
  );
