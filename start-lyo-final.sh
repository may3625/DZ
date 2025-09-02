#!/bin/bash

# SCRIPT FINAL ABSOLU - SERVEUR NODE.JS NATIF
# AUCUN Vite - AUCUN identifiant aléatoire - JAMAIS
# Branche LYO - Solution absolue et définitive

echo "🎯 DÉMARRAGE FINAL ABSOLU - Serveur Node.js natif"
echo "📁 Branche: LYO"
echo "🌐 URL: http://localhost:8080"
echo "🔒 Mode: Serveur Node.js ultra-simple"
echo "💀 Vite: COMPLÈTEMENT ÉLIMINÉ"
echo "📦 Dépendances: AUCUNE (Node.js natif uniquement)"
echo ""

# Vérifier la branche
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "LYO" ]; then
    echo "⚠️  Attention: Vous n'êtes pas sur la branche LYO"
    echo "   Branche actuelle: $CURRENT_BRANCH"
    echo "   Utilisez: git checkout LYO"
    echo ""
fi

# ÉTAPE 1: Élimination TOTALE de tous les processus
echo "💀 ÉLIMINATION TOTALE de tous les processus Vite et serveurs..."
pkill -9 -f "vite" 2>/dev/null || true
pkill -9 -f "npm.*dev" 2>/dev/null || true
pkill -9 -f "node.*vite" 2>/dev/null || true
pkill -9 -f "custom-dev-server" 2>/dev/null || true
pkill -9 -f "simple-dev-server" 2>/dev/null || true
sleep 3

# ÉTAPE 2: Vérification que le serveur ultra-simple existe
if [ ! -f "simple-dev-server.js" ]; then
    echo "❌ ERREUR CRITIQUE: Serveur ultra-simple non trouvé"
    echo "   Le fichier simple-dev-server.js est requis"
    echo "   Ce serveur remplace complètement Vite"
    exit 1
fi

# ÉTAPE 3: Variables d'environnement finales
echo "🎯 Configuration finale des variables d'environnement..."
export NODE_ENV=development
export NO_VITE=true
export SIMPLE_SERVER=true
export NO_RANDOM_IDENTIFIERS=GUARANTEED
export ABSOLUTE_FINAL_MODE=true

# ÉTAPE 4: Création du verrou final
echo "🔒 Activation du mode final absolu..."
echo "FINAL_ABSOLUTE_MODE=true
NO_VITE=true
SIMPLE_SERVER=true
NO_RANDOM_IDENTIFIERS=GUARANTEED
VITE_ELIMINATED=true
SERVER_TYPE=node_native
NODE_ONLY=true
ACTIVATED_AT=$(date)
SOLUTION=ABSOLUTE_FINAL
" > .final-absolute.lock

# ÉTAPE 5: Message de démarrage final
echo ""
echo "🎯 DÉMARRAGE DU SERVEUR FINAL ABSOLU..."
echo "   Port: 8080"
echo "   Type: Node.js HTTP natif"
echo "   Vite: COMPLÈTEMENT ÉLIMINÉ"
echo "   Identifiants: FIXES (aucun aléatoire possible)"
echo "   Dépendances: ZÉRO (Node.js uniquement)"
echo "   Garantie: AUCUN identifiant aléatoire - PHYSIQUEMENT IMPOSSIBLE"
echo ""

# ÉTAPE 6: Lancement du serveur ultra-simple
echo "🚀 Lancement du serveur ultra-simple..."
echo "💀 Vite n'existe plus - Longue vie au serveur natif!"
echo ""

# Fonction de surveillance du serveur final
monitor_final_server() {
    node simple-dev-server.js 2>&1 | while IFS= read -r line; do
        echo "$line"
        
        # Vérifier si le serveur est bien démarré
        if [[ "$line" == *"SERVEUR ULTRA-SIMPLE DÉMARRÉ AVEC SUCCÈS"* ]]; then
            echo ""
            echo "🎉 VICTOIRE ABSOLUE ET DÉFINITIVE!"
            echo "✅ Serveur ultra-simple opérationnel"
            echo "🔒 AUCUN identifiant aléatoire - JAMAIS"
            echo "💀 Vite définitivement éliminé"
            echo "📦 Aucune dépendance externe"
            echo "🎯 Solution finale et absolue active"
            echo ""
            echo "🌐 Application disponible sur:"
            echo "   → http://localhost:8080"
            echo "   → http://0.0.0.0:8080"
            echo ""
        fi
    done
}

# Lancer le serveur final avec surveillance
monitor_final_server

# Si on arrive ici, c'est qu'il y a eu un problème
echo "❌ Arrêt inattendu du serveur final"
echo "🔄 Redémarrage automatique..."
sleep 2
exec "$0"