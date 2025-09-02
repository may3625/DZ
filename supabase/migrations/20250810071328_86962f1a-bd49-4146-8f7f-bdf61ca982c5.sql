-- 1) Roles enum (idempotent)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','juriste','citoyen');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Policies for user_roles
CREATE POLICY IF NOT EXISTS "User can see own roles; admins see all"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY IF NOT EXISTS "Admins manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Bootstrap: allow first admin creation
CREATE POLICY IF NOT EXISTS "Bootstrap first admin"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (
  (select count(*) = 0 from public.user_roles) AND auth.uid() = user_id AND role = 'admin'::public.app_role
);

-- 3) profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  first_name text,
  last_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS for profiles
CREATE POLICY IF NOT EXISTS "Profiles are viewable by owner or admin"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Trigger to auto-insert profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4) administrative_procedures table to match UI usage
CREATE TABLE IF NOT EXISTS public.administrative_procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  institution text,
  description text,
  duration text,
  difficulty text,
  cost text,
  required_documents text[] DEFAULT '{}',
  steps jsonb[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.administrative_procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Procedures readable by owner or admin"
ON public.administrative_procedures FOR SELECT TO authenticated
USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY IF NOT EXISTS "Procedures insert by owner"
ON public.administrative_procedures FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY IF NOT EXISTS "Procedures update by owner"
ON public.administrative_procedures FOR UPDATE TO authenticated
USING (created_by = auth.uid());

CREATE POLICY IF NOT EXISTS "Procedures delete by owner"
ON public.administrative_procedures FOR DELETE TO authenticated
USING (created_by = auth.uid());