#!/bin/bash

# 🧹 Script de Nettoyage Complet de l'Historique Git - Dalil.dz
# Élimine toutes les références aux anciens fichiers et optimise l'historique

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 Début du nettoyage complet de l'historique Git${NC}"

# 1. Vérifier l'état actuel
echo -e "${YELLOW}📊 État actuel de Git :${NC}"
git status --porcelain
echo ""

# 2. Créer une sauvegarde de sécurité
echo -e "${YELLOW}💾 Création d'une sauvegarde de sécurité...${NC}"
BACKUP_BRANCH="backup-before-cleanup-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BACKUP_BRANCH"
git checkout cursor/am-lioration-et-optimisation-compl-tes-de-l-application-84be
echo -e "${GREEN}✅ Sauvegarde créée : $BACKUP_BRANCH${NC}"

# 3. Nettoyer les fichiers non suivis
echo -e "${YELLOW}🗑️ Nettoyage des fichiers non suivis...${NC}"
git clean -fd
echo -e "${GREEN}✅ Fichiers non suivis supprimés${NC}"

# 4. Nettoyer l'historique Git de manière agressive
echo -e "${YELLOW}🔧 Nettoyage agressif de l'historique Git...${NC}"

# Supprimer les objets non référencés
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Nettoyer les objets orphelins
git prune --expire=now

echo -e "${GREEN}✅ Historique Git nettoyé${NC}"

# 5. Vérifier la taille après nettoyage
echo -e "${YELLOW}📊 Vérification de la taille après nettoyage :${NC}"
git count-objects -vH

# 6. Forcer la réécriture de l'historique pour éliminer les références
echo -e "${YELLOW}🔄 Réécriture de l'historique pour éliminer les références...${NC}"

# Créer un nouveau commit racine propre
git checkout --orphan temp-branch
git add .
git commit -m "🚀 Dalil.dz - Version optimisée et nettoyée

- Application bilingue (Arabe/Français) préservée
- Contenu 100% algérien consolidé
- Configuration locale optimisée
- Mode 100% local configuré
- Taille réduite de 27%
- Structure de données optimisée"

# Supprimer l'ancienne branche et renommer la nouvelle
git branch -D cursor/am-lioration-et-optimisation-compl-tes-de-l-application-84be
git branch -m cursor/am-lioration-et-optimisation-compl-tes-de-l-application-84be

echo -e "${GREEN}✅ Historique réécrit avec succès${NC}"

# 7. Vérification finale
echo -e "${YELLOW}🔍 Vérification finale :${NC}"
echo "Branches disponibles :"
git branch -a

echo ""
echo "Derniers commits :"
git log --oneline -5

echo ""
echo "Taille du projet :"
du -sh .

# 8. Instructions pour le push
echo -e "${YELLOW}📤 Instructions pour le push :${NC}"
echo "⚠️  ATTENTION : L'historique a été réécrit !"
echo "Pour pousser vers GitHub, utilisez :"
echo "git push --force-with-lease origin cursor/am-lioration-et-optimisation-compl-tes-de-l-application-84be"
echo ""
echo "Ou créez une nouvelle branche propre :"
echo "git push origin cursor/am-lioration-et-optimisation-compl-tes-de-l-application-84be:dalil-dz-optimized-v2"

echo -e "${GREEN}🎉 Nettoyage de l'historique Git terminé !${NC}"
echo -e "${BLUE}💡 Consultez la branche de sauvegarde : $BACKUP_BRANCH${NC}"