-- Fix linter: set search_path and security definer for trigger function
CREATE OR REPLACE FUNCTION public.handle_classification_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
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
$$;