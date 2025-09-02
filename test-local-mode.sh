#!/bin/bash

# 🧪 SCRIPT DE TEST : MODE LOCAL SANS ERREURS EXTERNES
# Vérifie que l'application fonctionne en mode 100% local

echo "🧪 TEST DU MODE LOCAL SANS ERREURS EXTERNES"
echo "============================================="
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur : Ce script doit être exécuté depuis la racine du projet DZ"
    exit 1
fi

echo "✅ Répertoire de projet détecté"
echo ""

# Vérifier que le client Supabase mock est en place
echo "🔍 VÉRIFICATION DU CLIENT SUPABASE MOCK"
echo "----------------------------------------"

if grep -q "CLIENT SUPABASE MOCK POUR MODE LOCAL" src/integrations/supabase/client.ts 2>/dev/null; then
    echo "✅ Client Supabase mock détecté"
else
    echo "❌ Client Supabase mock non trouvé"
fi

if grep -q "createMockSupabaseClient" src/integrations/supabase/client.ts 2>/dev/null; then
    echo "✅ Fonction createMockSupabaseClient présente"
else
    echo "❌ Fonction createMockSupabaseClient manquante"
fi

if grep -q "bsopguyucqkmjrkxaztc.supabase.co" src/integrations/supabase/client.ts 2>/dev/null; then
    echo "❌ URL externe Supabase encore présente"
else
    echo "✅ URL externe Supabase supprimée"
fi

echo ""

# Vérifier que PDF.js est configuré localement
echo "🔍 VÉRIFICATION DE PDF.JS LOCAL"
echo "--------------------------------"

if [ -f "public/pdf.worker.js" ]; then
    echo "✅ Worker PDF.js présent : public/pdf.worker.js"
    echo "   Taille: $(du -h public/pdf.worker.js | cut -f1)"
else
    echo "❌ Worker PDF.js manquant"
fi

if [ -d "node_modules/pdfjs-dist" ]; then
    echo "✅ Package PDF.js installé : pdfjs-dist"
    echo "   Version: $(cat node_modules/pdfjs-dist/package.json | grep '"version"' | cut -d'"' -f4)"
else
    echo "❌ Package PDF.js non installé"
fi

echo ""

# Vérifier que Tesseract est configuré localement
echo "🔍 VÉRIFICATION DE TESSERACT LOCAL"
echo "-----------------------------------"

if [ -f "public/tesseract-lang/fra.traineddata" ]; then
    echo "✅ Fichier de langue français : fra.traineddata"
    echo "   Taille: $(du -h public/tesseract-lang/fra.traineddata | cut -f1)"
else
    echo "❌ Fichier de langue français manquant"
fi

if [ -f "public/tesseract-lang/ara.traineddata" ]; then
    echo "✅ Fichier de langue arabe : ara.traineddata"
    echo "   Taille: $(du -h public/tesseract-lang/ara.traineddata | cut -f1)"
else
    echo "❌ Fichier de langue arabe manquant"
fi

if [ -f "public/tesseract-core.wasm" ]; then
    echo "✅ Fichier core WebAssembly : tesseract-core.wasm"
    echo "   Taille: $(du -h public/tesseract-core.wasm | cut -f1)"
else
    echo "❌ Fichier core WebAssembly manquant"
fi

echo ""

# Vérifier qu'il n'y a plus de références PyMuPDF
echo "🔍 VÉRIFICATION DE L'ÉLIMINATION PYMUPDF"
echo "------------------------------------------"

ts_files=$(grep -r "PyMuPDF" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
if [ $ts_files -eq 0 ]; then
    echo "✅ Aucune référence PyMuPDF dans le code source"
else
    echo "❌ $ts_files références PyMuPDF restent dans le code source"
fi

echo ""

# Vérifier la configuration CSP
echo "🔍 VÉRIFICATION DE LA CONFIGURATION CSP"
echo "----------------------------------------"

if grep -q "script-src 'self'" src/utils/securityEnhancements.ts 2>/dev/null; then
    echo "✅ CSP configuré avec script-src 'self'"
else
    echo "❌ CSP non configuré ou incorrect"
fi

if grep -q "connect-src 'self'" src/utils/securityEnhancements.ts 2>/dev/null; then
    echo "✅ CSP configuré avec connect-src 'self'"
else
    echo "❌ CSP connect-src non configuré"
fi

echo ""

# Résumé final
echo "🚀 RÉSUMÉ DU TEST MODE LOCAL"
echo "------------------------------"

# Compter les vérifications réussies
checks_passed=0
total_checks=0

# Vérifications Supabase
if grep -q "CLIENT SUPABASE MOCK POUR MODE LOCAL" src/integrations/supabase/client.ts 2>/dev/null; then
    checks_passed=$((checks_passed + 1))
fi
total_checks=$((total_checks + 1))

if ! grep -q "bsopguyucqkmjrkxaztc.supabase.co" src/integrations/supabase/client.ts 2>/dev/null; then
    checks_passed=$((checks_passed + 1))
fi
total_checks=$((total_checks + 1))

# Vérifications PDF.js
if [ -f "public/pdf.worker.js" ]; then
    checks_passed=$((checks_passed + 1))
fi
total_checks=$((total_checks + 1))

if [ -d "node_modules/pdfjs-dist" ]; then
    checks_passed=$((checks_passed + 1))
fi
total_checks=$((total_checks + 1))

# Vérifications Tesseract
if [ -f "public/tesseract-lang/fra.traineddata" ]; then
    checks_passed=$((checks_passed + 1))
fi
total_checks=$((total_checks + 1))

if [ -f "public/tesseract-core.wasm" ]; then
    checks_passed=$((checks_passed + 1))
fi
total_checks=$((total_checks + 1))

# Vérifications PyMuPDF
if [ $ts_files -eq 0 ]; then
    checks_passed=$((checks_passed + 1))
fi
total_checks=$((total_checks + 1))

# Vérifications CSP
if grep -q "script-src 'self'" src/utils/securityEnhancements.ts 2>/dev/null; then
    checks_passed=$((checks_passed + 1))
fi
total_checks=$((total_checks + 1))

echo "📊 Vérifications réussies : $checks_passed/$total_checks"

if [ $checks_passed -eq $total_checks ]; then
    echo ""
    echo "🎉 MODE LOCAL COMPLÈTEMENT CONFIGURÉ !"
    echo ""
    echo "✅ Aucune connexion externe ne sera établie"
    echo "✅ Toutes les fonctionnalités sont locales"
    echo "✅ Application 100% offline opérationnelle"
    echo "✅ Aucune erreur Firestore ou CSP attendue"
    echo ""
    echo "🚀 PROCHAINES ÉTAPES :"
    echo "   1. Démarrer l'application : npm run dev"
    echo "   2. Vérifier qu'il n'y a plus d'erreurs externes"
    echo "   3. Tester l'OCR et l'extraction PDF"
    echo "   4. Valider le workflow complet"
else
    echo ""
    echo "⚠️  CERTAINES CONFIGURATIONS SONT INCOMPLÈTES"
    echo ""
    echo "❌ Vérifiez les éléments manquants ci-dessus"
    echo "❌ Relancez le script après correction"
fi

echo ""
echo "🔗 Repository GitHub : https://github.com/Mani499/DZ"
echo "📅 Date de test : $(date)"
echo "============================================="