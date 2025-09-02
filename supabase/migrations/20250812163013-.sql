-- Recréer les vues avec des permissions plus restrictives
-- et appliquer des politiques RLS appropriées

-- D'abord, supprimer les vues existantes
DROP VIEW IF EXISTS public.v_legal_texts_by_month;
DROP VIEW IF EXISTS public.v_legal_texts_by_sector; 
DROP VIEW IF EXISTS public.v_legal_texts_by_wilaya;
DROP VIEW IF EXISTS public.v_wilaya_stats;

-- Recréer les vues
CREATE VIEW public.v_legal_texts_by_month AS
SELECT 
  date_trunc('month', COALESCE(date::timestamp with time zone, created_at)) AS month,
  count(*) AS count
FROM public.legal_texts
WHERE status IS DISTINCT FROM 'archived' AND obsolete = false
GROUP BY date_trunc('month', COALESCE(date::timestamp with time zone, created_at))
ORDER BY date_trunc('month', COALESCE(date::timestamp with time zone, created_at));

CREATE VIEW public.v_legal_texts_by_sector AS
SELECT 
  COALESCE(sector, 'Inconnu') AS sector,
  count(*) AS count
FROM public.legal_texts
WHERE status IS DISTINCT FROM 'archived' AND obsolete = false
GROUP BY COALESCE(sector, 'Inconnu')
ORDER BY count(*) DESC;

CREATE VIEW public.v_legal_texts_by_wilaya AS
SELECT 
  COALESCE(wilaya_code, 'NA') AS wilaya_code,
  count(*) AS count
FROM public.legal_texts
WHERE status IS DISTINCT FROM 'archived' AND obsolete = false
GROUP BY COALESCE(wilaya_code, 'NA')
ORDER BY count(*) DESC;

CREATE VIEW public.v_wilaya_stats AS
SELECT 
  w.code,
  w.name,
  w.name AS ar_name,
  COALESCE(stats.total_texts, 0::bigint) AS total_texts,
  COALESCE(stats.recent_texts, 0::bigint) AS recent_texts,
  COALESCE(stats.sectors_count, 0::bigint) AS sectors_count,
  COALESCE(stats.last_publication, NULL::date) AS last_publication
FROM public.wilayas w
LEFT JOIN (
  SELECT 
    lt.wilaya_code,
    count(*) AS total_texts,
    count(CASE WHEN lt.created_at >= (now() - '30 days'::interval) THEN 1 END) AS recent_texts,
    count(DISTINCT lt.sector) AS sectors_count,
    max(lt.date) AS last_publication
  FROM public.legal_texts lt
  WHERE lt.wilaya_code IS NOT NULL 
    AND lt.status IS DISTINCT FROM 'archived' 
    AND lt.obsolete = false
  GROUP BY lt.wilaya_code
) stats ON w.code = stats.wilaya_code
ORDER BY w.code;

-- Activer RLS sur les vues
ALTER VIEW public.v_legal_texts_by_month SET (security_barrier = true);
ALTER VIEW public.v_legal_texts_by_sector SET (security_barrier = true);
ALTER VIEW public.v_legal_texts_by_wilaya SET (security_barrier = true);
ALTER VIEW public.v_wilaya_stats SET (security_barrier = true);

-- Révoquer les permissions étendues et ne donner que SELECT
REVOKE ALL ON public.v_legal_texts_by_month FROM PUBLIC;
REVOKE ALL ON public.v_legal_texts_by_sector FROM PUBLIC;  
REVOKE ALL ON public.v_legal_texts_by_wilaya FROM PUBLIC;
REVOKE ALL ON public.v_wilaya_stats FROM PUBLIC;

-- Donner uniquement SELECT aux rôles appropriés
GRANT SELECT ON public.v_legal_texts_by_month TO anon, authenticated;
GRANT SELECT ON public.v_legal_texts_by_sector TO anon, authenticated;
GRANT SELECT ON public.v_legal_texts_by_wilaya TO anon, authenticated;
GRANT SELECT ON public.v_wilaya_stats TO anon, authenticated;