-- Recréer les vues pour corriger le problème SECURITY DEFINER
-- En les supprimant et les recréant avec le bon contexte de sécurité

-- Supprimer les vues existantes
DROP VIEW IF EXISTS public.v_legal_texts_by_month CASCADE;
DROP VIEW IF EXISTS public.v_legal_texts_by_sector CASCADE;
DROP VIEW IF EXISTS public.v_legal_texts_by_wilaya CASCADE;
DROP VIEW IF EXISTS public.v_wilaya_stats CASCADE;

-- Recréer les vues avec SECURITY INVOKER explicite (par défaut pour les vues)
-- Vue pour statistiques par mois
CREATE VIEW public.v_legal_texts_by_month 
WITH (security_invoker = true) AS
SELECT 
  date_trunc('month'::text, COALESCE((date)::timestamp with time zone, created_at)) AS month,
  count(*) AS count
FROM legal_texts
GROUP BY (date_trunc('month'::text, COALESCE((date)::timestamp with time zone, created_at)))
ORDER BY (date_trunc('month'::text, COALESCE((date)::timestamp with time zone, created_at)));

-- Vue pour statistiques par secteur
CREATE VIEW public.v_legal_texts_by_sector 
WITH (security_invoker = true) AS
SELECT 
  COALESCE(sector, 'Inconnu'::text) AS sector,
  count(*) AS count
FROM legal_texts
GROUP BY COALESCE(sector, 'Inconnu'::text)
ORDER BY (count(*)) DESC;

-- Vue pour statistiques par wilaya
CREATE VIEW public.v_legal_texts_by_wilaya 
WITH (security_invoker = true) AS
SELECT 
  COALESCE(wilaya_code, 'NA'::text) AS wilaya_code,
  count(*) AS count
FROM legal_texts
GROUP BY COALESCE(wilaya_code, 'NA'::text)
ORDER BY (count(*)) DESC;

-- Vue pour statistiques détaillées des wilayas
CREATE VIEW public.v_wilaya_stats 
WITH (security_invoker = true) AS
SELECT 
  w.code,
  w.name,
  w.name AS ar_name,
  COALESCE(stats.total_texts, (0)::bigint) AS total_texts,
  COALESCE(stats.recent_texts, (0)::bigint) AS recent_texts,
  COALESCE(stats.sectors_count, (0)::bigint) AS sectors_count,
  COALESCE(stats.last_publication, NULL::date) AS last_publication
FROM (wilayas w
  LEFT JOIN ( 
    SELECT 
      lt.wilaya_code,
      count(*) AS total_texts,
      count(CASE
        WHEN (lt.created_at >= (now() - '30 days'::interval)) THEN 1
        ELSE NULL::integer
      END) AS recent_texts,
      count(DISTINCT lt.sector) AS sectors_count,
      max(lt.date) AS last_publication
    FROM legal_texts lt
    WHERE ((lt.wilaya_code IS NOT NULL) AND (lt.status <> 'archived'::text) AND (lt.obsolete = false))
    GROUP BY lt.wilaya_code
  ) stats ON ((w.code = stats.wilaya_code)))
ORDER BY w.code;

-- Accorder les permissions appropriées sur les vues
GRANT SELECT ON public.v_legal_texts_by_month TO authenticated, anon;
GRANT SELECT ON public.v_legal_texts_by_sector TO authenticated, anon;
GRANT SELECT ON public.v_legal_texts_by_wilaya TO authenticated, anon;
GRANT SELECT ON public.v_wilaya_stats TO authenticated, anon;