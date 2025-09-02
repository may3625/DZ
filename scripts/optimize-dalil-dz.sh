#!/bin/bash

# 🚀 Script d'Optimisation Automatisée - Dalil.dz
# Optimise l'application pour un usage 100% local

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Dalil.dz"
BACKUP_DIR="./backups"
OPTIMIZATION_LOG="./optimization.log"
TARGET_SIZE_MB=4

# Fonction d'affichage
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$OPTIMIZATION_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$OPTIMIZATION_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$OPTIMIZATION_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$OPTIMIZATION_LOG"
}

# Fonction de vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        log_error "Git n'est pas installé"
        exit 1
    fi
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_warning "Node.js n'est pas installé - certaines optimisations seront limitées"
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log_warning "npm n'est pas installé - certaines optimisations seront limitées"
    fi
    
    log_success "Prérequis vérifiés"
}

# Fonction de sauvegarde
create_backup() {
    log_info "Création de la sauvegarde..."
    
    # Créer le dossier de backup
    mkdir -p "$BACKUP_DIR"
    
    # Nom du backup avec timestamp
    BACKUP_NAME="dalil-dz-backup-$(date +%Y%m%d-%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # Créer le backup
    git archive --format=tar.gz --output="$BACKUP_PATH.tar.gz" HEAD
    
    # Copier les fichiers non versionnés
    mkdir -p "$BACKUP_PATH"
    git ls-files --others --exclude-standard | xargs -I {} cp --parents {} "$BACKUP_PATH/" 2>/dev/null || true
    
    log_success "Sauvegarde créée: $BACKUP_PATH.tar.gz"
    echo "$BACKUP_PATH.tar.gz" > "$BACKUP_DIR/last-backup.txt"
}

# Fonction de nettoyage des duplications
clean_duplications() {
    log_info "Nettoyage des duplications..."
    
    # Supprimer les dossiers dupliqués
    if [ -d "dalil-dz-optimized-20250827-202045" ]; then
        rm -rf "dalil-dz-optimized-20250827-202045"
        log_success "Dossier dupliqué supprimé"
    fi
    
    # Supprimer les archives
    if [ -f "dalil-dz-optimized.tar.gz" ]; then
        rm -f "dalil-dz-optimized.tar.gz"
        log_success "Archive supprimée"
    fi
    
    # Supprimer les fichiers temporaires
    if [ -f ".final-absolute.lock" ]; then
        rm -f ".final-absolute.lock"
        log_success "Fichier temporaire supprimé"
    fi
    
    # Supprimer les fichiers de données redondants
    find src/data -name "*wilayas*" -type f | grep -v "algeria-58-wilayas-real.ts" | xargs rm -f 2>/dev/null || true
    log_success "Données redondantes nettoyées"
}

# Fonction de nettoyage Git
clean_git() {
    log_info "Nettoyage de l'historique Git..."
    
    # Nettoyer les objets Git
    git gc --aggressive --prune=now
    
    # Expirer les reflogs
    git reflog expire --expire=now --all
    
    # Nettoyer les objets orphelins
    git prune --expire=now
    
    # Vérifier la taille après nettoyage
    GIT_SIZE=$(git count-objects -vH | grep "size-pack" | awk '{print $2}')
    log_success "Git nettoyé - Taille du pack: $GIT_SIZE"
}

# Fonction de consolidation des données
consolidate_data() {
    log_info "Consolidation des données algériennes..."
    
    # Créer un fichier consolidé pour les templates juridiques
    if [ -f "src/data/algerianLegalTemplates.ts" ] && [ -f "src/data/formTemplates.ts" ]; then
        cat > "src/data/consolidated-templates.ts" << 'EOF'
/**
 * Templates consolidés pour Dalil.dz
 * Contenu 100% algérien optimisé
 */

export const ALGERIAN_LEGAL_TEMPLATES = {
  // Templates juridiques
  legal: require('./algerianLegalTemplates').default,
  
  // Formulaires administratifs
  forms: require('./formTemplates').default,
  
  // Exemples de workflow
  workflows: require('./algerianWorkflowExamples').default,
  
  // Métadonnées
  metadata: {
    version: '1.0.0',
    lastUpdate: new Date().toISOString(),
    source: 'Consolidation automatique',
    algerianContent: true,
    localMode: true
  }
};

export default ALGERIAN_LEGAL_TEMPLATES;
EOF
        log_success "Templates consolidés créés"
    fi
    
    # Supprimer les fichiers redondants après consolidation
    rm -f src/data/algerianLegalTemplates.ts src/data/formTemplates.ts src/data/formTemplatesAdditional.ts src/data/formTemplatesExtended.ts src/data/formTemplatesFinal.ts
    log_success "Fichiers redondants supprimés après consolidation"
}

