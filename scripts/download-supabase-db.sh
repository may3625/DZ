#!/bin/bash

# 📥 SCRIPT DE TÉLÉCHARGEMENT DE LA BASE SUPABASE
# Télécharge la base externe pour utilisation locale

set -e

# Configuration
EXTERNAL_URL="https://bsopguyucqkmjrkxaztc.supabase.co"
EXTERNAL_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzb3BndXl1Y3FrbWpya3hhenRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3Njc5NDcsImV4cCI6MjA3MDM0Mzk0N30.FcuTjayYMTcH7q1lvoTo1SVqwNe_s8slmJMfrcBAehI"
LOCAL_DIR="./supabase-local-data"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "📥 TÉLÉCHARGEMENT DE LA BASE SUPABASE EXTERNE"
echo "=============================================="
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur : Ce script doit être exécuté depuis la racine du projet DZ"
    exit 1
fi

echo "✅ Répertoire de projet détecté"
echo ""

# Créer le répertoire de destination
mkdir -p "$LOCAL_DIR"
echo "📁 Répertoire de destination créé : $LOCAL_DIR"

# Fonction pour télécharger une table
download_table() {
    local table_name=$1
    local output_file="$LOCAL_DIR/${table_name}_${TIMESTAMP}.json"
    
    echo "📥 Téléchargement de la table : $table_name"
    
    # Utiliser l'API REST de Supabase pour télécharger les données
    curl -s \
        -H "apikey: $EXTERNAL_KEY" \
        -H "Authorization: Bearer $EXTERNAL_KEY" \
        "$EXTERNAL_URL/rest/v1/$table_name?select=*" \
        -o "$output_file"
    
    if [ $? -eq 0 ]; then
        local row_count=$(jq length "$output_file" 2>/dev/null || echo "0")
        echo "   ✅ $table_name téléchargée : $row_count lignes -> $output_file"
    else
        echo "   ❌ Erreur lors du téléchargement de $table_name"
    fi
}

# Tables principales à télécharger
TABLES=(
    "wilayas"
    "legal_texts"
    "sectors"
    "embeddings"
    "form_templates"
    "legal_relationships"
    "users"
    "user_profiles"
    "workflow_approvals"
    "search_queries"
    "analytics_events"
)

echo ""
echo "🔍 TABLES IDENTIFIÉES POUR TÉLÉCHARGEMENT"
echo "------------------------------------------"

for table in "${TABLES[@]}"; do
    echo "   • $table"
done

echo ""
echo "🚀 DÉBUT DU TÉLÉCHARGEMENT"
echo "---------------------------"

# Télécharger chaque table
for table in "${TABLES[@]}"; do
    download_table "$table"
    sleep 1  # Pause entre les requêtes
done

echo ""
echo "📊 RÉSUMÉ DU TÉLÉCHARGEMENT"
echo "----------------------------"

# Compter les fichiers téléchargés
downloaded_files=$(ls -1 "$LOCAL_DIR"/*.json 2>/dev/null | wc -l)
total_size=$(du -sh "$LOCAL_DIR" 2>/dev/null | cut -f1)

echo "📁 Fichiers téléchargés : $downloaded_files"
echo "💾 Taille totale : $total_size"
echo "📅 Timestamp : $TIMESTAMP"

# Créer un fichier de métadonnées
metadata_file="$LOCAL_DIR/metadata_${TIMESTAMP}.json"
cat > "$metadata_file" << EOF
{
  "download_timestamp": "$TIMESTAMP",
  "external_url": "$EXTERNAL_URL",
  "tables_downloaded": ${#TABLES[@]},
  "tables": ${TABLES[@]},
  "total_files": $downloaded_files,
  "total_size": "$total_size",
  "project": "DZ - Plateforme Juridique Algérienne",
  "description": "Base de données téléchargée depuis Supabase externe pour utilisation locale"
}
EOF

echo "📋 Métadonnées sauvegardées : $metadata_file"

echo ""
echo "🎯 PROCHAINES ÉTAPES"
echo "--------------------"
echo "1. 📥 Vérifier les fichiers téléchargés dans : $LOCAL_DIR"
echo "2. 🔧 Configurer Supabase local avec : VITE_SUPABASE_MODE=LOCAL"
echo "3. 🗄️  Importer les données dans votre base locale"
echo "4. 🧪 Tester l'application en mode local"
echo "5. 🚀 Basculer en production locale"

echo ""
echo "📁 Répertoire des données : $LOCAL_DIR"
echo "🔗 Repository GitHub : https://github.com/Mani499/DZ"
echo "📅 Date de téléchargement : $(date)"
echo "============================================="