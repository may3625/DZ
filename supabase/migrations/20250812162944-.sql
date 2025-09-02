-- Mise à jour de la fonction get_wilaya_stats avec un search_path sécurisé
CREATE OR REPLACE FUNCTION public.get_wilaya_stats()
 RETURNS TABLE(code text, name text, ar_name text, total_texts bigint, recent_texts bigint, sectors_count bigint, last_publication date)
 LANGUAGE sql
 STABLE
 SECURITY INVOKER  -- Explicitement SECURITY INVOKER pour éviter la détection comme SECURITY DEFINER
 SET search_path TO 'public'  -- Correction du warning search_path
AS $function$
  SELECT 
    w.code,
    w.name,
    NULL::text as ar_name,  -- We'll add Arabic names later if needed
    COALESCE(COUNT(lt.id), 0) as total_texts,
    COALESCE(COUNT(lt.id) FILTER (WHERE lt.created_at >= NOW() - INTERVAL '30 days'), 0) as recent_texts,
    COALESCE(COUNT(DISTINCT lt.sector), 0) as sectors_count,
    MAX(lt.date) as last_publication
  FROM public.wilayas w
  LEFT JOIN public.legal_texts lt ON lt.wilaya_code = w.code
  WHERE w.code IS NOT NULL
  GROUP BY w.code, w.name
  ORDER BY w.code;
$function$;

-- Mise à jour d'autres fonctions pour corriger les warnings search_path
CREATE OR REPLACE FUNCTION public.archive_legal_text(_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.legal_texts
  SET status = 'archived', archived_at = now(), obsolete = true
  WHERE id = _id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.purge_archived_legal_text_versions()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.audit_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.enforce_assignment_target()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (NEW.checklist_id IS NULL AND NEW.item_id IS NULL) OR (NEW.checklist_id IS NOT NULL AND NEW.item_id IS NOT NULL) THEN
    RAISE EXCEPTION 'Assignment must reference exactly one of checklist_id or item_id';
  END IF;
  RETURN NEW;
END; 
$function$;

CREATE OR REPLACE FUNCTION public.handle_classification_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
DECLARE
  lt record;
BEGIN
  SELECT id, title, sector, wilaya_code INTO lt
  FROM public.legal_texts WHERE id = NEW.legal_text_id;

  INSERT INTO public.notifications (user_id, legal_text_id, message)
  SELECT up.user_id, NEW.legal_text_id,
         COALESCE(lt.title, 'Nouveau texte légal') || ' correspond à vos préférences.'
  FROM public.user_preferences up
  WHERE (
    (array_length(up.sectors, 1) IS NOT NULL AND up.sectors && ARRAY[COALESCE(lt.sector, NULL)]::text[])
    OR (array_length(up.wilayas, 1) IS NOT NULL AND up.wilayas && ARRAY[COALESCE(lt.wilaya_code, NULL)]::text[])
    OR (array_length(up.keywords, 1) IS NOT NULL AND up.keywords && NEW.keywords)
  );

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;