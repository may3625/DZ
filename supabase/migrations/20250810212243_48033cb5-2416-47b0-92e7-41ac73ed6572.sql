-- Phase 9 — Sécurité & Gouvernance: Audit triggers + Rétention/Archivage (fix cron quoting)

-- 1) AUDIT TRIGGER (générique)
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid;
  entity text := TG_TABLE_NAME;
  entity_id uuid;
  diff jsonb;
BEGIN
  BEGIN
    actor := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    actor := NULL;
  END;

  IF TG_OP = 'DELETE' THEN
    entity_id := (OLD).id;
  ELSE
    entity_id := (NEW).id;
  END IF;

  IF TG_OP = 'INSERT' THEN
    diff := jsonb_build_object('new', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    diff := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    diff := jsonb_build_object('old', to_jsonb(OLD));
  END IF;

  INSERT INTO public.audit_logs (entity_id, entity_type, action, actor_id, diff, metadata)
  VALUES (entity_id, entity, TG_OP, actor, diff, NULL);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'Audit logs insert by actor'
  ) THEN
    CREATE POLICY "Audit logs insert by actor"
    ON public.audit_logs FOR INSERT
    WITH CHECK ((actor_id IS NULL) OR (actor_id = auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'Audit logs view own or admin'
  ) THEN
    CREATE POLICY "Audit logs view own or admin"
    ON public.audit_logs FOR SELECT
    USING ((actor_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- 2) Déclencheurs d'audit
DROP TRIGGER IF EXISTS audit_user_preferences ON public.user_preferences;
CREATE TRIGGER audit_user_preferences
AFTER INSERT OR UPDATE OR DELETE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_annotations ON public.annotations;
CREATE TRIGGER audit_annotations
AFTER INSERT OR UPDATE OR DELETE ON public.annotations
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_posts ON public.posts;
CREATE TRIGGER audit_posts
AFTER INSERT OR UPDATE OR DELETE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_checklists ON public.checklists;
CREATE TRIGGER audit_checklists
AFTER INSERT OR UPDATE OR DELETE ON public.checklists
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_checklist_items ON public.checklist_items;
CREATE TRIGGER audit_checklist_items
AFTER INSERT OR UPDATE OR DELETE ON public.checklist_items
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_assignments ON public.assignments;
CREATE TRIGGER audit_assignments
AFTER INSERT OR UPDATE OR DELETE ON public.assignments
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
CREATE TRIGGER audit_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- 3) Archivage & Rétention
ALTER TABLE public.legal_texts
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS obsolete boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_legal_texts_archived_at ON public.legal_texts (archived_at);
CREATE INDEX IF NOT EXISTS idx_legal_texts_obsolete ON public.legal_texts (obsolete);

CREATE TABLE IF NOT EXISTS public.retention_settings (
  id int PRIMARY KEY DEFAULT 1,
  retention_days int NOT NULL DEFAULT 365
);
ALTER TABLE public.retention_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "retention_settings admin manage" ON public.retention_settings;
CREATE POLICY "retention_settings admin manage"
ON public.retention_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.archive_legal_text(_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.legal_texts
  SET status = 'archived', archived_at = now(), obsolete = true
  WHERE id = _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.purge_archived_legal_text_versions()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  rdays int := (SELECT retention_days FROM public.retention_settings ORDER BY id LIMIT 1);
  deleted_count int;
BEGIN
  IF rdays IS NULL THEN rdays := 365; END IF;

  WITH del AS (
    DELETE FROM public.legal_text_versions lv
    USING public.legal_texts lt
    WHERE lv.legal_text_id = lt.id
      AND lt.archived_at IS NOT NULL
      AND lt.archived_at < now() - make_interval(days => rdays)
    RETURNING 1
  )
  SELECT count(*) INTO deleted_count FROM del;

  RETURN COALESCE(deleted_count, 0);
END;
$$;

-- 4) Planification quotidienne (03:00 UTC) via pg_cron
DO $do$
BEGIN
  -- Vérifier présence de cron.job et éviter doublons
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'job' AND n.nspname = 'cron'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-archived-legal-text-versions-daily') THEN
      PERFORM cron.schedule(
        'purge-archived-legal-text-versions-daily',
        '0 3 * * *',
        'SELECT public.purge_archived_legal_text_versions();'
      );
    END IF;
  END IF;
END
$do$;