#!/bin/bash

# 🚀 SCRIPT D'OPTIMISATION DU RÉPERTOIRE - MAIN DISTANTE
# Libère l'espace en supprimant les fichiers volumineux non nécessaires

echo "🚀 DÉBUT DE L'OPTIMISATION DU RÉPERTOIRE..."

# 📊 État initial
echo "📊 ESPACE AVANT OPTIMISATION :"
du -sh ./* | sort -hr | head -10

# 🗑️ SUPPRESSION DES FICHIERS VOLUMINEUX NON NÉCESSAIRES

echo "🗑️ Suppression du cache Vite temporaire..."
find . -name ".vite-*" -type d -exec rm -rf {} \; 2>/dev/null

echo "🗑️ Suppression des binaires CUDA ONNX non utilisés..."
rm -f ./node_modules/onnxruntime-node/bin/napi-v3/linux/x64/libonnxruntime_providers_cuda.so 2>/dev/null

echo "🗑️ Suppression des binaires multi-plateforme non utilisés..."
rm -rf ./node_modules/onnxruntime-node/bin/napi-v3/darwin 2>/dev/null
rm -rf ./node_modules/onnxruntime-node/bin/napi-v3/win32 2>/dev/null
rm -rf ./node_modules/onnxruntime-node/bin/napi-v3/linux/arm64 2>/dev/null

echo "🗑️ Suppression des binaires SWC non utilisés..."
rm -rf ./node_modules/@swc/core-linux-x64-musl 2>/dev/null

echo "🗑️ Nettoyage des fichiers temporaires..."
find . -name "*.tmp" -delete 2>/dev/null
find . -name "*.log" -delete 2>/dev/null

# 📊 État final
echo "📊 ESPACE APRÈS OPTIMISATION :"
du -sh ./* | sort -hr | head -10

# 📋 Résumé de l'optimisation
echo "🎯 OPTIMISATION TERMINÉE !"
echo "✅ Cache Vite temporaire supprimé"
echo "✅ Binaires multi-plateforme supprimés"
echo "✅ Binaires CUDA non utilisés supprimés"
echo "✅ Fichiers temporaires nettoyés"
echo "🚀 Espace libéré sur la branche main distante !"