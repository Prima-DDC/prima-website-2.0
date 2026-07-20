-- Administrators are staff too: they file leave, expenses, and other requests
-- like everyone else. The original seed (0008) excluded the admin role from
-- submitting, which left an admin-privileged user with no way to raise a
-- request. Grant the same submit rights every other role has; this stays
-- adjustable per request type from the Roles screen.

insert into public.role_permissions (role, doc_type, can_submit, can_approve)
select 'admin', dt.doc_type, true, false
from (
  values ('honour_certificate'), ('fund_request'), ('expense_form'), ('leave_form'), ('invoice')
) as dt(doc_type)
on conflict (role, doc_type) do update set can_submit = true;
