-- Replace has_role() usage in policies with direct EXISTS checks, then drop the function

-- 1) administrative_procedures
DROP POLICY IF EXISTS "Procedures readable by owner or admin" ON public.administrative_procedures;
CREATE POLICY "Procedures readable by owner or admin"
ON public.administrative_procedures
FOR SELECT
USING (
  (created_by = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- 2) audit_logs
DROP POLICY IF EXISTS "Audit logs view own or admin" ON public.audit_logs;
CREATE POLICY "Audit logs view own or admin"
ON public.audit_logs
FOR SELECT
USING (
  (actor_id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- 3) profiles
DROP POLICY IF EXISTS "Profiles are viewable by owner or admin" ON public.profiles;
CREATE POLICY "Profiles are viewable by owner or admin"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() = id) OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- 4) retention_settings (ALL)
DROP POLICY IF EXISTS "retention_settings admin manage" ON public.retention_settings;
CREATE POLICY "retention_settings admin manage"
ON public.retention_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- 5) user_roles policies
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

DROP POLICY IF EXISTS "User can see own roles; admins see all" ON public.user_roles;
CREATE POLICY "User can see own roles; admins see all"
ON public.user_roles
FOR SELECT
USING (
  (user_id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- 6) Drop the function now that policies no longer depend on it
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);