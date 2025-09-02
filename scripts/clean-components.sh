#!/bin/bash

# Script de nettoyage des composants volumineux
echo "🧹 Nettoyage des composants volumineux..."

# Supprimer les composants de test et d'exemple
echo "🗑️  Suppression des composants de test..."
find src/components/ -name "*Test*" -type f -delete 2>/dev/null
find src/components/ -name "*Example*" -type f -delete 2>/dev/null
find src/components/ -name "*Demo*" -type f -delete 2>/dev/null

# Supprimer les composants obsolètes
echo "🗑️  Suppression des composants obsolètes..."
find src/components/ -name "*Old*" -type f -delete 2>/dev/null
find src/components/ -name "*Legacy*" -type f -delete 2>/dev/null
find src/components/ -name "*Deprecated*" -type f -delete 2>/dev/null

# Supprimer les composants de développement
echo "🗑️  Suppression des composants de développement..."
find src/components/ -name "*Dev*" -type f -delete 2>/dev/null
find src/components/ -name "*Debug*" -type f -delete 2>/dev/null

# Supprimer les composants temporaires
echo "🗑️  Suppression des composants temporaires..."
find src/components/ -name "*Temp*" -type f -delete 2>/dev/null
find src/components/ -name "*Tmp*" -type f -delete 2>/dev/null

# Supprimer les composants expérimentaux
echo "🗑️  Suppression des composants expérimentaux..."
find src/components/ -name "*Experimental*" -type f -delete 2>/dev/null
find src/components/ -name "*Beta*" -type f -delete 2>/dev/null

# Nettoyer les composants OCR volumineux
echo "🗑️  Nettoyage des composants OCR..."
find src/components/ocr/ -name "*Test*" -type f -delete 2>/dev/null
find src/components/ocr/ -name "*Example*" -type f -delete 2>/dev/null

# Nettoyer les composants d'analyse volumineux
echo "🗑️  Nettoyage des composants d'analyse..."
find src/components/analytics/ -name "*Test*" -type f -delete 2>/dev/null
find src/components/analytics/ -name "*Example*" -type f -delete 2>/dev/null

# Vérifier la nouvelle taille
echo "📊 Vérification de la taille après nettoyage..."
echo "📏 Taille du dossier src :"
du -sh src/ 2>/dev/null

echo "📏 Taille du dossier components :"
du -sh src/components/ 2>/dev/null

echo "✅ Nettoyage des composants terminé !"