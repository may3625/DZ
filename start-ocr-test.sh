#!/bin/bash

# Script de démarrage pour tester l'OCR avec configuration CSP corrigée
# Dalil.dz - Plateforme Algérienne de Veille Juridique

echo "🚀 Démarrage du test OCR Tesseract.js"
echo "====================================="
echo ""

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

echo "✅ Node.js et npm détectés"
echo ""

# Vérifier les dépendances
echo "📦 Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo "📥 Installation des dépendances..."
    npm install
else
    echo "✅ Dépendances déjà installées"
fi

echo ""

# Vérifier les fichiers Tesseract.js
echo "🔍 Vérification des fichiers Tesseract.js..."
if [ -f "public/tesseract-worker.js" ] && [ -f "public/tesseract-core.wasm.js" ]; then
    echo "✅ Fichiers Tesseract.js présents"
else
    echo "❌ Fichiers Tesseract.js manquants"
    echo "📥 Téléchargement des fichiers..."
    
    cd public
    curl -o tesseract-worker.js https://cdn.jsdelivr.net/npm/tesseract.js@v6.0.1/dist/worker.min.js
    curl -o tesseract-core.wasm.js https://cdn.jsdelivr.net/npm/tesseract.js-core@4.0.4/tesseract-core.wasm.js
    curl -o tesseract-core.wasm https://cdn.jsdelivr.net/npm/tesseract.js-core@4.0.4/tesseract-core.wasm
    cd ..
fi

echo ""

# Vérifier la configuration
echo "⚙️ Vérification de la configuration..."
if [ -f ".env" ]; then
    echo "✅ Fichier .env présent"
else
    echo "❌ Fichier .env manquant, création..."
    cat > .env << EOF
# Configuration d'environnement pour Dalil.dz
NODE_ENV=development
PORT=8080

# Configuration CSP (désactivée en développement pour Tesseract.js)
DISABLE_CSP=true

# Configuration Tesseract.js
TESSERACT_WORKER_PATH=/tesseract-worker.js
TESSERACT_CORE_PATH=/tesseract-core.wasm.js
TESSERACT_LANG_PATH=/tesseract-lang

# Configuration de sécurité
CORS_ORIGIN=http://localhost:8080,http://127.0.0.1:8080
EOF
    echo "✅ Fichier .env créé"
fi

echo ""

# Démarrer le serveur
echo "🌐 Démarrage du serveur de développement..."
echo "📍 URL: http://localhost:8080"
echo "🔧 CSP désactivée pour le développement"
echo ""
echo "💡 Pour tester l'OCR:"
echo "   1. Ouvrez http://localhost:8080 dans votre navigateur"
echo "   2. Utilisez le composant de test OCR"
echo "   3. Testez l'initialisation et l'extraction"
echo ""
echo "🛑 Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

# Démarrer le serveur
npm run dev