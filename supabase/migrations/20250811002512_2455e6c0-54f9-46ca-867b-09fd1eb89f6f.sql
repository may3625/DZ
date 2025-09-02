-- Fix RLS recursion on public.user_roles by using security definer functions
-- 1) Helper function to check roles without triggering RLS recursion
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- 2) Helper function for bootstrap check (is table empty?)
create or replace function public.user_roles_empty()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select count(*) = 0 from public.user_roles;
$$;

-- 3) Update policies to use the helper functions instead of self-referencing subqueries
alter policy "Admins manage roles" on public.user_roles
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

alter policy "User can see own roles; admins see all" on public.user_roles
using ((user_id = auth.uid()) or public.has_role(auth.uid(), 'admin'));

alter policy "Bootstrap first admin" on public.user_roles
with check (public.user_roles_empty() and auth.uid() = user_id and role = 'admin');