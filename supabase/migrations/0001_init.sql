-- PRIMA website 2.0 - initial schema: profiles, CMS content, contact inbox.

-- ------------------------------------------------------------ profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'employee' check (role in ('admin', 'employee', 'client')),
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so RLS policies can check the caller's role without
-- recursing into the profiles policies themselves.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles select own or admin" on public.profiles;
create policy "profiles select own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------ CMS tables
create table if not exists public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null,
  sort int not null default 0,
  t jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (page, section)
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sort int not null default 0,
  icon text not null default 'ShieldCheck',
  image_path text,
  t jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.industries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sort int not null default 0,
  icon text not null default 'Building2',
  related_service_slugs text[] not null default '{}',
  t jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.offices (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sort int not null default 0,
  phone text not null,
  whatsapp text,
  email text not null,
  map_url text,
  t jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.page_seo (
  page text primary key,
  og_image_path text,
  t jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Public content: anyone may read, only admins may write.
do $$
declare tbl text;
begin
  foreach tbl in array array['content_blocks', 'services', 'industries', 'offices', 'page_seo', 'site_settings']
  loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('drop policy if exists "public read" on public.%I', tbl);
    execute format('create policy "public read" on public.%I for select using (true)', tbl);
    execute format('drop policy if exists "admin manage" on public.%I', tbl);
    execute format(
      'create policy "admin manage" on public.%I for all using (public.is_admin()) with check (public.is_admin())',
      tbl
    );
  end loop;
end $$;

-- ------------------------------------------------------ contact submissions
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service_interest text,
  message text not null,
  locale text not null default 'en',
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

drop policy if exists "anyone can submit" on public.contact_submissions;
create policy "anyone can submit" on public.contact_submissions
  for insert with check (true);

drop policy if exists "admin read" on public.contact_submissions;
create policy "admin read" on public.contact_submissions
  for select using (public.is_admin());

drop policy if exists "admin update" on public.contact_submissions;
create policy "admin update" on public.contact_submissions
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin delete" on public.contact_submissions;
create policy "admin delete" on public.contact_submissions
  for delete using (public.is_admin());

-- --------------------------------------------------------------- storage
insert into storage.buckets (id, name, public)
values ('public-media', 'public-media', true)
on conflict (id) do nothing;

drop policy if exists "admin insert public-media" on storage.objects;
create policy "admin insert public-media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'public-media' and public.is_admin());

drop policy if exists "admin update public-media" on storage.objects;
create policy "admin update public-media" on storage.objects
  for update to authenticated
  using (bucket_id = 'public-media' and public.is_admin());

drop policy if exists "admin delete public-media" on storage.objects;
create policy "admin delete public-media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'public-media' and public.is_admin());
