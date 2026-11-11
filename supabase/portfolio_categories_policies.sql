-- Portfolio category settings access for Pilihin Fotomu.
-- Run this once in Supabase Dashboard > SQL Editor.

drop policy if exists "Public can read portfolio categories" on public.settings;
create policy "Public can read portfolio categories"
on public.settings
for select
to anon
using (key = 'portfolio_categories');

drop policy if exists "Admins can manage portfolio categories" on public.settings;
create policy "Admins can manage portfolio categories"
on public.settings
for all
to authenticated
using (
  key = 'portfolio_categories'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  key = 'portfolio_categories'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
