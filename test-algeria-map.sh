#!/bin/bash

# Script de test pour la carte de l'Algérie
# Teste le bon fonctionnement de la carte choroplèthe

echo "🧪 Test de la carte de l'Algérie - Carte Choroplèthe"
echo "=================================================="

# Variables pour compter les résultats
SUCCESS_COUNT=0
WARNING_COUNT=0
ERROR_COUNT=0

# Vérifier que le composant existe
if [ ! -f "src/components/analytics/AlgeriaChoroplethProfessional.tsx" ]; then
    echo "❌ ERREUR: Le composant AlgeriaChoroplethProfessional.tsx n'existe pas"
    ERROR_COUNT=$((ERROR_COUNT + 1))
else
    echo "✅ Composant AlgeriaChoroplethProfessional.tsx trouvé"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
fi

# Vérifier que le GeoJSON existe
if [ ! -f "public/algeria-wilayas-simplified.geo.json" ]; then
    echo "❌ ERREUR: Le fichier GeoJSON algeria-wilayas-simplified.geo.json n'existe pas"
    ERROR_COUNT=$((ERROR_COUNT + 1))
else
    echo "✅ Fichier GeoJSON algeria-wilayas-simplified.geo.json trouvé"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
fi

# Vérifier la taille du GeoJSON (doit être > 1MB)
GEOJSON_SIZE=$(stat -c%s "public/algeria-wilayas-simplified.geo.json" 2>/dev/null || stat -f%z "public/algeria-wilayas-simplified.geo.json" 2>/dev/null)
if [ "$GEOJSON_SIZE" -lt 1000000 ]; then
    echo "⚠️  ATTENTION: Le fichier GeoJSON semble trop petit ($GEOJSON_SIZE bytes)"
    WARNING_COUNT=$((WARNING_COUNT + 1))
else
    echo "✅ Fichier GeoJSON de taille correcte ($GEOJSON_SIZE bytes)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
fi

# Vérifier que les migrations existent
if [ ! -f "supabase/migrations/20250115000000_insert_algeria_wilayas.sql" ]; then
    echo "❌ ERREUR: Migration des wilayas manquante"
    ERROR_COUNT=$((ERROR_COUNT + 1))
else
    echo "✅ Migrations SQL trouvées"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
fi

if [ ! -f "supabase/migrations/20250115000001_insert_demo_legal_texts.sql" ]; then
    echo "❌ ERREUR: Migration des données de démonstration manquante"
    ERROR_COUNT=$((ERROR_COUNT + 1))
else
    echo "✅ Migration des données de démonstration trouvée"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
fi

# Vérifier que la section a été mise à jour
if grep -q "AlgeriaChoroplethProfessional" "src/components/analytics/AlgeriaDensitySection.tsx"; then
    echo "✅ Section AlgeriaDensitySection mise à jour"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo "❌ ERREUR: Section AlgeriaDensitySection non mise à jour"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# Vérifier les dépendances dans package.json
if grep -q "react-simple-maps" "package.json"; then
    echo "✅ Dépendance react-simple-maps trouvée"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo "⚠️  ATTENTION: Dépendance react-simple-maps manquante dans package.json"
    WARNING_COUNT=$((WARNING_COUNT + 1))
fi

if grep -q "d3-geo" "package.json"; then
    echo "✅ Dépendance d3-geo trouvée"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo "⚠️  ATTENTION: Dépendance d3-geo manquante dans package.json"
    WARNING_COUNT=$((WARNING_COUNT + 1))
fi

# Vérifier la structure du composant
echo ""
echo "🔍 Vérification de la structure du composant..."

# Vérifier les imports essentiels
if grep -q "import.*ComposableMap" "src/components/analytics/AlgeriaChoroplethProfessional.tsx"; then
    echo "✅ Import ComposableMap trouvé"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo "❌ ERREUR: Import ComposableMap manquant"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

if grep -q "import.*Geographies" "src/components/analytics/AlgeriaChoroplethProfessional.tsx"; then
    echo "✅ Import Geographies trouvé"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo "❌ ERREUR: Import Geographies manquant"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

if grep -q "import.*supabase" "src/components/analytics/AlgeriaChoroplethProfessional.tsx"; then
    echo "✅ Import Supabase trouvé"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo "❌ ERREUR: Import Supabase manquant"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# Vérifier les fonctionnalités clés
if grep -q "mapModes.*useMemo" "src/components/analytics/AlgeriaChoroplethProfessional.tsx"; then
    echo "✅ Modes de carte configurés"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo "❌ ERREUR: Modes de carte non configurés"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

if grep -q "aspect-\[4/5\]" "src/components/analytics/AlgeriaChoroplethProfessional.tsx"; then
    echo "✅ Aspect ratio vertical configuré (4/5)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo "❌ ERREUR: Aspect ratio vertical non configuré"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

if grep -q "handleWilayaHover" "src/components/analytics/AlgeriaChoroplethProfessional.tsx"; then
    echo "✅ Gestionnaire de survol configuré"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo "❌ ERREUR: Gestionnaire de survol manquant"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

if grep -q "handleWilayaClick" "src/components/analytics/AlgeriaChoroplethProfessional.tsx"; then
    echo "✅ Gestionnaire de clic configuré"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo "❌ ERREUR: Gestionnaire de clic manquant"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# Vérifier l'insertion des wilayas
if grep -q "58 wilayas" "src/components/analytics/AlgeriaChoroplethProfessional.tsx"; then
    echo "✅ Insertion des 58 wilayas configurée"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo "❌ ERREUR: Insertion des 58 wilayas non configurée"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

echo ""
echo "📊 Résumé des tests:"
echo "===================="

echo "✅ Tests réussis: $SUCCESS_COUNT"
echo "⚠️  Avertissements: $WARNING_COUNT"
echo "❌ Erreurs: $ERROR_COUNT"

if [ "$ERROR_COUNT" -eq 0 ]; then
    echo ""
    echo "🎉 Tous les tests sont passés avec succès !"
    echo "La carte de l'Algérie est prête à être utilisée."
    echo ""
    echo "📋 Prochaines étapes:"
    echo "1. Exécuter les migrations SQL dans Supabase"
    echo "2. Démarrer l'application"
    echo "3. Naviguer vers l'onglet 'Carte Choroplèthe'"
    echo "4. Tester les interactions (survol, clic, zoom)"
    echo "5. Vérifier les 3 modes d'affichage"
else
    echo ""
    echo "❌ Certains tests ont échoué. Veuillez corriger les erreurs avant de continuer."
    exit 1
fi

echo ""
echo "🔧 Pour exécuter les migrations SQL:"
echo "1. Aller dans l'interface Supabase"
echo "2. Naviguer vers SQL Editor"
echo "3. Exécuter: supabase/migrations/20250115000000_insert_algeria_wilayas.sql"
echo "4. Exécuter: supabase/migrations/20250115000001_insert_demo_legal_texts.sql"
echo ""
echo "🚀 Pour démarrer l'application:"
echo "npm run dev"
echo ""
echo "📱 URL de test: http://localhost:5173 (ou le port configuré)"