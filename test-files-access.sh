#!/bin/bash

# Script de test d'accès aux fichiers de correction
echo "🧪 Test d'accès aux fichiers de correction"
echo "=========================================="

# Attendre que le serveur démarre
echo "⏳ Attente du démarrage du serveur..."
sleep 5

# Test des fichiers de correction
echo ""
echo "🔍 Test des fichiers de correction..."

# Test vite-client-override.js
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/vite-client-override.js | grep -q "200"; then
    echo "✅ vite-client-override.js accessible"
else
    echo "❌ vite-client-override.js non accessible"
fi

# Test browser-error-fixes.js
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/browser-error-fixes.js | grep -q "200"; then
    echo "✅ browser-error-fixes.js accessible"
else
    echo "❌ browser-error-fixes.js non accessible"
fi

# Test csp-config.js
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/csp-config.js | grep -q "200"; then
    echo "✅ csp-config.js accessible"
else
    echo "❌ csp-config.js non accessible"
fi

# Test feature-policy.js
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/feature-policy.js | grep -q "200"; then
    echo "✅ feature-policy.js accessible"
else
    echo "❌ feature-policy.js non accessible"
fi

# Test test-corrections.html
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/test-corrections.html | grep -q "200"; then
    echo "✅ test-corrections.html accessible"
else
    echo "❌ test-corrections.html non accessible"
fi

# Test de la page principale
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ | grep -q "200"; then
    echo "✅ Page principale accessible"
else
    echo "❌ Page principale non accessible"
fi

echo ""
echo "🎯 Test terminé !"
echo "💡 Ouvrez http://localhost:8080 dans votre navigateur"
echo "🧪 Testez les corrections sur http://localhost:8080/test-corrections.html"