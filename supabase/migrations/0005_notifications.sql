-- In-app notifications; rows are written by vetted server actions
-- (service role) and read/managed by their recipient.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "own notifications select" on public.notifications;
create policy "own notifications select" on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists "own notifications update" on public.notifications;
create policy "own notifications update" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
