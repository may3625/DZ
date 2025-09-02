#!/bin/bash

# 📦 PACKAGING OFFLINE (Lot 6)
# Regroupe les assets nécessaires pour un déploiement hors-ligne

set -e

OUT_DIR="./offline-bundle"
DIST_DIR="./dist"

echo "📦 Création du bundle hors-ligne"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/public" "$OUT_DIR/dist"

echo "🔨 Build de production"
npm run build >/dev/null 2>&1 || { echo "❌ Build échoué"; exit 1; }

echo "📁 Copie des assets critiques"
cp -a public/tesseract-worker.js "$OUT_DIR/public/" || true
cp -a public/tesseract-core.wasm* "$OUT_DIR/public/" || true
cp -a public/tesseract-lang "$OUT_DIR/public/" || true
cp -a public/opencv "$OUT_DIR/public/" || true
cp -a public/algeria-*.geo.json "$OUT_DIR/public/" || true
cp -a "$DIST_DIR"/* "$OUT_DIR/dist/"

echo "🔐 Génération des checksums"
(
  cd "$OUT_DIR"
  find . -type f -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS.txt
)

echo "✅ Bundle prêt: $OUT_DIR"
echo "➡️  Contenu clé: dist/ (app), public/ (OCR/OpenCV/Geo)"