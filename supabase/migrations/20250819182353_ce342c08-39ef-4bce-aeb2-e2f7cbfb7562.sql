-- Corriger la politique RLS pour la table profiles
-- Supprimer la politique actuelle qui permet la lecture publique
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Créer une nouvelle politique qui permet seulement aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- S'assurer que RLS est activé sur la table profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;