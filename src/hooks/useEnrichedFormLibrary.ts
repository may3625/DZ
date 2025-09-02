import { useState, useEffect, useMemo } from 'react';
import { ENRICHED_FORM_TEMPLATES, EnrichedFormTemplate, getTemplatesByType } from '@/data/enrichedFormTemplates';
import { useFormLibraryStore } from '@/stores/formLibraryStore';
import { useAlgerianI18n } from '@/hooks/useAlgerianI18n';

export function useEnrichedFormLibrary() {
  const { language } = useAlgerianI18n();
  const { forms: customForms } = useFormLibraryStore();

  // Combiner les templates enrichis avec les formulaires personnalisés
  const allAvailableForms = useMemo(() => {
    // Convertir les formulaires personnalisés au format EnrichedFormTemplate
    const convertedCustomForms: EnrichedFormTemplate[] = customForms.map(form => ({
      ...form,
      translations: {
        [language]: {
          name: form.name,
          description: form.description,
          fields: form.fields.map(field => ({
            label: field.label,
            placeholder: field.placeholder,
            options: field.options
          }))
        }
      }
    }));

    return [...ENRICHED_FORM_TEMPLATES, ...convertedCustomForms];
  }, [customForms, language]);

  // Obtenir les formulaires par type avec traduction
  const getFormsByType = (type: string) => {
    return allAvailableForms
      .filter(form => form.type === type)
      .map(form => ({
        ...form,
        name: form.translations?.[language]?.name || form.name,
        description: form.translations?.[language]?.description || form.description,
        fields: form.fields.map((field, index) => ({
          ...field,
          label: form.translations?.[language]?.fields[index]?.label || field.label,
          placeholder: form.translations?.[language]?.fields[index]?.placeholder || field.placeholder,
          options: form.translations?.[language]?.fields[index]?.options || field.options
        }))
      }));
  };

  // Obtenir les types de textes juridiques disponibles
  const getLegalTextTypes = () => {
    return allAvailableForms
      .filter(form => form.type === 'textes_juridiques')
      .map(form => ({
        id: form.id,
        name: form.translations?.[language]?.name || form.name,
        code: form.name.includes('Loi') ? 'LOI' : 
              form.name.includes('Décret') ? 'DEC' : 
              form.name.includes('Arrêté') ? 'ARR' : 'OTHER',
        description: form.translations?.[language]?.description || form.description,
        category: form.category,
        template: form
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Obtenir les catégories de procédures disponibles
  const getProcedureCategories = () => {
    return allAvailableForms
      .filter(form => form.type === 'procedures_administratives')
      .map(form => ({
        id: form.id,
        name: form.translations?.[language]?.name || form.name,
        code: form.category || 'OTHER',
        description: form.translations?.[language]?.description || form.description,
        category: form.category,
        template: form
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Rechercher un formulaire par ID
  const getFormById = (id: string) => {
    const form = allAvailableForms.find(f => f.id === id);
    if (!form) return null;

    return {
      ...form,
      name: form.translations?.[language]?.name || form.name,
      description: form.translations?.[language]?.description || form.description,
      fields: form.fields.map((field, index) => ({
        ...field,
        label: form.translations?.[language]?.fields[index]?.label || field.label,
        placeholder: form.translations?.[language]?.fields[index]?.placeholder || field.placeholder,
        options: form.translations?.[language]?.fields[index]?.options || field.options
      }))
    };
  };

  // Obtenir les statistiques
  const getStats = () => {
    const legalTextsCount = allAvailableForms.filter(f => f.type === 'textes_juridiques').length;
    const proceduresCount = allAvailableForms.filter(f => f.type === 'procedures_administratives').length;
    const customFormsCount = customForms.length;
    const predefinedFormsCount = ENRICHED_FORM_TEMPLATES.length;

    return {
      totalForms: allAvailableForms.length,
      legalTextsCount,
      proceduresCount,
      customFormsCount,
      predefinedFormsCount,
      availableLanguages: ['fr', 'ar', 'en']
    };
  };

  // Fonction de recherche avancée
  const searchForms = (query: string, filters?: {
    type?: string;
    category?: string;
    legalDomain?: string;
    status?: string;
  }) => {
    let results = allAvailableForms;

    // Filtrage par requête de recherche
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(form => {
        const name = (form.translations?.[language]?.name || form.name).toLowerCase();
        const description = (form.translations?.[language]?.description || form.description).toLowerCase();
        return name.includes(searchTerm) || description.includes(searchTerm);
      });
    }

    // Filtrage par critères
    if (filters) {
      if (filters.type) {
        results = results.filter(form => form.type === filters.type);
      }
      if (filters.category) {
        results = results.filter(form => form.category === filters.category);
      }
      if (filters.legalDomain) {
        results = results.filter(form => form.legalDomain === filters.legalDomain);
      }
      if (filters.status) {
        results = results.filter(form => form.status === filters.status);
      }
    }

    return results.map(form => ({
      ...form,
      name: form.translations?.[language]?.name || form.name,
      description: form.translations?.[language]?.description || form.description
    }));
  };

  return {
    // Données
    allForms: allAvailableForms,
    
    // Fonctions de récupération
    getFormsByType,
    getLegalTextTypes,
    getProcedureCategories,
    getFormById,
    
    // Utilitaires
    searchForms,
    getStats,
    
    // Infos sur la langue actuelle
    currentLanguage: language
  };
}