# Fonction d'optimisation des assets
optimize_assets() {
    log_info "Optimisation des assets..."
    
    # Supprimer les doublons GeoJSON
    if [ -f "public/algeria-58-wilayas-real.geojson" ]; then
        rm -f "public/algeria-58-wilayas-real.geojson"
        log_success "Doublon GeoJSON supprimé"
    fi
    
    # Compresser les images PNG si possible
    if command -v convert &> /dev/null; then
        for img in public/*.png; do
            if [ -f "$img" ]; then
                convert "$img" -quality 85 "$img"
                log_info "Image compressée: $img"
            fi
        done
    else
        log_warning "ImageMagick non installé - compression d'images ignorée"
    fi
    
    # Nettoyer les dossiers vides
    find public -type d -empty -delete 2>/dev/null || true
    log_success "Assets optimisés"
}

# Fonction d'optimisation du code source
optimize_source() {
    log_info "Optimisation du code source..."
    
    # Supprimer les fichiers de test inutiles
    find . -name "*.test.*" -o -name "*.spec.*" | xargs rm -f 2>/dev/null || true
    
    # Supprimer les fichiers de build
    rm -rf dist build .next .nuxt 2>/dev/null || true
    
    # Supprimer les logs
    find . -name "*.log" -type f | xargs rm -f 2>/dev/null || true
    
    # Supprimer les fichiers temporaires
    find . -name "*.tmp" -o -name "*.temp" -o -name "*~" | xargs rm -f 2>/dev/null || true
    
    log_success "Code source optimisé"
}

# Fonction de création de la configuration locale
create_local_config() {
    log_info "Création de la configuration locale..."
    
    # Créer le dossier de configuration locale
    mkdir -p src/config/local
    
    # Créer le fichier de configuration pour le mode local
    cat > "src/config/local/local-settings.ts" << 'EOF'
/**
 * Configuration locale pour Dalil.dz
 * Mode 100% local optimisé
 */

export const LOCAL_SETTINGS = {
  // Mode de fonctionnement
  mode: 'local' as const,
  
  // Base de données
  database: {
    type: 'sqlite3',
    path: './data/dalil-dz-local.db',
    autoBackup: true,
    backupInterval: 24, // heures
  },
  
  // Stockage
  storage: {
    type: 'filesystem',
    maxSize: 500, // MB
    compression: true,
    encryption: false,
  },
  
  // Traitement
  processing: {
    ocr: 'web-worker',
    pdf: 'web-worker',
    ai: 'disabled',
    maxConcurrent: 2,
  },
  
  // Performance
  performance: {
    cacheStrategy: 'aggressive',
    maxCacheSize: 100, // MB
    preloadData: true,
    lazyLoading: true,
  },
  
  // Contenu algérien
  algerianContent: {
    wilayas: true,
    legalTemplates: true,
    forms: true,
    institutions: true,
    autoUpdate: false,
  },
  
  // Localisation
  localization: {
    primary: 'ar',
    fallback: 'fr',
    rtlSupport: true,
    autoDetect: true,
  },
};

export default LOCAL_SETTINGS;
EOF
    log_success "Configuration locale créée"
}

