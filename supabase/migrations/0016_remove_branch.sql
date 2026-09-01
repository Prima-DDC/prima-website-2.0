-- The app is Ghana-only: remove the Ghana/Rwanda branch system, and rebuild the
-- doc-number counters to the highest number actually used so a new document can
-- never collide with an existing doc_number.

-- 1. Single-series numbering: revert the branch-aware generator and trigger.
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
    when 'excuse_duty' then 'ED'
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

drop function if exists public.next_doc_number(text, text);

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

-- 2. Rebuild counters: one row per (doc_type, year); seq = highest number used
--    (parsed from existing doc_numbers, across any historical branch prefix).
alter table public.ops_counters drop constraint if exists ops_counters_pkey;
delete from public.ops_counters;
alter table public.ops_counters drop column if exists branch;
alter table public.ops_counters add primary key (doc_type, year);

insert into public.ops_counters (doc_type, year, seq)
select
  doc_type,
  (regexp_replace(doc_number, '^.*-([0-9]{4})-[0-9]+$', '\1'))::int as yr,
  max((regexp_replace(doc_number, '^.*-([0-9]+)$', '\1'))::int) as seq
from public.ops_documents
group by doc_type, (regexp_replace(doc_number, '^.*-([0-9]{4})-[0-9]+$', '\1'))::int;

-- 3. Drop the branch columns.
alter table public.ops_documents drop column if exists branch;
alter table public.profiles drop constraint if exists profiles_branch_check;
alter table public.profiles drop column if exists branch;
