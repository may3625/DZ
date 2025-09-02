-- Reduce use of SECURITY DEFINER where not required and harden search_path
-- 1) Run triggers as invoker where safe
ALTER FUNCTION public.audit_trigger() SECURITY INVOKER;
ALTER FUNCTION public.enforce_assignment_target() SECURITY INVOKER;

-- 2) Ensure stable search_path on helper function
ALTER FUNCTION public.update_updated_at_column() SET search_path TO public;