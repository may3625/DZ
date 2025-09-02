#!/bin/bash

# 📤 SCRIPT D'IMPORT VERS SUPABASE LOCAL
# Importe les données téléchargées dans la base locale

set -e

# Configuration
LOCAL_URL="http://localhost:54321"
LOCAL_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3Njc5NDcsImV4cCI6MjA3MDM0Mzk0N30.local"
DATA_DIR="./supabase-local-data"
IMPORT_LOG="./import-log.txt"

echo "📤 IMPORT VERS SUPABASE LOCAL"
echo "============================="
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur : Ce script doit être exécuté depuis la racine du projet DZ"
    exit 1
fi

# Vérifier que le répertoire de données existe
if [ ! -d "$DATA_DIR" ]; then
    echo "❌ Erreur : Répertoire de données non trouvé : $DATA_DIR"
    echo "   Exécutez d'abord : ./scripts/download-supabase-db.sh"
    exit 1
fi

echo "✅ Répertoire de données détecté : $DATA_DIR"

# Vérifier que Supabase local est accessible
echo "🔍 Vérification de l'accessibilité de Supabase local..."
if curl -s "$LOCAL_URL/rest/v1/" > /dev/null 2>&1; then
    echo "✅ Supabase local accessible : $LOCAL_URL"
else
    echo "❌ Erreur : Supabase local non accessible à $LOCAL_URL"
    echo "   Assurez-vous que Supabase local est démarré :"
    echo "   npx supabase start"
    exit 1
fi

# Créer le fichier de log
echo "📝 Création du fichier de log : $IMPORT_LOG"
echo "Import vers Supabase local - $(date)" > "$IMPORT_LOG"

# Fonction pour importer une table
import_table() {
    local json_file=$1
    local table_name=$(basename "$json_file" | cut -d'_' -f1)
    local timestamp=$(basename "$json_file" | cut -d'_' -f2 | cut -d'.' -f1)
    
    echo "📤 Import de la table : $table_name"
    echo "   📁 Fichier : $json_file"
    
    # Vérifier que le fichier JSON existe et n'est pas vide
    if [ ! -f "$json_file" ] || [ ! -s "$json_file" ]; then
        echo "   ❌ Fichier vide ou manquant : $json_file"
        echo "   ❌ Import de $table_name échoué" >> "$IMPORT_LOG"
        return 1
    fi
    
    # Compter les lignes dans le fichier JSON
    local row_count=$(jq length "$json_file" 2>/dev/null || echo "0")
    if [ "$row_count" -eq 0 ]; then
        echo "   ⚠️  Fichier vide : $json_file"
        echo "   ⚠️  Import de $table_name ignoré (fichier vide)" >> "$IMPORT_LOG"
        return 0
    fi
    
    echo "   📊 Lignes à importer : $row_count"
    
    # Importer les données via l'API REST de Supabase
    local import_result=$(curl -s \
        -H "apikey: $LOCAL_KEY" \
        -H "Authorization: Bearer $LOCAL_KEY" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=minimal" \
        -X POST \
        -d @"$json_file" \
        "$LOCAL_URL/rest/v1/$table_name")
    
    if [ $? -eq 0 ] && [ -n "$import_result" ]; then
        echo "   ✅ Import réussi : $table_name ($row_count lignes)"
        echo "   ✅ Import de $table_name réussi ($row_count lignes)" >> "$IMPORT_LOG"
        return 0
    else
        echo "   ❌ Erreur lors de l'import de $table_name"
        echo "   ❌ Import de $table_name échoué" >> "$IMPORT_LOG"
        return 1
    fi
}

echo ""
echo "🔍 FICHIERS JSON DÉTECTÉS"
echo "--------------------------"

# Lister tous les fichiers JSON dans le répertoire de données
json_files=($(find "$DATA_DIR" -name "*.json" -type f | grep -v "metadata" | sort))
metadata_files=($(find "$DATA_DIR" -name "metadata*.json" -type f))

if [ ${#json_files[@]} -eq 0 ]; then
    echo "❌ Aucun fichier de données trouvé dans $DATA_DIR"
    exit 1
fi

for file in "${json_files[@]}"; do
    table_name=$(basename "$file" | cut -d'_' -f1)
    timestamp=$(basename "$file" | cut -d'_' -f2 | cut -d'.' -f1)
    size=$(du -h "$file" | cut -f1)
    echo "   • $table_name ($timestamp) - $size"
done

echo ""
echo "📋 MÉTADONNÉES DÉTECTÉES"
echo "------------------------"

for file in "${metadata_files[@]}"; do
    timestamp=$(basename "$file" | cut -d'_' -f2 | cut -d'.' -f1)
    echo "   • metadata ($timestamp)"
done

echo ""
echo "🚀 DÉBUT DE L'IMPORT"
echo "--------------------"

# Statistiques d'import
total_files=${#json_files[@]}
successful_imports=0
failed_imports=0

# Importer chaque table
for file in "${json_files[@]}"; do
    if import_table "$file"; then
        successful_imports=$((successful_imports + 1))
    else
        failed_imports=$((failed_imports + 1))
    fi
    sleep 0.5  # Pause entre les imports
done

echo ""
echo "📊 RÉSUMÉ DE L'IMPORT"
echo "---------------------"

echo "📁 Total des fichiers : $total_files"
echo "✅ Imports réussis : $successful_imports"
echo "❌ Imports échoués : $failed_imports"
echo "📝 Log détaillé : $IMPORT_LOG"

# Sauvegarder le résumé dans le log
echo "" >> "$IMPORT_LOG"
echo "=== RÉSUMÉ FINAL ===" >> "$IMPORT_LOG"
echo "Total des fichiers : $total_files" >> "$IMPORT_LOG"
echo "Imports réussis : $successful_imports" >> "$IMPORT_LOG"
echo "Imports échoués : $failed_imports" >> "$IMPORT_LOG"
echo "Timestamp : $(date)" >> "$IMPORT_LOG"

echo ""
echo "🎯 PROCHAINES ÉTAPES"
echo "--------------------"
echo "1. 🔧 Configurer l'application : VITE_SUPABASE_MODE=LOCAL"
echo "2. 🧪 Tester l'application avec les données locales"
echo "3. 🔍 Vérifier l'intégrité des données importées"
echo "4. 🚀 Basculer en production locale"

echo ""
echo "📁 Données importées depuis : $DATA_DIR"
echo "📝 Log d'import : $IMPORT_LOG"
echo "🔗 Repository GitHub : https://github.com/Mani499/DZ"
echo "📅 Date d'import : $(date)"
echo "============================="