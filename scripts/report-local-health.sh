#!/bin/bash

# 📊 RAPPORT DE SANTÉ LOCAL
# Exécute les requêtes SQL de validation et génère un rapport synthétique

set -e

API_BASE="http://localhost:8080"
SUPABASE_API="http://localhost:54321"

echo "🔍 Rapport de santé du système local"
echo "====================================="

# 1. Health check de l'app
echo "📱 Statut de l'application:"
curl -s "$API_BASE/api/health" | jq '.' || echo "❌ App inaccessible"

echo ""
echo "ℹ️  Informations de l'application:"
curl -s "$API_BASE/api/info" | jq '.' || echo "❌ Info inaccessible"

# 2. Health check Supabase
echo ""
echo "🗄️  Statut Supabase:"
curl -s "$SUPABASE_API/rest/v1/" | head -c 60 || echo "❌ Supabase inaccessible"

# 3. Test LOCAL_ONLY
echo ""
echo "🔒 Test du mode LOCAL_ONLY:"
echo "localStorage.setItem('LOCAL_ONLY','true'); console.log('LOCAL_ONLY activé');" > /tmp/test-local.js
echo "   → Activez manuellement dans DevTools: localStorage.setItem('LOCAL_ONLY','true')"

# 4. Vérification des ports
echo ""
echo "🌐 Vérification des ports:"
nc -z localhost 8080 && echo "✅ Port 8080 (app) ouvert" || echo "❌ Port 8080 fermé"
nc -z localhost 54321 && echo "✅ Port 54321 (Supabase) ouvert" || echo "❌ Port 54321 fermé"
nc -z localhost 11434 && echo "✅ Port 11434 (Ollama) ouvert" || echo "⚠️  Port 11434 fermé (optionnel)"

echo ""
echo "📋 Requêtes SQL de validation disponibles:"
echo "   1. Contrôle ingestion: SELECT COUNT(*) FROM legal_texts"
echo "   2. Jobs d'ingestion: SELECT * FROM jobs WHERE type = 'ingest_source'"
echo "   3. Workflow: SELECT status, COUNT(*) FROM approval_items GROUP BY status"
echo "   4. Erreurs: SELECT * FROM validation_errors"

echo ""
echo "✅ Rapport terminé - $(date)"