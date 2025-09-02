-- Migration pour insérer les 58 wilayas d'Algérie
-- Date: 2025-01-15
-- Description: Insertion des données de référence des wilayas algériennes

-- Supprimer les données existantes pour éviter les doublons
DELETE FROM public.wilayas WHERE code IN (
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
  '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
  '41', '42', '43', '44', '45', '46', '47', '48', '49', '50',
  '51', '52', '53', '54', '55', '56', '57', '58'
);

-- Insérer les 58 wilayas d'Algérie avec leurs noms officiels
INSERT INTO public.wilayas (code, name) VALUES
  ('01', 'Adrar'),
  ('02', 'Chlef'),
  ('03', 'Laghouat'),
  ('04', 'Oum El Bouaghi'),
  ('05', 'Batna'),
  ('06', 'Béjaïa'),
  ('07', 'Biskra'),
  ('08', 'Béchar'),
  ('09', 'Blida'),
  ('10', 'Bouira'),
  ('11', 'Tamanrasset'),
  ('12', 'Tébessa'),
  ('13', 'Tlemcen'),
  ('14', 'Tiaret'),
  ('15', 'Tizi Ouzou'),
  ('16', 'Alger'),
  ('17', 'Djelfa'),
  ('18', 'Jijel'),
  ('19', 'Sétif'),
  ('20', 'Saïda'),
  ('21', 'Skikda'),
  ('22', 'Sidi Bel Abbès'),
  ('23', 'Annaba'),
  ('24', 'Guelma'),
  ('25', 'Constantine'),
  ('26', 'Médéa'),
  ('27', 'Mostaganem'),
  ('28', 'M''Sila'),
  ('29', 'Mascara'),
  ('30', 'Ouargla'),
  ('31', 'Oran'),
  ('32', 'El Bayadh'),
  ('33', 'Illizi'),
  ('34', 'Bordj Bou Arréridj'),
  ('35', 'Boumerdès'),
  ('36', 'El Tarf'),
  ('37', 'Tindouf'),
  ('38', 'Tissemsilt'),
  ('39', 'El Oued'),
  ('40', 'Khenchela'),
  ('41', 'Souk Ahras'),
  ('42', 'Tipaza'),
  ('43', 'Mila'),
  ('44', 'Aïn Defla'),
  ('45', 'Naâma'),
  ('46', 'Aïn Témouchent'),
  ('47', 'Ghardaïa'),
  ('48', 'Relizane'),
  ('49', 'El M''Ghair'),
  ('50', 'El Meniaa'),
  ('51', 'Ouled Djellal'),
  ('52', 'Bordj Baji Mokhtar'),
  ('53', 'Béni Abbès'),
  ('54', 'Timimoun'),
  ('55', 'Touggourt'),
  ('56', 'Djanet'),
  ('57', 'In Salah'),
  ('58', 'In Guezzam');

-- Vérifier l'insertion
SELECT COUNT(*) as total_wilayas FROM public.wilayas WHERE code ~ '^[0-9]{2}$';

-- Afficher les wilayas insérées
SELECT code, name FROM public.wilayas WHERE code ~ '^[0-9]{2}$' ORDER BY code;