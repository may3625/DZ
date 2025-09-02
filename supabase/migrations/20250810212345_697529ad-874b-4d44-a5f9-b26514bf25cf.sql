-- Fix linter: set immutable search_path on newly added functions
CREATE OR REPLACE FUNCTION public.archive_legal_text(_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
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
SET search_path = public
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