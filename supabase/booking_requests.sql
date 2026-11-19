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
-- Public inserts are handled by the server API using the service-role key.
revoke insert on public.booking_requests from anon, authenticated;
grant insert on public.booking_requests to service_role;
grant select, update on public.booking_requests to authenticated;
