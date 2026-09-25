-- Pilihin App persistent schema. Safe to run repeatedly.
create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('client','admin');
exception when duplicate_object then null; end $$;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(), name text not null, email text, whatsapp text,
  summary text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade, username text not null unique,
  whatsapp text, role public.user_role not null default 'client', client_id uuid references public.clients(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade,
  name text not null, summary text, gdrive_folder_id text, max_photos integer check (max_photos is null or max_photos > 0),
  expire_date date, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  external_id text, name text not null, url text not null, sort_order integer not null default 0, created_at timestamptz not null default now(),
  unique(project_id, external_id)
);
create table if not exists public.photo_selections (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade, photo_id uuid not null references public.photos(id) on delete cascade,
  selected_at timestamptz not null default now(), unique(client_id, project_id, photo_id)
);

create index if not exists profiles_client_id_idx on public.profiles(client_id);
create index if not exists projects_client_id_idx on public.projects(client_id);
create index if not exists photos_project_id_idx on public.photos(project_id);
create index if not exists photo_selections_client_project_idx on public.photo_selections(client_id, project_id);

create or replace function public.set_updated_at() returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists clients_updated_at on public.clients; create trigger clients_updated_at before update on public.clients for each row execute function public.set_updated_at();
drop trigger if exists profiles_updated_at on public.profiles; create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists projects_updated_at on public.projects; create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;
create or replace function public.my_client_id() returns uuid language sql stable security definer set search_path = public
as $$ select client_id from public.profiles where id = auth.uid(); $$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare new_client_id uuid;
begin
  if coalesce(new.raw_user_meta_data->>'role','client') = 'admin' then
    insert into public.profiles(id, username, whatsapp, role)
    values(new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)), new.raw_user_meta_data->>'whatsapp', 'admin')
    on conflict (id) do nothing;
  else
    insert into public.clients(name, email, whatsapp)
    values(coalesce(nullif(new.raw_user_meta_data->>'full_name',''), nullif(new.raw_user_meta_data->>'username',''), split_part(new.email,'@',1)), new.email, new.raw_user_meta_data->>'whatsapp')
    returning id into new_client_id;
    insert into public.profiles(id, username, whatsapp, role, client_id)
    values(new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)), new.raw_user_meta_data->>'whatsapp', 'client', new_client_id)
    on conflict (id) do nothing;
  end if;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security; alter table public.clients enable row level security;
alter table public.projects enable row level security; alter table public.photos enable row level security; alter table public.photo_selections enable row level security;

drop policy if exists profiles_self_or_admin on public.profiles; create policy profiles_self_or_admin on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_admin_update on public.profiles; create policy profiles_admin_update on public.profiles for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists clients_admin_all on public.clients; create policy clients_admin_all on public.clients for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists clients_self_select on public.clients; create policy clients_self_select on public.clients for select using (id = public.my_client_id());
drop policy if exists projects_admin_all on public.projects; create policy projects_admin_all on public.projects for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists projects_client_select on public.projects; create policy projects_client_select on public.projects for select using (client_id = public.my_client_id());
drop policy if exists photos_admin_all on public.photos; create policy photos_admin_all on public.photos for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists photos_client_select on public.photos; create policy photos_client_select on public.photos for select using (exists (select 1 from public.projects p where p.id = photos.project_id and p.client_id = public.my_client_id()));
drop policy if exists selections_admin_all on public.photo_selections; create policy selections_admin_all on public.photo_selections for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists selections_client_all on public.photo_selections; create policy selections_client_all on public.photo_selections for all using (client_id = public.my_client_id()) with check (client_id = public.my_client_id());
