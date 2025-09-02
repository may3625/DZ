-- Harden function search_path and minimize SECURITY DEFINER usage where safe
ALTER FUNCTION public.handle_classification_insert() SECURITY INVOKER;
ALTER FUNCTION public.handle_classification_insert() SET search_path TO public;

ALTER FUNCTION public.handle_new_user() SET search_path TO public;