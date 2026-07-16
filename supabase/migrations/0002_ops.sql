-- PRIMA website 2.0 - internal ops: documents, approvals, audit trail, PDFs.

create table if not exists public.ops_counters (
  doc_type text not null,
  year int not null,
  seq int not null default 0,
  primary key (doc_type, year)
);

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

create table if not exists public.ops_documents (
  id uuid primary key default gen_random_uuid(),
  doc_type text not null check (doc_type in ('honour_certificate', 'fund_request', 'expense_form', 'leave_form', 'invoice')),
  doc_number text not null unique,
  data jsonb not null default '{}'::jsonb,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'approved', 'rejected')),
  submitted_by uuid not null references public.profiles (id) on delete cascade,
  reviewed_by uuid references public.profiles (id),
  review_comment text,
  pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_doc_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.doc_number is null or new.doc_number = '' then
    new.doc_number := public.next_doc_number(new.doc_type);
  end if;
  return new;
end;
$$;

drop trigger if exists ops_documents_doc_number on public.ops_documents;
create trigger ops_documents_doc_number
  before insert on public.ops_documents
  for each row execute function public.set_doc_number();

create table if not exists public.ops_events (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid not null references public.ops_documents (id) on delete cascade,
  actor uuid not null references public.profiles (id) on delete cascade,
  action text not null check (action in ('submitted', 'approved', 'rejected', 'commented')),
  comment text,
  created_at timestamptz not null default now()
);

alter table public.ops_counters enable row level security;
alter table public.ops_documents enable row level security;
alter table public.ops_events enable row level security;

-- ops_documents: owners insert/read their own, admins read/update everything.
drop policy if exists "owner insert" on public.ops_documents;
create policy "owner insert" on public.ops_documents
  for insert with check (submitted_by = auth.uid());

drop policy if exists "owner or admin select" on public.ops_documents;
create policy "owner or admin select" on public.ops_documents
  for select using (submitted_by = auth.uid() or public.is_admin());

drop policy if exists "owner update draft" on public.ops_documents;
create policy "owner update draft" on public.ops_documents
  for update using (submitted_by = auth.uid() and status = 'draft')
  with check (submitted_by = auth.uid());

drop policy if exists "admin update" on public.ops_documents;
create policy "admin update" on public.ops_documents
  for update using (public.is_admin()) with check (public.is_admin());

-- ops_events: actors insert their own events on visible docs; same visibility.
drop policy if exists "actor insert" on public.ops_events;
create policy "actor insert" on public.ops_events
  for insert with check (
    actor = auth.uid()
    and exists (
      select 1 from public.ops_documents d
      where d.id = doc_id and (d.submitted_by = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "owner or admin select events" on public.ops_events;
create policy "owner or admin select events" on public.ops_events
  for select using (
    exists (
      select 1 from public.ops_documents d
      where d.id = doc_id and (d.submitted_by = auth.uid() or public.is_admin())
    )
  );

-- Private bucket for generated PDFs; served via short-lived signed URLs only.
insert into storage.buckets (id, name, public)
values ('ops-pdfs', 'ops-pdfs', false)
on conflict (id) do nothing;
