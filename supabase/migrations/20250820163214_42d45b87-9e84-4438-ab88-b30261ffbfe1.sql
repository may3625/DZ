-- Créer un utilisateur admin avec le rôle admin dans la table user_roles
-- D'abord, vérifier si l'utilisateur admin existe déjà
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Créer l'utilisateur admin s'il n'existe pas déjà
    -- Note: Nous devrons créer manuellement l'utilisateur dans Supabase Auth
    -- Pour maintenant, nous allons créer un profil et un rôle admin par défaut
    
    -- Créer un profil admin par défaut (l'ID sera remplacé quand l'utilisateur se connecte)
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        gen_random_uuid(),
        'admin@dalil.dz',
        'Admin',
        'System'
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Fonction pour créer le premier admin lors de la première connexion
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
        
END $$;