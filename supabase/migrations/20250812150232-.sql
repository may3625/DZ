-- Add sample legal texts for all wilayas to enable visualization
INSERT INTO public.legal_texts (title, content, sector, wilaya_code, date, status, category) VALUES
-- Adrar (01)
('Arrêté portant organisation des services techniques', 'Arrêté relatif à l''organisation des services techniques de la wilaya d''Adrar', 'Administration', '01', '2024-01-15', 'active', 'Arrêté'),
('Décision concernant l''aménagement urbain', 'Décision portant sur les projets d''aménagement urbain dans la wilaya d''Adrar', 'Urbanisme', '01', '2024-02-10', 'active', 'Décision'),
-- Chlef (02) 
('Règlement sur l''agriculture', 'Règlement relatif au développement agricole dans la wilaya de Chlef', 'Agriculture', '02', '2024-01-20', 'active', 'Règlement'),
('Arrêté sur les marchés publics', 'Arrêté portant organisation des marchés publics locaux', 'Économie', '02', '2024-02-05', 'active', 'Arrêté'),
('Décision sanitaire', 'Décision relative aux mesures sanitaires préventives', 'Santé', '02', '2024-03-01', 'active', 'Décision'),
-- Laghouat (03)
('Arrêté environnemental', 'Arrêté relatif à la protection de l''environnement', 'Environnement', '03', '2024-01-25', 'active', 'Arrêté'),
-- Oum El Bouaghi (04)
('Décision éducative', 'Décision portant organisation des établissements scolaires', 'Éducation', '04', '2024-02-15', 'active', 'Décision'),
('Arrêté de transport', 'Arrêté relatif au transport public local', 'Transport', '04', '2024-02-20', 'active', 'Arrêté'),
-- Batna (05)
('Règlement touristique', 'Règlement sur le développement du tourisme', 'Tourisme', '05', '2024-01-30', 'active', 'Règlement'),
('Arrêté culturel', 'Arrêté portant promotion des activités culturelles', 'Culture', '05', '2024-03-05', 'active', 'Arrêté'),
('Décision sportive', 'Décision relative aux infrastructures sportives', 'Sport', '05', '2024-03-10', 'active', 'Décision'),
-- Béjaïa (06)
('Arrêté portuaire', 'Arrêté relatif à la gestion portuaire', 'Transport', '06', '2024-02-01', 'active', 'Arrêté'),
('Décision industrielle', 'Décision sur le développement industriel', 'Industrie', '06', '2024-02-25', 'active', 'Décision'),
-- Biskra (07)
('Règlement agricole', 'Règlement sur l''irrigation et l''agriculture oasienne', 'Agriculture', '07', '2024-01-10', 'active', 'Règlement'),
-- Béchar (08)
('Arrêté minier', 'Arrêté relatif à l''exploitation minière', 'Mines', '08', '2024-02-12', 'active', 'Arrêté'),
-- Blida (09)
('Décision industrielle', 'Décision portant développement de zones industrielles', 'Industrie', '09', '2024-01-18', 'active', 'Décision'),
('Arrêté agricole', 'Arrêté sur la modernisation agricole', 'Agriculture', '09', '2024-02-28', 'active', 'Arrêté'),
('Règlement urbain', 'Règlement d''urbanisme et d''aménagement', 'Urbanisme', '09', '2024-03-15', 'active', 'Règlement'),
-- Bouira (10)
('Arrêté forestier', 'Arrêté de protection des forêts', 'Environnement', '10', '2024-01-22', 'active', 'Arrêté'),
-- Continue with more wilayas...
-- Tamanrasset (11)
('Décision touristique', 'Décision sur le tourisme saharien', 'Tourisme', '11', '2024-02-08', 'active', 'Décision'),
-- Tébessa (12)
('Arrêté frontalier', 'Arrêté relatif au commerce frontalier', 'Commerce', '12', '2024-01-28', 'active', 'Arrêté'),
-- Tlemcen (13)
('Règlement patrimonial', 'Règlement de protection du patrimoine', 'Culture', '13', '2024-02-18', 'active', 'Règlement'),
('Décision touristique', 'Décision sur les sites touristiques', 'Tourisme', '13', '2024-03-02', 'active', 'Décision'),
-- Tiaret (14)
('Arrêté agricole', 'Arrêté sur l''élevage et l''agriculture', 'Agriculture', '14', '2024-01-12', 'active', 'Arrêté'),
-- Tizi Ouzou (15)
('Décision artisanale', 'Décision sur l''artisanat traditionnel', 'Artisanat', '15', '2024-02-22', 'active', 'Décision'),
('Arrêté culturel', 'Arrêté de préservation culturelle', 'Culture', '15', '2024-03-08', 'active', 'Arrêté'),
-- Alger (16) - Capital with more texts
('Arrêté métropolitain', 'Arrêté d''organisation métropolitaine', 'Administration', '16', '2024-01-05', 'active', 'Arrêté'),
('Décision transport', 'Décision sur le transport urbain', 'Transport', '16', '2024-01-15', 'active', 'Décision'),
('Règlement urbanisme', 'Règlement d''urbanisme de la capitale', 'Urbanisme', '16', '2024-02-01', 'active', 'Règlement'),
('Arrêté portuaire', 'Arrêté de gestion du port d''Alger', 'Transport', '16', '2024-02-10', 'active', 'Arrêté'),
('Décision économique', 'Décision sur les zones économiques', 'Économie', '16', '2024-02-20', 'active', 'Décision'),
-- Djelfa (17)
('Arrêté pastoral', 'Arrêté sur l''élevage et le pastoralisme', 'Agriculture', '17', '2024-01-20', 'active', 'Arrêté'),
-- Jijel (18)
('Décision côtière', 'Décision sur la protection du littoral', 'Environnement', '18', '2024-02-14', 'active', 'Décision'),
-- Sétif (19)
('Règlement industriel', 'Règlement sur les zones industrielles', 'Industrie', '19', '2024-01-25', 'active', 'Règlement'),
('Arrêté commercial', 'Arrêté sur le commerce régional', 'Commerce', '19', '2024-03-01', 'active', 'Arrêté'),
-- Saïda (20)
('Décision agricole', 'Décision sur l''agriculture et l''élevage', 'Agriculture', '20', '2024-02-05', 'active', 'Décision'),
-- Add more entries for remaining wilayas to ensure all have data...
-- Skikda (21)
('Arrêté pétrochimique', 'Arrêté sur l''industrie pétrochimique', 'Industrie', '21', '2024-01-30', 'active', 'Arrêté'),
-- Continue for all 58 wilayas...
('Arrêté général', 'Arrêté administratif général', 'Administration', '22', '2024-02-01', 'active', 'Arrêté'),
('Décision générale', 'Décision administrative générale', 'Administration', '23', '2024-02-02', 'active', 'Décision'),
('Règlement général', 'Règlement administratif général', 'Administration', '24', '2024-02-03', 'active', 'Règlement'),
('Arrêté local', 'Arrêté administratif local', 'Administration', '25', '2024-02-04', 'active', 'Arrêté'),
('Décision locale', 'Décision administrative locale', 'Administration', '26', '2024-02-05', 'active', 'Décision'),
('Règlement local', 'Règlement administratif local', 'Administration', '27', '2024-02-06', 'active', 'Règlement');

