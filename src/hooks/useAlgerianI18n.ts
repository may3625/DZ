import { useTranslation } from 'react-i18next';
import { useRTL } from '@/components/algerian/RTLProvider';
import { useEffect } from 'react';

/**
 * Hook unifié pour la gestion de l'internationalisation algérienne
 * Combine react-i18next avec le système RTL et les fonctionnalités spécialisées
 */
export function useAlgerianI18n() {
  const { t, i18n } = useTranslation();
  const { isRTL, language, setLanguage } = useRTL();

  // Synchroniser i18n avec RTLProvider
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Fonction helper pour les traductions avec fallback
  const getText = (key: string, options?: any): string => {
    try {
      const translation = t(key, options);
      return typeof translation === 'string' ? translation : key;
    } catch (error) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
  };

  // Fonction pour obtenir la classe de police appropriée
  const getFontClass = () => {
    switch (language) {
      case 'ar':
        return 'font-arabic';
      case 'fr':
        return 'font-french';
      case 'en':
        return 'font-mixed';
      default:
        return 'font-mixed';
    }
  };

  // Fonction pour obtenir la direction du texte
  const getTextDirection = () => isRTL ? 'rtl' : 'ltr';

  // Fonction pour obtenir les classes CSS RTL appropriées
  const getRTLClasses = (baseClasses: string) => {
    const classes = baseClasses.split(' ');
    return classes.map(cls => {
      if (isRTL) {
        // Remplacer les classes de marge/padding pour RTL
        if (cls.startsWith('ml-')) return cls.replace('ml-', 'mr-');
        if (cls.startsWith('mr-')) return cls.replace('mr-', 'ml-');
        if (cls.startsWith('pl-')) return cls.replace('pl-', 'pr-');
        if (cls.startsWith('pr-')) return cls.replace('pr-', 'pl-');
        if (cls === 'text-left') return 'text-right';
        if (cls === 'text-right') return 'text-left';
      }
      return cls;
    }).join(' ');
  };

  // Fonction pour formater les dates selon la locale
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    const locale = language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US';
    return new Intl.DateTimeFormat(locale, options).format(date);
  };

  // Fonction pour formater les nombres selon la locale
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    const locale = language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(number);
  };

  // Fonction pour obtenir la terminologie officielle algérienne
  const getOfficialTerm = (term: string): string => {
    return getText(`algerian.officialTerminology.${term}`) || term;
  };

  // Fonction pour obtenir les catégories juridiques
  const getLegalCategory = (category: string): string => {
    return getText(`legal.categories.${category}`) || category;
  };

  // Fonction pour obtenir les termes juridiques spécialisés
  const getSpecializedTerm = (term: string): string => {
    return getText(`legal.specializedTerms.${term}`) || term;
  };

  return {
    // Fonctions de base
    t: getText,
    i18n,
    language,
    isRTL,
    setLanguage,
    
    // Utilitaires CSS/RTL
    getFontClass,
    getTextDirection,
    getRTLClasses,
    
    // Formatage
    formatDate,
    formatNumber,
    
    // Terminologie algérienne spécialisée
    getOfficialTerm,
    getLegalCategory,
    getSpecializedTerm,
    
    // Sections spécialisées
    dashboard: {
      welcome: () => getText('dashboard.welcome'),
      subtitle: () => getText('dashboard.subtitle'),
      aiAssistant: () => getText('dashboard.aiAssistant'),
      aiDescription: () => getText('dashboard.aiDescription'),
    },
    
    common: {
      search: () => getText('common.search'),
      filter: () => getText('common.filter'),
      save: () => getText('common.save'),
      cancel: () => getText('common.cancel'),
      loading: () => getText('common.loading'),
      error: () => getText('common.error'),
      success: () => getText('common.success'),
    }
  };
}