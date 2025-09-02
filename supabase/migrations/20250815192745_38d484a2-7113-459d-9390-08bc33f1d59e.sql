-- Phase 3: Système de Validation et Workflow d'Approbation (Correction)

-- Enum pour les statuts de validation
CREATE TYPE public.validation_status AS ENUM ('pending', 'in_review', 'approved', 'rejected', 'requires_modification');

-- Enum pour les types d'erreurs de validation
CREATE TYPE public.validation_error_type AS ENUM ('format', 'content', 'metadata', 'duplicate', 'classification', 'legal_compliance');

-- Enum pour les priorités d'approbation
CREATE TYPE public.approval_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Table pour les éléments en attente d'approbation
CREATE TABLE public.approval_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    legal_text_id UUID REFERENCES public.legal_texts(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- 'legal_text', 'classification', 'metadata_update', etc.
    title TEXT NOT NULL,
    description TEXT,
    data JSONB NOT NULL, -- Contenu à approuver
    original_data JSONB, -- Données originales pour comparaison
    status validation_status NOT NULL DEFAULT 'pending',
    priority approval_priority NOT NULL DEFAULT 'medium',
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    due_date TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    modification_notes TEXT
);

-- Table pour les erreurs de validation détectées
CREATE TABLE public.validation_errors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    approval_item_id UUID REFERENCES public.approval_items(id) ON DELETE CASCADE,
    error_type validation_error_type NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    field_path TEXT, -- Chemin JSON vers le champ avec erreur
    error_code TEXT NOT NULL,
    error_message TEXT NOT NULL,
    suggested_fix TEXT,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour l'historique des actions d'approbation
CREATE TABLE public.approval_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    approval_item_id UUID REFERENCES public.approval_items(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'submitted', 'assigned', 'reviewed', 'approved', 'rejected', 'modified'
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    previous_status validation_status,
    new_status validation_status,
    comment TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.approval_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;

-- Fonction sécurisée pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Politiques RLS pour approval_items
CREATE POLICY "Approval items viewable by reviewers and submitters"
ON public.approval_items FOR SELECT
USING (
    submitted_by = auth.uid() OR 
    assigned_to = auth.uid() OR
    public.is_admin_user()
);

CREATE POLICY "Approval items insertable by authenticated users"
ON public.approval_items FOR INSERT
WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Approval items updatable by reviewers"
ON public.approval_items FOR UPDATE
USING (
    assigned_to = auth.uid() OR
    public.is_admin_user()
);

-- Politiques RLS pour validation_errors
CREATE POLICY "Validation errors viewable with approval items"
ON public.validation_errors FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM approval_items ai 
        WHERE ai.id = approval_item_id AND (
            ai.submitted_by = auth.uid() OR 
            ai.assigned_to = auth.uid() OR
            public.is_admin_user()
        )
    )
);

CREATE POLICY "Validation errors insertable by system"
ON public.validation_errors FOR INSERT
WITH CHECK (true);

CREATE POLICY "Validation errors updatable by reviewers"
ON public.validation_errors FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM approval_items ai 
        WHERE ai.id = approval_item_id AND (
            ai.assigned_to = auth.uid() OR
            public.is_admin_user()
        )
    )
);

-- Politiques RLS pour approval_history
CREATE POLICY "Approval history viewable with approval items"
ON public.approval_history FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM approval_items ai 
        WHERE ai.id = approval_item_id AND (
            ai.submitted_by = auth.uid() OR 
            ai.assigned_to = auth.uid() OR
            public.is_admin_user()
        )
    )
);

CREATE POLICY "Approval history insertable by actors"
ON public.approval_history FOR INSERT
WITH CHECK (actor_id = auth.uid());

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_approval_items_updated_at
    BEFORE UPDATE ON public.approval_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour créer automatiquement l'historique
CREATE OR REPLACE FUNCTION public.log_approval_action()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger pour l'historique
CREATE TRIGGER approval_history_trigger
    AFTER INSERT OR UPDATE ON public.approval_items
    FOR EACH ROW
    EXECUTE FUNCTION public.log_approval_action();

-- Index pour les performances
CREATE INDEX idx_approval_items_status ON public.approval_items(status);
CREATE INDEX idx_approval_items_assigned_to ON public.approval_items(assigned_to);
CREATE INDEX idx_approval_items_submitted_by ON public.approval_items(submitted_by);
CREATE INDEX idx_approval_items_priority ON public.approval_items(priority);
CREATE INDEX idx_validation_errors_approval_item ON public.validation_errors(approval_item_id);
CREATE INDEX idx_approval_history_item ON public.approval_history(approval_item_id);