-- Petty Cash Request: a new itemized money request type.
-- Submitted by any internal role; approved by Finance, then Manager, then CEO
-- (those roles already sit in approval_stages, so the chain resolves in order).

-- Allow the new doc_type on both tables that constrain it.
alter table public.ops_documents drop constraint if exists ops_documents_doc_type_check;
alter table public.ops_documents add constraint ops_documents_doc_type_check
  check (doc_type in ('honour_certificate', 'fund_request', 'petty_cash', 'expense_form', 'leave_form', 'invoice'));

alter table public.role_permissions drop constraint if exists role_permissions_doc_type_check;
alter table public.role_permissions add constraint role_permissions_doc_type_check
  check (doc_type in ('honour_certificate', 'fund_request', 'petty_cash', 'expense_form', 'leave_form', 'invoice'));

-- Doc-number code for petty cash (PRIMA-PC-YYYY-NNNN).
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
    when 'petty_cash' then 'PC'
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

-- Permissions: every internal role may submit (the external client role stays
-- invoice-only); Finance, Manager, and CEO approve.
insert into public.role_permissions (role, doc_type, can_submit, can_approve)
select r.key, 'petty_cash', (r.key <> 'client'), false
from public.roles r
on conflict (role, doc_type) do nothing;

update public.role_permissions set can_approve = true
where doc_type = 'petty_cash' and role in ('finance', 'manager', 'ceo');
