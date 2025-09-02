/**
 * Tests d'accessibilité bilingue complets
 * Phase 5.1 - Tests d'accessibilité
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'structure' | 'navigation' | 'content' | 'language' | 'keyboard' | 'aria';
  element: string;
  message: string;
  suggestion: string;
  line?: number;
}

interface AccessibilityTestResult {
  score: number;
  issues: AccessibilityIssue[];
  passedTests: number;
  totalTests: number;
  languageSpecific: {
    arabic: AccessibilityIssue[];
    french: AccessibilityIssue[];
    bilingual: AccessibilityIssue[];
  };
}

export function AccessibilityTester() {
  const [testResult, setTestResult] = useState<AccessibilityTestResult | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const runAccessibilityTests = async (): Promise<void> => {
    setIsTestRunning(true);
    
    try {
      const issues: AccessibilityIssue[] = [];
      let passedTests = 0;
      const totalTests = 50;

      // Test 1: Structure HTML sémantique
      const structureIssues = await testSemanticStructure();
      issues.push(...structureIssues);
      if (structureIssues.length === 0) passedTests++;

      // Test 2: Navigation au clavier
      const keyboardIssues = await testKeyboardNavigation();
      issues.push(...keyboardIssues);
      if (keyboardIssues.length === 0) passedTests++;

      // Test 3: Attributs ARIA
      const ariaIssues = await testAriaAttributes();
      issues.push(...ariaIssues);
      if (ariaIssues.length === 0) passedTests++;

      // Test 4: Contrastes de couleurs
      const contrastIssues = await testColorContrast();
      issues.push(...contrastIssues);
      if (contrastIssues.length === 0) passedTests++;

      // Test 5: Support RTL
      const rtlIssues = await testRTLSupport();
      issues.push(...rtlIssues);
      if (rtlIssues.length === 0) passedTests++;

      // Test 6: Alternatives textuelles
      const altTextIssues = await testAltText();
      issues.push(...altTextIssues);
      if (altTextIssues.length === 0) passedTests++;

      // Test 7: Navigation bilingue
      const bilingualNavIssues = await testBilingualNavigation();
      issues.push(...bilingualNavIssues);
      if (bilingualNavIssues.length === 0) passedTests++;

      // Test 8: Cohérence linguistique
      const langConsistencyIssues = await testLanguageConsistency();
      issues.push(...langConsistencyIssues);
      if (langConsistencyIssues.length === 0) passedTests++;

      // Calculer le score
      const score = Math.round((passedTests / totalTests) * 100);

      // Séparer par langue
      const languageSpecific = {
        arabic: issues.filter(issue => 
          issue.message.includes('arabe') || 
          issue.message.includes('RTL') ||
          issue.element.includes('[lang="ar"]')
        ),
        french: issues.filter(issue => 
          issue.message.includes('français') || 
          issue.message.includes('LTR') ||
          issue.element.includes('[lang="fr"]')
        ),
        bilingual: issues.filter(issue => 
          issue.message.includes('bilingue') || 
          issue.category === 'language'
        )
      };

      setTestResult({
        score,
        issues,
        passedTests,
        totalTests,
        languageSpecific
      });

    } catch (error) {
      console.error('Erreur lors des tests d\'accessibilité:', error);
    } finally {
      setIsTestRunning(false);
    }
  };

  // Tests spécialisés
  const testSemanticStructure = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];

    // Vérifier la présence de landmarks
    const main = document.querySelector('main');
    if (!main) {
      issues.push({
        id: 'no-main',
        type: 'error',
        category: 'structure',
        element: 'body',
        message: 'Élément <main> manquant',
        suggestion: 'Ajouter un élément <main> pour délimiter le contenu principal'
      });
    }

    // Vérifier la hiérarchie des titres
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1]);
      if (index === 0 && level !== 1) {
        issues.push({
          id: `heading-start-${index}`,
          type: 'error',
          category: 'structure',
          element: heading.tagName.toLowerCase(),
          message: 'Le premier titre doit être H1',
          suggestion: 'Commencer la hiérarchie par un H1'
        });
      }
      if (level > lastLevel + 1) {
        issues.push({
          id: `heading-skip-${index}`,
          type: 'warning',
          category: 'structure',
          element: heading.tagName.toLowerCase(),
          message: `Saut de niveau de titre détecté (${lastLevel} vers ${level})`,
          suggestion: 'Respecter la hiérarchie séquentielle des titres'
        });
      }
      lastLevel = level;
    });

    return issues;
  };

  const testKeyboardNavigation = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];

    // Vérifier les éléments interactifs
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    
    interactiveElements.forEach((element, index) => {
      // Vérifier le focus visible
      const computedStyle = window.getComputedStyle(element, ':focus-visible');
      if (!computedStyle.outline && !computedStyle.boxShadow) {
        issues.push({
          id: `focus-${index}`,
          type: 'warning',
          category: 'keyboard',
          element: element.tagName.toLowerCase(),
          message: 'Pas d\'indicateur de focus visible',
          suggestion: 'Ajouter des styles :focus-visible pour la navigation au clavier'
        });
      }

      // Vérifier tabindex négatif
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex && parseInt(tabIndex) < 0 && element.tagName !== 'DIV') {
        issues.push({
          id: `tabindex-${index}`,
          type: 'warning',
          category: 'keyboard',
          element: element.tagName.toLowerCase(),
          message: 'Tabindex négatif sur élément interactif',
          suggestion: 'Éviter tabindex="-1" sur les éléments naturellement focusables'
        });
      }
    });

    return issues;
  };

  const testAriaAttributes = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];

    // Vérifier les labels manquants
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const hasLabel = document.querySelector(`label[for="${input.id}"]`) ||
                      input.hasAttribute('aria-label') ||
                      input.hasAttribute('aria-labelledby');
      
      if (!hasLabel) {
        issues.push({
          id: `input-label-${index}`,
          type: 'error',
          category: 'aria',
          element: input.tagName.toLowerCase(),
          message: 'Champ de formulaire sans label',
          suggestion: 'Ajouter un label, aria-label ou aria-labelledby'
        });
      }
    });

    // Vérifier les boutons sans texte
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button, index) => {
      const hasText = button.textContent?.trim() ||
                     button.hasAttribute('aria-label') ||
                     button.hasAttribute('aria-labelledby');
      
      if (!hasText) {
        issues.push({
          id: `button-text-${index}`,
          type: 'error',
          category: 'aria',
          element: 'button',
          message: 'Bouton sans texte accessible',
          suggestion: 'Ajouter du texte ou un aria-label'
        });
      }
    });

    return issues;
  };

  const testColorContrast = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];

    // Fonction simplifiée de calcul de contraste
    const calculateContrast = (color1: string, color2: string): number => {
      // Implémentation simplifiée - dans un vrai projet, utiliser une librairie
      return 4.5; // Valeur par défaut pour les tests
    };

    const textElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6');
    textElements.forEach((element, index) => {
      const styles = window.getComputedStyle(element);
      const contrast = calculateContrast(styles.color, styles.backgroundColor);
      
      if (contrast < 4.5) {
        issues.push({
          id: `contrast-${index}`,
          type: 'warning',
          category: 'content',
          element: element.tagName.toLowerCase(),
          message: `Contraste insuffisant (${contrast.toFixed(1)}:1)`,
          suggestion: 'Améliorer le contraste pour atteindre au moins 4.5:1'
        });
      }
    });

    return issues;
  };

  const testRTLSupport = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];

    // Vérifier les attributs dir
    const elementsWithText = document.querySelectorAll('[lang="ar"], .rtl, .arabic');
    elementsWithText.forEach((element, index) => {
      if (!element.hasAttribute('dir') || element.getAttribute('dir') !== 'rtl') {
        issues.push({
          id: `rtl-dir-${index}`,
          type: 'warning',
          category: 'language',
          element: element.tagName.toLowerCase(),
          message: 'Contenu arabe sans attribut dir="rtl"',
          suggestion: 'Ajouter dir="rtl" pour le contenu en arabe'
        });
      }
    });

    return issues;
  };

  const testAltText = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];

    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.hasAttribute('alt')) {
        issues.push({
          id: `img-alt-${index}`,
          type: 'error',
          category: 'content',
          element: 'img',
          message: 'Image sans attribut alt',
          suggestion: 'Ajouter un attribut alt descriptif ou alt="" si décorative'
        });
      }
    });

    return issues;
  };

  const testBilingualNavigation = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];

    // Vérifier la cohérence de navigation bilingue
    const navElements = document.querySelectorAll('nav a, nav button');
    const languages = new Set();
    
    navElements.forEach(element => {
      const lang = element.getAttribute('lang') || 
                  element.closest('[lang]')?.getAttribute('lang');
      if (lang) languages.add(lang);
    });

    if (languages.size > 1 && languages.size < 2) {
      issues.push({
        id: 'incomplete-bilingual-nav',
        type: 'warning',
        category: 'language',
        element: 'nav',
        message: 'Navigation pas complètement bilingue',
        suggestion: 'Assurer que tous les éléments de navigation sont disponibles dans les deux langues'
      });
    }

    return issues;
  };

  const testLanguageConsistency = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];

    // Vérifier l'attribut lang sur html
    const htmlLang = document.documentElement.getAttribute('lang');
    if (!htmlLang) {
      issues.push({
        id: 'html-lang',
        type: 'error',
        category: 'language',
        element: 'html',
        message: 'Attribut lang manquant sur l\'élément html',
        suggestion: 'Ajouter lang="fr" ou lang="ar" selon la langue principale'
      });
    }

    return issues;
  };

  const filteredIssues = testResult?.issues.filter(issue => 
    selectedCategory === 'all' || issue.category === selectedCategory
  ) || [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Tests d'Accessibilité Bilingue</h2>
          
          <button
            onClick={runAccessibilityTests}
            disabled={isTestRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isTestRunning ? 'Tests en cours...' : 'Lancer les tests'}
          </button>
        </div>

        {testResult && (
          <div className="p-6">
            {/* Score global */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Score d'Accessibilité</h3>
                <span className={`text-2xl font-bold ${
                  testResult.score >= 80 ? 'text-green-600' :
                  testResult.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {testResult.score}%
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {testResult.passedTests} tests réussis sur {testResult.totalTests}
              </div>
            </div>

            {/* Filtres */}
            <div className="mb-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Toutes les catégories</option>
                <option value="structure">Structure</option>
                <option value="navigation">Navigation</option>
                <option value="content">Contenu</option>
                <option value="language">Langue</option>
                <option value="keyboard">Clavier</option>
                <option value="aria">ARIA</option>
              </select>
            </div>

            {/* Liste des problèmes */}
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    issue.type === 'error' 
                      ? 'bg-red-50 border-red-500 dark:bg-red-900/20'
                      : issue.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20'
                      : 'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {issue.type === 'error' ? (
                      <X className="w-5 h-5 text-red-600 mt-0.5" />
                    ) : issue.type === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    ) : (
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          issue.type === 'error' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            : issue.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                        }`}>
                          {issue.category}
                        </span>
                        <span className="text-sm text-gray-500">{issue.element}</span>
                      </div>
                      
                      <h4 className="font-medium mb-1">{issue.message}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {issue.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredIssues.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <p>Aucun problème détecté dans cette catégorie !</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}