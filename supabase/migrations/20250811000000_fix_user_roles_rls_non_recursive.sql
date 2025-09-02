-- Fix user_roles RLS recursion by avoiding self-referential checks
-- Strategy: use JWT claim based admin detection

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'app_role') = 'admin', false);
$$;

-- Ensure bootstrap helper exists
create or replace function public.user_roles_empty()
returns boolean
language sql
stable
as $$
  select count(*) = 0 from public.user_roles;
$$;

alter table public.user_roles enable row level security;

-- Drop existing problematic policies
drop policy if exists "Admins manage roles" on public.user_roles;
drop policy if exists "User can see own roles; admins see all" on public.user_roles;
drop policy if exists "Bootstrap first admin" on public.user_roles;

-- Read: self or admin via JWT (no table lookup)
create policy "user_roles select self or admin"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Manage: only admin via JWT
create policy "user_roles manage admin"
  on public.user_roles for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Bootstrap: allow first insert of admin role when table empty
create policy "Bootstrap first admin"
  on public.user_roles for insert to authenticated
  with check (public.user_roles_empty() and auth.uid() = user_id and role = 'admin'::public.app_role);