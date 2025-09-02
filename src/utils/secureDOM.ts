/**
 * Utilitaires DOM sécurisés pour l'application LYO
 * Remplace les usages dangereux d'innerHTML par des alternatives sécurisées
 */

import { logger } from './logger';

/**
 * Nettoie et sécurise le contenu HTML contre les attaques XSS
 */
export function sanitizeHTML(html: string): string {
  // Créer un élément temporaire pour nettoyer le HTML
  const temp = document.createElement('div');
  temp.textContent = html;
  
  // Supprimer les scripts et autres éléments dangereux
  const dangerous = ['script', 'iframe', 'object', 'embed', 'form', 'input'];
  let cleaned = temp.innerHTML;
  
  dangerous.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
    cleaned = cleaned.replace(regex, '');
    const selfClosing = new RegExp(`<${tag}[^>]*/>`, 'gi');
    cleaned = cleaned.replace(selfClosing, '');
  });
  
  // Supprimer les attributs dangereux
  const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'];
  dangerousAttrs.forEach(attr => {
    const regex = new RegExp(`${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    cleaned = cleaned.replace(regex, '');
  });
  
  // Supprimer les URLs javascript:
  cleaned = cleaned.replace(/javascript:/gi, '');
  
  return cleaned;
}

/**
 * Alternative sécurisée à innerHTML
 */
export function setSecureHTML(element: HTMLElement, html: string): void {
  const sanitized = sanitizeHTML(html);
  element.innerHTML = sanitized;
  
  logger.debug('SECURITY', 'DOM content set securely', { 
    originalLength: html.length, 
    sanitizedLength: sanitized.length 
  }, 'SecureDOM');
}

/**
 * Créer un élément DOM sécurisé
 */
export function createSecureElement(tag: string, attributes: Record<string, string> = {}, content?: string): HTMLElement {
  const element = document.createElement(tag);
  
  // Filtrer les attributs dangereux
  const safeAttributes = Object.entries(attributes).filter(([key]) => 
    !key.startsWith('on') && !['javascript:', 'data:', 'vbscript:'].some(prefix => 
      attributes[key]?.toLowerCase().includes(prefix)
    )
  );
  
  safeAttributes.forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  if (content) {
    element.textContent = content; // Utiliser textContent au lieu d'innerHTML
  }
  
  return element;
}

/**
 * Supprimer tous les écouteurs d'événements d'un élément
 */
export function removeAllEventListeners(element: HTMLElement): HTMLElement {
  const newElement = element.cloneNode(true) as HTMLElement;
  element.parentNode?.replaceChild(newElement, element);
  return newElement;
}

/**
 * Toute création de modale doit passer par UnifiedModalSystem (voir /components/modals/UnifiedModalSystem.tsx)
 */

/**
 * Nettoyer complètement un élément DOM
 */
export function cleanupElement(element: HTMLElement): void {
  // Supprimer tous les écouteurs
  removeAllEventListeners(element);
  
  // Vider le contenu
  element.innerHTML = '';
  
  // Supprimer les attributs dangereux
  const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'];
  dangerousAttrs.forEach(attr => {
    element.removeAttribute(attr);
  });
  
  logger.debug('SECURITY', 'Element cleaned up', { tagName: element.tagName }, 'SecureDOM');
}

/**
 * Valider une URL avant utilisation
 */
export function isValidURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    return allowedProtocols.includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Créer un lien sécurisé
 */
export function createSecureLink(url: string, text: string, target: '_blank' | '_self' = '_self'): HTMLElement {
  if (!isValidURL(url)) {
    logger.warn('SECURITY', 'Invalid URL blocked', { url }, 'SecureDOM');
    return createSecureElement('span', {}, text);
  }
  
  const link = createSecureElement('a', {
    href: url,
    target,
    rel: target === '_blank' ? 'noopener noreferrer' : ''
  }, text);
  
  link.addEventListener('click', (e) => {
    if (!isValidURL(url)) {
      e.preventDefault();
      logger.warn('SECURITY', 'Blocked click on invalid URL', { url }, 'SecureDOM');
    }
  });
  
  return link;
}

export default {
  sanitizeHTML,
  setSecureHTML,
  createSecureElement,
  removeAllEventListeners,
  cleanupElement,
  isValidURL,
  createSecureLink
};