import React from 'react';
import { useAlgerianI18n } from "@/hooks/useAlgerianI18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AlgerianText } from "@/components/algerian/AlgerianText";

interface EnhancedGovernmentHeaderProps {
  onLanguageChange?: (language: string) => void;
}

/**
 * Header gouvernemental unifié avec react-i18next
 * Support complet RTL et polices optimisées
 */
export function EnhancedGovernmentHeader({ onLanguageChange }: EnhancedGovernmentHeaderProps) {
  const { t, language, isRTL, getFontClass } = useAlgerianI18n();

  const republicNameAr = t('algerian.republicName');
  const republicNameFr = language === 'en' 
    ? "People's Democratic Republic of Algeria"
    : "République Algérienne Démocratique et Populaire";

  return (
    <header 
      className="text-white px-4 sm:px-6 py-2 language-transition" 
      style={{ backgroundColor: '#40915d' }}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Texte centré avec support RTL optimisé */}
          <div className="absolute left-0 right-0 flex justify-center items-center pointer-events-none">
            <div className="text-center max-w-4xl">
              <AlgerianText
                variant="legal"
                className="text-sm sm:text-base font-medium leading-tight text-center"
                as="div"
              >
                {language === 'ar' ? republicNameAr : republicNameFr}
              </AlgerianText>
              
              {language !== 'ar' && (
                <AlgerianText
                  variant="caption"
                  className="text-[9px] sm:text-[11px] font-normal opacity-90 mt-1 leading-tight tracking-[0.15em] text-center algerian-republic-text-banner"
                  as="div"
                >
                  {republicNameAr}
                </AlgerianText>
              )}
              
              {language === 'ar' && (
                <AlgerianText
                  variant="caption"
                  className="text-[9px] sm:text-[11px] font-normal opacity-90 mt-1 leading-tight tracking-[0.15em] text-center"
                  as="div"
                >
                  {republicNameFr}
                </AlgerianText>
              )}
            </div>
          </div>
          
          {/* Sélecteur de langue positionné selon la direction */}
          <div className={`hidden sm:block pointer-events-auto ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
            <LanguageSelector onLanguageChange={onLanguageChange} />
          </div>
        </div>
      </div>
    </header>
  );
}