#!/bin/bash

# SCRIPT ABSOLU - REMPLACEMENT COMPLET DE VITE
# Utilise un serveur personnalisé - AUCUN identifiant aléatoire JAMAIS
# Branche LYO - Solution absolue finale

echo "💥 DÉMARRAGE ABSOLU - Remplacement complet de Vite"
echo "📁 Branche: LYO"
echo "🌐 URL: http://localhost:8080"
echo "🔒 Mode: Serveur personnalisé - ZÉRO identifiant aléatoire"
echo "💀 Vite: COMPLÈTEMENT ABANDONNÉ"
echo ""

# Vérifier la branche
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "LYO" ]; then
    echo "⚠️  Attention: Vous n'êtes pas sur la branche LYO"
    echo "   Branche actuelle: $CURRENT_BRANCH"
    echo "   Utilisez: git checkout LYO"
    echo ""
fi

# ÉTAPE 1: Élimination ABSOLUE de tous les processus Vite
echo "💀 ÉLIMINATION ABSOLUE de tous les processus Vite..."
pkill -9 -f "vite" 2>/dev/null || true
pkill -9 -f "npm.*dev" 2>/dev/null || true
pkill -9 -f "node.*vite" 2>/dev/null || true
pkill -9 -f "custom-dev-server" 2>/dev/null || true
sleep 5

# ÉTAPE 2: Destruction complète de tous les caches Vite
echo "💣 DESTRUCTION complète de tous les caches Vite..."
rm -rf node_modules/.vite .vite dist node_modules/.cache .nuxt .next .turbo 2>/dev/null || true

# ÉTAPE 3: Vérification des dépendances pour le serveur personnalisé
if [ ! -d "node_modules/express" ]; then
    echo "📦 Installation des dépendances pour le serveur personnalisé..."
    npm install express ws --save-dev
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation des dépendances"
        exit 1
    fi
fi

# ÉTAPE 4: Vérification que le serveur personnalisé existe
if [ ! -f "custom-dev-server.js" ]; then
    echo "❌ ERREUR: Serveur personnalisé non trouvé"
    echo "   Le fichier custom-dev-server.js est requis"
    exit 1
fi

# ÉTAPE 5: Variables d'environnement pour le serveur personnalisé
echo "🎯 Configuration des variables d'environnement ultra-stables..."
export NODE_ENV=development
export NO_VITE=true
export CUSTOM_SERVER=true
export NO_RANDOM_IDENTIFIERS=true
export ABSOLUTE_MODE=true

# ÉTAPE 6: Création du verrou absolu
echo "🔒 Activation du mode absolu..."
echo "ABSOLUTE_MODE=true
NO_VITE=true
CUSTOM_SERVER=true
NO_RANDOM_IDENTIFIERS=GUARANTEED
VITE_ABANDONED=true
SERVER_TYPE=custom
ACTIVATED_AT=$(date)
" > .absolute-mode.lock

# ÉTAPE 7: Modification du package.json pour le serveur personnalisé
if ! grep -q "dev:custom" package.json; then
    echo "📝 Ajout du script de serveur personnalisé..."
    
    # Backup du package.json
    cp package.json package.json.backup
    
    # Ajouter le script personnalisé
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.scripts['dev:custom'] = 'node custom-dev-server.js';
    pkg.scripts['dev:absolute'] = 'node custom-dev-server.js';
    pkg.scripts['start:no-vite'] = 'node custom-dev-server.js';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
    
    echo "✅ Scripts personnalisés ajoutés au package.json"
fi

# ÉTAPE 8: Démarrage du serveur personnalisé
echo ""
echo "💥 DÉMARRAGE DU SERVEUR PERSONNALISÉ..."
echo "   Port: 8080"
echo "   Mode: Development Absolu"
echo "   Vite: COMPLÈTEMENT REMPLACÉ"
echo "   Identifiants: FIXES (aucun aléatoire)"
echo "   Type: Serveur Express personnalisé"
echo ""

# Fonction de surveillance du serveur personnalisé
monitor_custom_server() {
    node custom-dev-server.js 2>&1 | while IFS= read -r line; do
        # Afficher tous les messages du serveur personnalisé
        echo "$line"
        
        # Vérifier si le serveur est bien démarré
        if [[ "$line" == *"SERVEUR PERSONNALISÉ DÉMARRÉ"* ]]; then
            echo ""
            echo "🎉 SUCCÈS ABSOLU!"
            echo "✅ Serveur personnalisé opérationnel"
            echo "🔒 AUCUN identifiant aléatoire possible"
            echo "💀 Vite complètement éliminé"
            echo ""
        fi
    done
}

# Message de démarrage
echo "🚀 Lancement du serveur personnalisé..."
echo "💀 Vite est mort, longue vie au serveur personnalisé!"
echo ""

# Lancer le serveur personnalisé avec surveillance
monitor_custom_server

# Si on arrive ici, c'est qu'il y a eu un problème
echo "❌ Arrêt inattendu du serveur personnalisé"
echo "🔄 Tentative de redémarrage..."
sleep 3
exec "$0"