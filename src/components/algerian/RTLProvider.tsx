import React, { createContext, useContext, useEffect, useState } from 'react';

interface RTLContextType {
  isRTL: boolean;
  toggleRTL: () => void;
  language: 'ar' | 'fr' | 'en';
  setLanguage: (lang: 'ar' | 'fr' | 'en') => void;
}

const RTLContext = createContext<RTLContextType | undefined>(undefined);

export function RTLProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'ar' | 'fr' | 'en'>('fr');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('dalil-language') as 'ar' | 'fr' | 'en';
    if (savedLanguage) {
      setLanguage(savedLanguage);
      setIsRTL(savedLanguage === 'ar');
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('dalil-language', language);
  }, [isRTL, language]);

  const toggleRTL = () => {
    setIsRTL(!isRTL);
    setLanguage(isRTL ? 'fr' : 'ar');
  };

  const handleSetLanguage = (lang: 'ar' | 'fr' | 'en') => {
    setLanguage(lang);
    setIsRTL(lang === 'ar');
  };

  return (
    <RTLContext.Provider value={{
      isRTL,
      toggleRTL,
      language,
      setLanguage: handleSetLanguage
    }}>
      {children}
    </RTLContext.Provider>
  );
}

export function useRTL() {
  const context = useContext(RTLContext);
  if (!context) {
    throw new Error('useRTL must be used within RTLProvider');
  }
  return context;
}