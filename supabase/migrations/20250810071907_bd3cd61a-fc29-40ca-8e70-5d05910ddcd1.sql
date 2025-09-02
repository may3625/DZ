-- Add updated_at to administrative_procedures and trigger
ALTER TABLE public.administrative_procedures
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_admin_procedures_updated_at ON public.administrative_procedures;
CREATE TRIGGER trg_admin_procedures_updated_at
BEFORE UPDATE ON public.administrative_procedures
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();