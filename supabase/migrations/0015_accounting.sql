-- Accounting: Finance can record payment/collection against approved money
-- documents, and holds a new manage_accounting capability for the reporting
-- section. Ghana and Rwanda stay separate (branch already on every document).

-- Payment tracking on money documents (disbursements and invoice collections).
alter table public.ops_documents
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists paid_at timestamptz,
  add column if not exists payment_ref text;

alter table public.ops_documents drop constraint if exists ops_documents_payment_status_check;
alter table public.ops_documents add constraint ops_documents_payment_status_check
  check (payment_status in ('unpaid', 'paid'));

-- New capability. Rebuild the role_capabilities CHECK to include it.
alter table public.role_capabilities drop constraint if exists role_capabilities_capability_check;
alter table public.role_capabilities add constraint role_capabilities_capability_check
  check (capability in (
    'manage_content', 'manage_media', 'manage_inbox',
    'manage_documents', 'manage_support', 'manage_users', 'manage_roles',
    'manage_accounting'
  ));

-- Finance gets accounting by default (admin holds every capability implicitly).
insert into public.role_capabilities (role, capability) values ('finance', 'manage_accounting')
on conflict (role, capability) do nothing;
