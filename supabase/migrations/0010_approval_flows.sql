-- Finance and Operations roles, per-type approval flow defaults, and CEO
-- self-service access to roles and request administration.
-- Default flows: Leave -> HR, Manager, CEO. Money types (honour certificate,
-- fund request, expense form, invoice) -> Finance, Manager, CEO.

insert into public.roles (key, label, sort, built_in) values
  ('finance', 'Finance', 7, false),
  ('operations', 'Operations', 8, false)
on conflict (key) do nothing;

-- Chain order: operations, hr, finance, manager, ceo. Finance joins the
-- chain now; operations stays out until it is granted approvals.
update public.approval_stages set sort = 2 where role = 'hr';
update public.approval_stages set sort = 4 where role = 'manager';
update public.approval_stages set sort = 5 where role = 'ceo';
insert into public.approval_stages (role, sort)
select 'finance', 3
where not exists (select 1 from public.approval_stages where role = 'finance');

-- Per-type submit parity for the new roles.
insert into public.role_permissions (role, doc_type, can_submit, can_approve)
select r.key, dt.doc_type, true, false
from (values ('finance'), ('operations')) as r(key)
cross join (
  values ('honour_certificate'), ('fund_request'), ('expense_form'), ('leave_form'), ('invoice')
) as dt(doc_type)
on conflict (role, doc_type) do nothing;

-- Money requests are reviewed by Finance, not HR.
update public.role_permissions set can_approve = true
where role = 'finance'
  and doc_type in ('honour_certificate', 'fund_request', 'expense_form', 'invoice');
update public.role_permissions set can_approve = false
where role = 'hr'
  and doc_type in ('honour_certificate', 'fund_request', 'expense_form', 'invoice');

-- The CEO manages approval flows and request administration directly.
insert into public.role_capabilities (role, capability) values
  ('ceo', 'manage_roles'),
  ('ceo', 'manage_documents')
on conflict (role, capability) do nothing;
