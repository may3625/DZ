#!/bin/bash

# 🔍 Script d'Identification des Fichiers Inutiles - Dalil.dz
# Identifie tous les fichiers inutiles sans les supprimer

echo "🔍 Identification des fichiers inutiles dans Dalil.dz"
echo "=================================================="
echo ""

# Créer le rapport
REPORT_FILE="unnecessary-files-report-$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" << 'EOF'
# 🔍 Rapport d'Identification des Fichiers Inutiles - Dalil.dz

**Date :** $(date)
**Objectif :** Identifier tous les fichiers inutiles pour optimisation

## 📊 Résumé des Fichiers Inutiles Identifiés

EOF

echo "📁 Recherche des fichiers de développement et test..."
echo "🧪 Fichiers de test (*.test.*):"
find . -name "*.test.*" -type f | head -10

echo ""
echo "📋 Fichiers de spécification (*.spec.*):"
find . -name "*.spec.*" -type f | head -10

echo ""
echo "🏗️ Dossiers de build:"
find . -name "dist" -o -name "build" -o -name ".next" -o -name ".nuxt" -type d

echo ""
echo "🗂️ Fichiers temporaires:"
find . -name "*.tmp" -o -name "*.temp" -o -name "*~" -type f | head -10

echo ""
echo "💻 Fichiers système:"
find . -name ".DS_Store" -o -name "Thumbs.db" -o -name "*.swp" -o -name "*.swo" -type f

echo ""
echo "💾 Fichiers de sauvegarde:"
find . -name "*.bak" -o -name "*.old" -o -name "*.orig" -type f | head -10

echo ""
echo "📦 Fichiers compressés:"
find . -name "*.zip" -o -name "*.tar.gz" -o -name "*.rar" -o -name "*.7z" -type f

echo ""
echo "📝 Fichiers de log:"
find . -name "*.log" -type f | head -10

echo ""
echo "📊 Fichiers de données redondants:"
echo "   - src/data/algeria-58-wilayas-real.json"
echo "   - src/data/algeria-58-wilayas-realistic.ts"
echo "   - src/data/algeria-real-wilayas.ts"
echo "   - src/data/algeria-wilayas-complete.ts"
echo "   - src/data/algeria-wilayas-data.ts"
echo "   - src/data/algeria-58-wilayas-optimized.ts"
echo "   - src/data/algeria-wilayas-simple.ts"
echo "   - src/data/algerianData.ts"
echo "   - src/data/algerianLegalTemplates.ts"
echo "   - src/data/formTemplates.ts"
echo "   - src/data/formTemplatesAdditional.ts"
echo "   - src/data/formTemplatesExtended.ts"
echo "   - src/data/formTemplatesFinal.ts"
echo "   - src/data/legalTextTemplates.ts"
echo "   - src/data/legalTextTemplatesComplete.ts"
echo "   - src/data/legalTextTemplatesComplete2.ts"
echo "   - src/data/legalTextTemplatesComplete3.ts"
echo "   - public/algeria-58-wilayas-real.geojson"

echo ""
echo "📁 Dossiers vides:"
find . -type d -empty | grep -v "^\.$" | grep -v "^\.git$" | grep -v "^\.github$" | head -10

echo ""
echo "🔍 Vérification de la taille actuelle..."
CURRENT_SIZE=$(du -sh . | cut -f1)
CURRENT_SIZE_MB=$(du -sm . | cut -f1)

echo "📊 Taille actuelle du projet : $CURRENT_SIZE ($CURRENT_SIZE_MB MB)"

# Calculer l'espace potentiellement récupérable
echo ""
echo "💡 Estimation de l'espace récupérable :"

# Compter les fichiers de test
TEST_FILES_COUNT=$(find . -name "*.test.*" -type f | wc -l)
echo "   - Fichiers de test : $TEST_FILES_COUNT fichiers"

# Compter les fichiers de spécification
SPEC_FILES_COUNT=$(find . -name "*.spec.*" -type f | wc -l)
echo "   - Fichiers de spécification : $SPEC_FILES_COUNT fichiers"

# Compter les fichiers temporaires
TEMP_FILES_COUNT=$(find . -name "*.tmp" -o -name "*.temp" -o -name "*~" -type f | wc -l)
echo "   - Fichiers temporaires : $TEMP_FILES_COUNT fichiers"

# Compter les fichiers système
SYSTEM_FILES_COUNT=$(find . -name ".DS_Store" -o -name "Thumbs.db" -o -name "*.swp" -o -name "*.swo" -type f | wc -l)
echo "   - Fichiers système : $SYSTEM_FILES_COUNT fichiers"

# Compter les fichiers de sauvegarde
BACKUP_FILES_COUNT=$(find . -name "*.bak" -o -name "*.old" -o -name "*.orig" -type f | wc -l)
echo "   - Fichiers de sauvegarde : $BACKUP_FILES_COUNT fichiers"

# Compter les fichiers de log
LOG_FILES_COUNT=$(find . -name "*.log" -type f | wc -l)
echo "   - Fichiers de log : $LOG_FILES_COUNT fichiers"

echo ""
echo "🎯 Recommandations :"
echo "   1. Utilisez le script remove-unnecessary-files.sh pour supprimer ces fichiers"
echo "   2. Vérifiez que l'application fonctionne après suppression"
echo "   3. Testez le bilinguisme et les fonctionnalités algériennes"
echo "   4. Consultez le rapport complet : $REPORT_FILE"

echo ""
echo "✅ Identification terminée ! Rapport créé : $REPORT_FILE"