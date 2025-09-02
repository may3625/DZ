-- Secure view without email for non-admin consumers
create or replace view public.profiles_safe as
select id, first_name, last_name, created_at
from public.profiles;

alter table public.profiles_safe enable row level security;

drop policy if exists "profiles_safe readable by owner or admin" on public.profiles_safe;
create policy "profiles_safe readable by owner or admin"
on public.profiles_safe
for select
to authenticated
using (
  (auth.uid() = id)
  or exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'::app_role
  )
);