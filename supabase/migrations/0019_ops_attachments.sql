-- Private bucket for supporting files attached to fund and expense requests
-- (receipts, invoices, quotations). Uploaded and read only through server
-- actions using the service role, then served via short-lived signed URLs;
-- no direct client access, so no storage.objects policies are granted.
insert into storage.buckets (id, name, public)
values ('ops-attachments', 'ops-attachments', false)
on conflict (id) do nothing;
