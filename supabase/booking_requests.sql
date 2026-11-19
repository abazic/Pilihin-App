create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  customer_name text not null,
  whatsapp text not null,
  session_date date not null,
  session_time time not null,
  locations text[] not null default '{}',
  package_key text not null,
  package_name text not null,
  participants integer not null default 1,
  addons jsonb not null default '[]'::jsonb,
  base_price integer not null,
  addons_price integer not null default 0,
  total_price integer not null,
  notes text,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected','completed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.booking_requests enable row level security;
drop policy if exists "Public can submit booking requests" on public.booking_requests;
create policy "Public can submit booking requests" on public.booking_requests
  for insert to anon, authenticated with check (status = 'pending');
drop policy if exists "Admins can read booking requests" on public.booking_requests;
create policy "Admins can read booking requests" on public.booking_requests
  for select to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Admins can update booking requests" on public.booking_requests;
create policy "Admins can update booking requests" on public.booking_requests
  for update to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
grant insert on public.booking_requests to anon, authenticated;
grant select, update on public.booking_requests to authenticated;
