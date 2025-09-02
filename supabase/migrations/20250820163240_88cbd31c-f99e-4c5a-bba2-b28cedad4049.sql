-- Créer une fonction pour faire le premier utilisateur admin automatiquement
CREATE OR REPLACE FUNCTION public.create_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Créer un trigger pour automatiquement faire le premier utilisateur admin
DROP TRIGGER IF EXISTS on_first_user_admin ON auth.users;
CREATE TRIGGER on_first_user_admin
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_first_admin();