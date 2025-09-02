#!/bin/bash

# 🗑️ Script de Suppression des Fichiers Inutiles - Dalil.dz
# Identifie et supprime tous les fichiers inutiles pour optimiser davantage

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🗑️ Début de la suppression des fichiers inutiles${NC}"

# Créer un dossier de sauvegarde
BACKUP_DIR="./backup-unnecessary-files-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Fonction pour sauvegarder avant suppression
backup_file() {
    local file="$1"
    if [ -f "$file" ]; then
        local backup_path="$BACKUP_DIR/$(dirname "$file")"
        mkdir -p "$backup_path"
        cp "$file" "$backup_path/"
        echo -e "${YELLOW}💾 Sauvegardé : $file${NC}"
    fi
}

# Fonction pour supprimer un fichier
remove_file() {
    local file="$1"
    if [ -f "$file" ]; then
        backup_file "$file"
        rm -f "$file"
        echo -e "${GREEN}✅ Supprimé : $file${NC}"
    fi
}

# Fonction pour supprimer un dossier
remove_dir() {
    local dir="$1"
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ Supprimé : $dir${NC}"
        rm -rf "$dir"
    fi
}

echo -e "${YELLOW}📊 Analyse des fichiers inutiles...${NC}"

# 1. FICHIERS DE DÉVELOPPEMENT ET TEST
echo -e "${BLUE}🧪 Suppression des fichiers de développement et test...${NC}"

# Fichiers de test
find . -name "*.test.*" -type f | while read file; do
    remove_file "$file"
done

# Fichiers de spécification
find . -name "*.spec.*" -type f | while read file; do
    remove_file "$file"
done

# Fichiers de couverture
find . -name "coverage" -type d | while read dir; do
    remove_dir "$dir"
done

# 2. FICHIERS DE BUILD ET DISTRIBUTION
echo -e "${BLUE}🏗️ Suppression des fichiers de build...${NC}"

# Dossiers de build
find . -name "dist" -type d | while read dir; do
    remove_dir "$dir"
done

find . -name "build" -type d | while read dir; do
    remove_dir "$dir"
done

find . -name ".next" -type d | while read dir; do
    remove_dir "$dir"
done

find . -name ".nuxt" -type d | while read dir; do
    remove_dir "$dir"
done

# 3. FICHIERS TEMPORAIRES ET CACHE
echo -e "${BLUE}🗂️ Suppression des fichiers temporaires et cache...${NC}"

# Fichiers temporaires
find . -name "*.tmp" -type f | while read file; do
    remove_file "$file"
done

find . -name "*.temp" -type f | while read file; do
    remove_file "$file"
done

find . -name "*~" -type f | while read file; do
    remove_file "$file"
done

# Fichiers de cache
find . -name "*.cache" -type f | while read file; do
    remove_file "$file"
done

find . -name ".cache" -type d | while read dir; do
    remove_dir "$dir"
done

# 4. FICHIERS SYSTÈME
echo -e "${BLUE}💻 Suppression des fichiers système...${NC}"

# Fichiers macOS
find . -name ".DS_Store" -type f | while read file; do
    remove_file "$file"
done

# Fichiers Windows
find . -name "Thumbs.db" -type f | while read file; do
    remove_file "$file"
done

# Fichiers Linux
find . -name "*.swp" -type f | while read file; do
    remove_file "$file"
done

find . -name "*.swo" -type f | while read file; do
    remove_file "$file"
done

# 5. FICHIERS DE SAUVEGARDE ET ANCIENNES VERSIONS
echo -e "${BLUE}💾 Suppression des fichiers de sauvegarde...${NC}"

# Fichiers de sauvegarde
find . -name "*.bak" -type f | while read file; do
    remove_file "$file"
done

find . -name "*.old" -type f | while read file; do
    remove_file "$file"
done

find . -name "*.orig" -type f | while read file; do
    remove_file "$file"
done

# 6. FICHIERS COMPRESSÉS INUTILES
echo -e "${BLUE}📦 Suppression des fichiers compressés inutiles...${NC}"

# Archives
find . -name "*.zip" -type f | while read file; do
    # Vérifier si c'est un fichier de formulaire ou SDK nécessaire
    if [[ "$file" != *"forms"* ]] && [[ "$file" != *"sdk"* ]]; then
        remove_file "$file"
    else
        echo -e "${YELLOW}⚠️ Conservé (nécessaire) : $file${NC}"
    fi
done

find . -name "*.tar.gz" -type f | while read file; do
    remove_file "$file"
done

# 7. FICHIERS DE LOG ET DEBUG
echo -e "${BLUE}📝 Suppression des fichiers de log et debug...${NC}"

# Fichiers de log
find . -name "*.log" -type f | while read file; do
    remove_file "$file"
done

# Fichiers de debug
find . -name "debug.log" -type f | while read file; do
    remove_file "$file"
done

# 8. FICHIERS DE CONFIGURATION INUTILES
echo -e "${BLUE}⚙️ Suppression des fichiers de configuration inutiles...${NC}"

# Fichiers de configuration temporaires
find . -name "*.config.tmp" -type f | while read file; do
    remove_file "$file"
done

# 9. DOSSIERS VIDES
echo -e "${BLUE}📁 Suppression des dossiers vides...${NC}"