-- Add entries for wilayas 28-58 with at least one text each
INSERT INTO public.legal_texts (title, content, sector, wilaya_code, date, status, category) VALUES
('Arrêté wilaya 28', 'Arrêté administratif wilaya 28', 'Administration', '28', '2024-02-07', 'active', 'Arrêté'),
('Arrêté wilaya 29', 'Arrêté administratif wilaya 29', 'Administration', '29', '2024-02-08', 'active', 'Arrêté'),
('Arrêté wilaya 30', 'Arrêté administratif wilaya 30', 'Administration', '30', '2024-02-09', 'active', 'Arrêté'),
('Arrêté wilaya 31', 'Arrêté administratif wilaya 31', 'Administration', '31', '2024-02-10', 'active', 'Arrêté'),
('Arrêté wilaya 32', 'Arrêté administratif wilaya 32', 'Administration', '32', '2024-02-11', 'active', 'Arrêté'),
('Arrêté wilaya 33', 'Arrêté administratif wilaya 33', 'Administration', '33', '2024-02-12', 'active', 'Arrêté'),
('Arrêté wilaya 34', 'Arrêté administratif wilaya 34', 'Administration', '34', '2024-02-13', 'active', 'Arrêté'),
('Arrêté wilaya 35', 'Arrêté administratif wilaya 35', 'Administration', '35', '2024-02-14', 'active', 'Arrêté'),
('Arrêté wilaya 36', 'Arrêté administratif wilaya 36', 'Administration', '36', '2024-02-15', 'active', 'Arrêté'),
('Arrêté wilaya 37', 'Arrêté administratif wilaya 37', 'Administration', '37', '2024-02-16', 'active', 'Arrêté'),
('Arrêté wilaya 38', 'Arrêté administratif wilaya 38', 'Administration', '38', '2024-02-17', 'active', 'Arrêté'),
('Arrêté wilaya 39', 'Arrêté administratif wilaya 39', 'Administration', '39', '2024-02-18', 'active', 'Arrêté'),
('Arrêté wilaya 40', 'Arrêté administratif wilaya 40', 'Administration', '40', '2024-02-19', 'active', 'Arrêté'),
('Arrêté wilaya 41', 'Arrêté administratif wilaya 41', 'Administration', '41', '2024-02-20', 'active', 'Arrêté'),
('Arrêté wilaya 42', 'Arrêté administratif wilaya 42', 'Administration', '42', '2024-02-21', 'active', 'Arrêté'),
('Arrêté wilaya 43', 'Arrêté administratif wilaya 43', 'Administration', '43', '2024-02-22', 'active', 'Arrêté'),
('Arrêté wilaya 44', 'Arrêté administratif wilaya 44', 'Administration', '44', '2024-02-23', 'active', 'Arrêté'),
('Arrêté wilaya 45', 'Arrêté administratif wilaya 45', 'Administration', '45', '2024-02-24', 'active', 'Arrêté'),
('Arrêté wilaya 46', 'Arrêté administratif wilaya 46', 'Administration', '46', '2024-02-25', 'active', 'Arrêté'),
('Arrêté wilaya 47', 'Arrêté administratif wilaya 47', 'Administration', '47', '2024-02-26', 'active', 'Arrêté'),
('Arrêté wilaya 48', 'Arrêté administratif wilaya 48', 'Administration', '48', '2024-02-27', 'active', 'Arrêté'),
('Arrêté wilaya 49', 'Arrêté administratif wilaya 49', 'Administration', '49', '2024-02-28', 'active', 'Arrêté'),
('Arrêté wilaya 50', 'Arrêté administratif wilaya 50', 'Administration', '50', '2024-03-01', 'active', 'Arrêté'),
('Arrêté wilaya 51', 'Arrêté administratif wilaya 51', 'Administration', '51', '2024-03-02', 'active', 'Arrêté'),
('Arrêté wilaya 52', 'Arrêté administratif wilaya 52', 'Administration', '52', '2024-03-03', 'active', 'Arrêté'),
('Arrêté wilaya 53', 'Arrêté administratif wilaya 53', 'Administration', '53', '2024-03-04', 'active', 'Arrêté'),
('Arrêté wilaya 54', 'Arrêté administratif wilaya 54', 'Administration', '54', '2024-03-05', 'active', 'Arrêté'),
('Arrêté wilaya 55', 'Arrêté administratif wilaya 55', 'Administration', '55', '2024-03-06', 'active', 'Arrêté'),
('Arrêté wilaya 56', 'Arrêté administratif wilaya 56', 'Administration', '56', '2024-03-07', 'active', 'Arrêté'),
('Arrêté wilaya 57', 'Arrêté administratif wilaya 57', 'Administration', '57', '2024-03-08', 'active', 'Arrêté'),
('Arrêté wilaya 58', 'Arrêté administratif wilaya 58', 'Administration', '58', '2024-03-09', 'active', 'Arrêté');