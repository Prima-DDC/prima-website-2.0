-- Excuse Duty document type, plus a Ghana/Rwanda branch on every document so
-- Rwanda runs a full parallel: its own numbering series (PRIMA-RW-...),
-- currency defaults, and branch-scoped approvals.

-- 1. Branch on documents and per-branch counters.
alter table public.ops_documents
  add column if not exists branch text not null default 'ghana';

alter table public.ops_counters
  add column if not exists branch text not null default 'ghana';
alter table public.ops_counters drop constraint if exists ops_counters_pkey;
alter table public.ops_counters add primary key (doc_type, branch, year);

-- 2. Allow the new doc_type on both constrained tables.
alter table public.ops_documents drop constraint if exists ops_documents_doc_type_check;
alter table public.ops_documents add constraint ops_documents_doc_type_check
  check (doc_type in ('honour_certificate', 'fund_request', 'petty_cash', 'expense_form', 'leave_form', 'excuse_duty', 'invoice'));

alter table public.role_permissions drop constraint if exists role_permissions_doc_type_check;
alter table public.role_permissions add constraint role_permissions_doc_type_check
  check (doc_type in ('honour_certificate', 'fund_request', 'petty_cash', 'expense_form', 'leave_form', 'excuse_duty', 'invoice'));

-- 3. Branch-aware doc numbering. Rwanda documents carry an RW segment and
--    number independently of Ghana. The one-arg form (used by support tickets)
--    delegates to Ghana.
create or replace function public.next_doc_number(p_type text, p_branch text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year int := extract(year from now())::int;
  v_seq int;
  v_code text;
  v_prefix text;
begin
  v_code := case p_type
    when 'honour_certificate' then 'HC'
    when 'fund_request' then 'FR'
    when 'petty_cash' then 'PC'
    when 'expense_form' then 'EX'
    when 'leave_form' then 'LV'
    when 'excuse_duty' then 'ED'
    when 'invoice' then 'INV'
    when 'support_ticket' then 'TK'
    else 'DOC'
  end;
  v_prefix := case when p_branch = 'rwanda' then 'RW-' else '' end;

  insert into public.ops_counters (doc_type, branch, year, seq)
  values (p_type, p_branch, v_year, 1)
  on conflict (doc_type, branch, year)
  do update set seq = public.ops_counters.seq + 1
  returning seq into v_seq;

  return 'PRIMA-' || v_prefix || v_code || '-' || v_year || '-' || lpad(v_seq::text, 4, '0');
end;
$$;

create or replace function public.next_doc_number(p_type text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.next_doc_number(p_type, 'ghana');
end;
$$;

-- 4. The document branch is authoritative from the submitter's profile; the
--    trigger sets it, then numbers within that branch.
create or replace function public.set_doc_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.branch := coalesce(
    (select branch from public.profiles where id = new.submitted_by),
    'ghana'
  );
  if new.doc_number is null or new.doc_number = '' then
    new.doc_number := public.next_doc_number(new.doc_type, new.branch);
  end if;
  return new;
end;
$$;

-- 5. Permissions for excuse duty: every internal role may submit; HR, Manager,
--    and CEO approve (same chain as leave).
insert into public.role_permissions (role, doc_type, can_submit, can_approve)
select r.key, 'excuse_duty', (r.key <> 'client'), false
from public.roles r
on conflict (role, doc_type) do nothing;

update public.role_permissions set can_approve = true
where doc_type = 'excuse_duty' and role in ('hr', 'manager', 'ceo');