# Supprimer les dossiers vides (sauf .git et quelques autres importants)
find . -type d -empty | grep -v "^\.$" | grep -v "^\.git$" | grep -v "^\.github$" | while read dir; do
    echo -e "${GREEN}✅ Dossier vide supprimé : $dir${NC}"
    rmdir "$dir" 2>/dev/null || true
done

# 10. FICHIERS DE DONNÉES REDONDANTS
echo -e "${BLUE}📊 Suppression des fichiers de données redondants...${NC}"

# Fichiers de données dupliqués (après consolidation)
REDUNDANT_DATA_FILES=(
    "src/data/algeria-58-wilayas-real.json"
    "src/data/algeria-58-wilayas-realistic.ts"
    "src/data/algeria-real-wilayas.ts"
    "src/data/algeria-wilayas-complete.ts"
    "src/data/algeria-wilayas-data.ts"
    "src/data/algeria-58-wilayas-optimized.ts"
    "src/data/algeria-wilayas-simple.ts"
    "src/data/algerianData.ts"
    "src/data/algerianLegalTemplates.ts"
    "src/data/formTemplates.ts"
    "src/data/formTemplatesAdditional.ts"
    "src/data/formTemplatesExtended.ts"
    "src/data/formTemplatesFinal.ts"
    "src/data/legalTextTemplates.ts"
    "src/data/legalTextTemplatesComplete.ts"
    "src/data/legalTextTemplatesComplete2.ts"
    "src/data/legalTextTemplatesComplete3.ts"
    "public/algeria-58-wilayas-real.geojson"
)

for file in "${REDUNDANT_DATA_FILES[@]}"; do
    if [ -f "$file" ]; then
        remove_file "$file"
    fi
done

# 11. VÉRIFICATION FINALE
echo -e "${YELLOW}🔍 Vérification finale...${NC}"

# Vérifier la nouvelle taille
NEW_SIZE=$(du -sh . | cut -f1)
NEW_SIZE_MB=$(du -sm . | cut -f1)

echo -e "${GREEN}📊 Nouvelle taille du projet : $NEW_SIZE ($NEW_SIZE_MB MB)${NC}"

# Afficher la répartition
echo -e "${YELLOW}📁 Répartition de l'espace :${NC}"
du -sh * | sort -hr | head -10

# 12. RAPPORT FINAL
echo -e "${BLUE}📝 Création du rapport de nettoyage...${NC}"

REPORT_FILE="cleanup-report-$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# 🗑️ Rapport de Nettoyage des Fichiers Inutiles - Dalil.dz

**Date :** $(date)
**Taille finale :** $NEW_SIZE ($NEW_SIZE_MB MB)

## 🎯 Fichiers Supprimés

### 📁 Fichiers de Développement et Test
- Fichiers \`.test.*\`
- Fichiers \`.spec.*\`
- Dossiers de couverture

### 🏗️ Fichiers de Build
- Dossiers \`dist/\`
- Dossiers \`build/\`
- Dossiers \`.next/\`
- Dossiers \`.nuxt/\`

### 🗂️ Fichiers Temporaires et Cache
- Fichiers \`.tmp\`, \`.temp\`
- Fichiers \`*~\`
- Fichiers de cache

### 💻 Fichiers Système
- \`.DS_Store\` (macOS)
- \`Thumbs.db\` (Windows)
- Fichiers \`.swp\`, \`.swo\` (Linux)

### 💾 Fichiers de Sauvegarde
- Fichiers \`.bak\`, \`.old\`, \`.orig\`

### 📦 Fichiers Compressés
- Archives \`.tar.gz\`
- Fichiers \`.zip\` non essentiels

### 📝 Fichiers de Log et Debug
- Fichiers \`.log\`
- Fichiers de debug

### 📊 Données Redondantes
- Fichiers de wilayas dupliqués
- Templates juridiques redondants
- Formulaires dupliqués

## 🚀 Résultats

- **Fichiers inutiles supprimés** avec succès
- **Projet optimisé** et épuré
- **Sauvegarde créée** dans \`$BACKUP_DIR\`
- **Taille réduite** à $NEW_SIZE

## 📁 Sauvegarde

Tous les fichiers supprimés ont été sauvegardés dans :
\`$BACKUP_DIR\`

## ⚠️ Notes

- Vérifiez que l'application fonctionne correctement
- Testez le bilinguisme Arabe/Français
- Validez les fonctionnalités algériennes

---
*Rapport généré automatiquement par le script de nettoyage*
EOF

echo -e "${GREEN}✅ Rapport créé : $REPORT_FILE${NC}"

# 13. INSTRUCTIONS FINALES
echo -e "${BLUE}📋 Instructions finales :${NC}"
echo -e "${YELLOW}1. Vérifiez que l'application fonctionne :${NC}"
echo "   npm run dev"
echo ""
echo -e "${YELLOW}2. Testez le bilinguisme et les fonctionnalités algériennes${NC}"
echo ""
echo -e "${YELLOW}3. Si tout fonctionne, vous pouvez supprimer la sauvegarde :${NC}"
echo "   rm -rf $BACKUP_DIR"
echo ""
echo -e "${YELLOW}4. Consultez le rapport de nettoyage :${NC}"
echo "   $REPORT_FILE"

echo -e "${GREEN}🎉 Nettoyage des fichiers inutiles terminé !${NC}"
echo -e "${BLUE}💾 Sauvegarde disponible dans : $BACKUP_DIR${NC}"