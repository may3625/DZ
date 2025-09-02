-- Correction des warnings de sécurité pour les fonctions

-- Corriger la fonction is_admin_user
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Corriger la fonction log_approval_action  
CREATE OR REPLACE FUNCTION public.log_approval_action()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    -- Log l'action dans l'historique
    INSERT INTO public.approval_history (
        approval_item_id,
        action,
        actor_id,
        previous_status,
        new_status,
        comment,
        metadata
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'submitted'
            WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN 'status_changed'
            WHEN TG_OP = 'UPDATE' THEN 'updated'
            ELSE TG_OP::text
        END,
        auth.uid(),
        CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
        CASE WHEN TG_OP = 'UPDATE' THEN NEW.status ELSE NEW.status END,
        CASE 
            WHEN TG_OP = 'UPDATE' AND NEW.status = 'rejected' THEN NEW.rejection_reason
            WHEN TG_OP = 'UPDATE' AND NEW.status = 'requires_modification' THEN NEW.modification_notes
            ELSE NULL
        END,
        CASE WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('changes', to_jsonb(NEW) - to_jsonb(OLD)) ELSE to_jsonb(NEW) END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$;