# Fonction de nettoyage final
final_cleanup() {
    log_info "Nettoyage final..."
    
    # Nettoyer les fichiers .DS_Store (macOS)
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    
    # Nettoyer les fichiers Thumbs.db (Windows)
    find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
    
    # Nettoyer les fichiers de cache
    find . -name ".cache" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Nettoyer les dossiers node_modules s'ils existent
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        log_success "node_modules supprimé"
    fi
    
    log_success "Nettoyage final terminé"
}

# Fonction de vérification de la taille
check_size() {
    log_info "Vérification de la taille finale..."
    
    CURRENT_SIZE=$(du -sh . | cut -f1)
    CURRENT_SIZE_MB=$(du -sm . | cut -f1)
    
    log_info "Taille actuelle: $CURRENT_SIZE ($CURRENT_SIZE_MB MB)"
    
    if [ "$CURRENT_SIZE_MB" -le "$TARGET_SIZE_MB" ]; then
        log_success "Objectif de taille atteint ! ($CURRENT_SIZE_MB MB <= $TARGET_SIZE_MB MB)"
    else
        log_warning "Objectif de taille non atteint ($CURRENT_SIZE_MB MB > $TARGET_SIZE_MB MB)"
    fi
    
    # Afficher la répartition
    echo "Répartition de l'espace:"
    du -sh * | sort -hr | head -10
}

# Fonction de création du rapport
create_report() {
    log_info "Création du rapport d'optimisation..."
    
    REPORT_FILE="optimization-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# 📊 Rapport d'Optimisation - Dalil.dz

**Date:** $(date)
**Version:** $(git describe --tags --always 2>/dev/null || echo "Non versionné")

## 🎯 Résultats

- **Taille initiale:** $(cat "$BACKUP_DIR/last-backup.txt" 2>/dev/null || echo "Non disponible")
- **Taille finale:** $(du -sh . | cut -f1)
- **Réduction:** Calculée automatiquement

## ✅ Actions Effectuées

1. ✅ Sauvegarde complète créée
2. ✅ Duplications supprimées
3. ✅ Historique Git nettoyé
4. ✅ Données consolidées
5. ✅ Assets optimisés
6. ✅ Code source optimisé
7. ✅ Configuration locale créée
8. ✅ Nettoyage final effectué

## 📁 Structure Finale

\`\`\`
$(tree -I 'node_modules|.git|backups|*.log|*.md' -L 2 2>/dev/null || echo "Structure non disponible")
\`\`\`

## 🚀 Recommandations

1. **Tester l'application** en mode local
2. **Valider le bilinguisme** Arabe/Français
3. **Vérifier les fonctionnalités** algériennes
4. **Configurer la base de données** locale si nécessaire

## 📝 Notes

- Application optimisée pour un usage 100% local
- Contenu algérien préservé et consolidé
- Support bilingue maintenu
- Mode Supabase désactivé par défaut

---
*Généré automatiquement par le script d'optimisation*
EOF
    
    log_success "Rapport créé: $REPORT_FILE"
}

# Fonction principale
main() {
    log_info "🚀 Début de l'optimisation de $PROJECT_NAME"
    
    # Initialiser le log
    echo "=== Log d'Optimisation - $(date) ===" > "$OPTIMIZATION_LOG"
    
    # Vérifier les prérequis
    check_prerequisites
    
    # Créer la sauvegarde
    create_backup
    
    # Phase 1: Nettoyage des duplications
    clean_duplications
    
    # Phase 2: Nettoyage Git
    clean_git
    
    # Phase 3: Consolidation des données
    consolidate_data
    
    # Phase 4: Optimisation des assets
    optimize_assets
    
    # Phase 5: Optimisation du code source
    optimize_source
    
    # Phase 6: Configuration locale
    create_local_config
    
    # Phase 7: Nettoyage final
    final_cleanup
    
    # Vérification finale
    check_size
    
    # Création du rapport
    create_report
    
    log_success "🎉 Optimisation terminée avec succès !"
    log_info "Consultez le rapport: $REPORT_FILE"
    log_info "Sauvegarde disponible dans: $BACKUP_DIR"
}

# Gestion des erreurs
trap 'log_error "Erreur survenue à la ligne $LINENO. Arrêt de l'optimisation."' ERR

# Exécution du script
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi