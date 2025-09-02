-- Phase 4 migrations: metadata + notifications + alert trigger

-- 1) Add metadata column to legal_texts
ALTER TABLE public.legal_texts
ADD COLUMN IF NOT EXISTS metadata jsonb;

-- 2) Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  legal_text_id uuid NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Notifications readable by owner'
  ) THEN
    CREATE POLICY "Notifications readable by owner"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Notifications insert allowed'
  ) THEN
    CREATE POLICY "Notifications insert allowed"
    ON public.notifications
    FOR INSERT
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Notifications update by owner'
  ) THEN
    CREATE POLICY "Notifications update by owner"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Notifications delete by owner'
  ) THEN
    CREATE POLICY "Notifications delete by owner"
    ON public.notifications
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3) Trigger to create notifications on classifications insert
CREATE OR REPLACE FUNCTION public.handle_classification_insert()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_classifications_notify ON public.classifications;
CREATE TRIGGER trg_classifications_notify
AFTER INSERT ON public.classifications
FOR EACH ROW EXECUTE FUNCTION public.handle_classification_insert();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_classifications_legal_text_id ON public.classifications(legal_text_id);
