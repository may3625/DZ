#!/bin/bash

# 🧪 SCRIPT DE TEST OCR APRÈS CORRECTIONS TESSERACT
# Teste la fonctionnalité OCR de l'application DZ

echo "🔧 TEST DE FONCTIONNALITÉ OCR - DZ APPLICATION"
echo "================================================"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur : Ce script doit être exécuté depuis la racine du projet DZ"
    exit 1
fi

echo "✅ Répertoire de projet détecté"
echo ""

# Vérifier les fichiers Tesseract
echo "🔍 VÉRIFICATION DES FICHIERS TESSERACT"
echo "----------------------------------------"

# Vérifier les fichiers de langue
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

# Vérifier les fichiers Tesseract décompressés
if [ -f "public/tesseract-core.wasm" ]; then
    echo "✅ Fichier core WebAssembly : tesseract-core.wasm"
    echo "   Taille: $(du -h public/tesseract-core.wasm | cut -f1)"
else
    echo "❌ Fichier core WebAssembly manquant"
fi

if [ -f "public/tesseract-core.wasm.js" ]; then
    echo "✅ Fichier core JavaScript : tesseract-core.wasm.js"
    echo "   Taille: $(du -h public/tesseract-core.wasm.js | cut -f1)"
else
    echo "❌ Fichier core JavaScript manquant"
fi

if [ -f "public/tesseract-worker.js" ]; then
    echo "✅ Fichier worker : tesseract-worker.js"
    echo "   Taille: $(du -h public/tesseract-worker.js | cut -f1)"
else
    echo "❌ Fichier worker manquant"
fi

# Vérifier qu'il n'y a plus de fichiers compressés
echo ""
echo "🔍 VÉRIFICATION DES FICHIERS COMPRESSÉS"
echo "----------------------------------------"

if [ -f "public/tesseract-core.wasm.gz" ]; then
    echo "❌ Fichier compressé encore présent : tesseract-core.wasm.gz"
else
    echo "✅ Fichier compressé supprimé : tesseract-core.wasm.gz"
fi

if [ -f "public/tesseract-core.wasm.js.gz" ]; then
    echo "❌ Fichier compressé encore présent : tesseract-core.wasm.js.gz"
else
    echo "✅ Fichier compressé supprimé : tesseract-core.wasm.js.gz"
fi

if [ -f "public/tesseract-worker.js.gz" ]; then
    echo "❌ Fichier compressé encore présent : tesseract-worker.js.gz"
else
    echo "✅ Fichier compressé supprimé : tesseract-worker.js.gz"
fi

echo ""
echo "🚀 RÉSUMÉ DES CORRECTIONS"
echo "---------------------------"

# Compter les fichiers présents
lang_files=$(ls -1 public/tesseract-lang/*.traineddata 2>/dev/null | wc -l)
tesseract_files=$(ls -1 public/tesseract-* 2>/dev/null | grep -v ".gz" | grep -v "tesseract-lang" | wc -l)
compressed_files=$(ls -1 public/tesseract-*.gz 2>/dev/null | wc -l)

echo "📊 Fichiers de langue Tesseract : $lang_files/2"
echo "📊 Fichiers Tesseract décompressés : $tesseract_files/3 (core.wasm, core.wasm.js, worker.js)"
echo "📊 Fichiers compressés restants : $compressed_files/0"

echo ""
if [ $lang_files -eq 2 ] && [ $tesseract_files -eq 3 ] && [ $compressed_files -eq 0 ]; then
    echo "🎉 TOUTES LES CORRECTIONS ONT ÉTÉ APPLIQUÉES AVEC SUCCÈS !"
    echo ""
    echo "✅ L'application OCR est maintenant prête pour les tests"
    echo "✅ Vous pouvez tester avec de vrais documents"
    echo "✅ Support français et arabe opérationnel"
    echo ""
    echo "🚀 PROCHAINES ÉTAPES :"
    echo "   1. Démarrer l'application : npm run dev"
    echo "   2. Aller dans le menu OCR + IA"
    echo "   3. Tester avec un document PDF ou image"
    echo "   4. Valider l'extraction et le mapping"
else
    echo "⚠️  CERTAINES CORRECTIONS SONT INCOMPLÈTES"
    echo ""
    echo "❌ Vérifiez les fichiers manquants ci-dessus"
    echo "❌ Relancez le script après correction"
fi

echo ""
echo "🔗 Repository GitHub : https://github.com/Mani499/DZ"
echo "📅 Date de test : $(date)"
echo "================================================"