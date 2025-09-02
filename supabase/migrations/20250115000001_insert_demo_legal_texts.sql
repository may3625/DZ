-- Migration pour insérer des données de démonstration
-- Date: 2025-01-15
-- Description: Insertion de textes légaux de démonstration pour tester la carte choroplèthe

-- Supprimer les données de démonstration existantes
DELETE FROM public.legal_texts WHERE title LIKE '%DEMO%' OR title LIKE '%Test%';

-- Insérer des textes légaux de démonstration pour chaque wilaya
-- Cela permettra de tester la carte avec des données réalistes

-- Wilaya 01 - Adrar
INSERT INTO public.legal_texts (title, date, wilaya_code, sector, language, status, created_at) VALUES
  ('Arrêté communal DEMO - Gestion des déchets solides', '2024-12-15', '01', 'Environnement', 'fr', 'active', NOW()),
  ('Délibération DEMO - Aménagement urbain', '2024-11-20', '01', 'Urbanisme', 'fr', 'active', NOW()),
  ('Règlement DEMO - Transport public', '2024-10-10', '01', 'Transport', 'fr', 'active', NOW());

-- Wilaya 02 - Chlef
INSERT INTO public.legal_texts (title, date, wilaya_code, sector, language, status, created_at) VALUES
  ('Décret DEMO - Protection des zones agricoles', '2024-12-10', '02', 'Agriculture', 'fr', 'active', NOW()),
  ('Arrêté DEMO - Normes de construction', '2024-11-15', '02', 'Construction', 'fr', 'active', NOW()),
  ('Règlement DEMO - Gestion des eaux', '2024-09-25', '02', 'Hydraulique', 'fr', 'active', NOW()),
  ('Délibération DEMO - Développement économique', '2024-08-30', '02', 'Économie', 'fr', 'active', NOW());

-- Wilaya 16 - Alger (plus de textes pour tester la densité)
INSERT INTO public.legal_texts (title, date, wilaya_code, sector, language, status, created_at) VALUES
  ('Loi DEMO - Organisation administrative', '2024-12-20', '16', 'Administration', 'fr', 'active', NOW()),
  ('Décret DEMO - Fonction publique', '2024-12-18', '16', 'Administration', 'fr', 'active', NOW()),
  ('Arrêté DEMO - Sécurité routière', '2024-12-15', '16', 'Sécurité', 'fr', 'active', NOW()),
  ('Règlement DEMO - Commerce', '2024-12-10', '16', 'Commerce', 'fr', 'active', NOW()),
  ('Délibération DEMO - Éducation', '2024-12-05', '16', 'Éducation', 'fr', 'active', NOW()),
  ('Ordonnance DEMO - Santé publique', '2024-11-30', '16', 'Santé', 'fr', 'active', NOW()),
  ('Décret DEMO - Culture', '2024-11-25', '16', 'Culture', 'fr', 'active', NOW()),
  ('Arrêté DEMO - Sports', '2024-11-20', '16', 'Sports', 'fr', 'active', NOW());

-- Wilaya 31 - Oran
INSERT INTO public.legal_texts (title, date, wilaya_code, sector, language, status, created_at) VALUES
  ('Règlement DEMO - Port et maritime', '2024-12-18', '31', 'Transport', 'fr', 'active', NOW()),
  ('Arrêté DEMO - Industrie', '2024-12-12', '31', 'Industrie', 'fr', 'active', NOW()),
  ('Délibération DEMO - Tourisme', '2024-12-08', '31', 'Tourisme', 'fr', 'active', NOW()),
  ('Décret DEMO - Pêche', '2024-11-28', '31', 'Pêche', 'fr', 'active', NOW()),
  ('Ordonnance DEMO - Recherche', '2024-11-22', '31', 'Recherche', 'fr', 'active', NOW());

-- Wilaya 25 - Constantine
INSERT INTO public.legal_texts (title, date, wilaya_code, sector, language, status, created_at) VALUES
  ('Arrêté DEMO - Enseignement supérieur', '2024-12-16', '25', 'Éducation', 'fr', 'active', NOW()),
  ('Règlement DEMO - Patrimoine historique', '2024-12-12', '25', 'Culture', 'fr', 'active', NOW()),
  ('Délibération DEMO - Innovation', '2024-12-08', '25', 'Recherche', 'fr', 'active', NOW()),
  ('Décret DEMO - Numérique', '2024-11-30', '25', 'Technologie', 'fr', 'active', NOW());

