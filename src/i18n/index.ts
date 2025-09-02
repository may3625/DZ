import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

// Configure i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar }
    },
    lng: 'fr', // Default language
    fallbackLng: 'fr',
    debug: false,
    
    detection: {
      order: ['localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'dalil-language',
      lookupSessionStorage: 'dalil-language',
      caches: ['localStorage', 'sessionStorage'],
      excludeCacheFor: ['cimode'],
    },

    interpolation: {
      escapeValue: false
    },

    react: {
      useSuspense: true,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em'],
    }
  });

// Handle RTL support
i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'ar';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  
  // Dispatch custom event for RTL changes
  window.dispatchEvent(new CustomEvent('language-changed', { 
    detail: { language: lng, isRTL } 
  }));
});

export default i18n;