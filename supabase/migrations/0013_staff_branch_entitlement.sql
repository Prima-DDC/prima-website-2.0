-- Staff gain a branch (Ghana or Rwanda) and an admin-set annual leave
-- entitlement. Branch drives document numbering, currency defaults, and
-- branch-scoped approvals; the entitlement drives the leave balance.

alter table public.profiles
  add column if not exists branch text not null default 'ghana',
  add column if not exists leave_entitlement int not null default 15;

alter table public.profiles drop constraint if exists profiles_branch_check;
alter table public.profiles add constraint profiles_branch_check
  check (branch in ('ghana', 'rwanda'));

alter table public.profiles drop constraint if exists profiles_leave_entitlement_check;
alter table public.profiles add constraint profiles_leave_entitlement_check
  check (leave_entitlement in (15, 18, 21, 30));