-- Wilaya 06 - Béjaïa
INSERT INTO public.legal_texts (title, date, wilaya_code, sector, language, status, created_at) VALUES
  ('Règlement DEMO - Protection côtière', '2024-12-14', '06', 'Environnement', 'fr', 'active', NOW()),
  ('Arrêté DEMO - Pêche maritime', '2024-12-10', '06', 'Pêche', 'fr', 'active', NOW()),
  ('Délibération DEMO - Développement rural', '2024-12-05', '06', 'Agriculture', 'fr', 'active', NOW());

-- Wilaya 15 - Tizi Ouzou
INSERT INTO public.legal_texts (title, date, wilaya_code, sector, language, status, created_at) VALUES
  ('Arrêté DEMO - Langue amazighe', '2024-12-17', '15', 'Culture', 'fr', 'active', NOW()),
  ('Règlement DEMO - Artisanat', '2024-12-13', '15', 'Artisanat', 'fr', 'active', NOW()),
  ('Délibération DEMO - Montagne', '2024-12-09', '15', 'Environnement', 'fr', 'active', NOW());

-- Wilaya 19 - Sétif
INSERT INTO public.legal_texts (title, date, wilaya_code, sector, language, status, created_at) VALUES
  ('Décret DEMO - Développement industriel', '2024-12-19', '19', 'Industrie', 'fr', 'active', NOW()),
  ('Arrêté DEMO - Exportation', '2024-12-15', '19', 'Commerce', 'fr', 'active', NOW()),
  ('Règlement DEMO - Zones industrielles', '2024-12-11', '19', 'Urbanisme', 'fr', 'active', NOW()),
  ('Délibération DEMO - Formation professionnelle', '2024-12-07', '19', 'Formation', 'fr', 'active', NOW());

-- Wilaya 30 - Ouargla
INSERT INTO public.legal_texts (title, date, wilaya_code, sector, language, status, created_at) VALUES
  ('Arrêté DEMO - Énergie solaire', '2024-12-16', '30', 'Énergie', 'fr', 'active', NOW()),
  ('Règlement DEMO - Désertification', '2024-12-12', '30', 'Environnement', 'fr', 'active', NOW()),
  ('Délibération DEMO - Oasis', '2024-12-08', '30', 'Agriculture', 'fr', 'active', NOW());

-- Wilaya 47 - Ghardaïa
INSERT INTO public.legal_texts (title, date, wilaya_code, sector, language, status, created_at) VALUES
  ('Règlement DEMO - Architecture traditionnelle', '2024-12-13', '47', 'Culture', 'fr', 'active', NOW()),
  ('Arrêté DEMO - Patrimoine mondial', '2024-12-09', '47', 'Patrimoine', 'fr', 'active', NOW()),
  ('Délibération DEMO - Tourisme culturel', '2024-12-05', '47', 'Tourisme', 'fr', 'active', NOW());

-- Wilaya 37 - Tindouf
INSERT INTO public.legal_texts (title, date, wilaya_code, sector, language, status, created_at) VALUES
  ('Arrêté DEMO - Frontières', '2024-12-11', '37', 'Sécurité', 'fr', 'active', NOW()),
  ('Règlement DEMO - Zones militaires', '2024-12-07', '37', 'Défense', 'fr', 'active', NOW());

-- Wilaya 33 - Illizi
INSERT INTO public.legal_texts (title, date, wilaya_code, sector, language, status, created_at) VALUES
  ('Délibération DEMO - Parc national', '2024-12-14', '33', 'Environnement', 'fr', 'active', NOW()),
  ('Arrêté DEMO - Protection faune', '2024-12-10', '33', 'Conservation', 'fr', 'active', NOW());

-- Wilaya 58 - In Guezzam
INSERT INTO public.legal_texts (title, date, wilaya_code, sector, language, status, created_at) VALUES
  ('Règlement DEMO - Transit', '2024-12-06', '58', 'Transport', 'fr', 'active', NOW()),
  ('Arrêté DEMO - Douanes', '2024-12-02', '58', 'Commerce', 'fr', 'active', NOW());

-- Vérifier l'insertion
SELECT 
  wilaya_code,
  COUNT(*) as total_texts,
  COUNT(DISTINCT sector) as sectors_count,
  MAX(date) as last_publication
FROM public.legal_texts 
WHERE wilaya_code IS NOT NULL 
GROUP BY wilaya_code 
ORDER BY wilaya_code;

-- Afficher le total des textes insérés
SELECT COUNT(*) as total_demo_texts FROM public.legal_texts WHERE title LIKE '%DEMO%';