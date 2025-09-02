-- Corriger le problème de search_path pour la fonction create_first_admin
CREATE OR REPLACE FUNCTION public.create_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Si c'est le premier utilisateur et qu'il n'y a pas encore d'admin
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin'::app_role);
    END IF;
    RETURN NEW;
END;
$$;