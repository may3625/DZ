/**
 * Simplified crypto service compatibility functions
 */

// Simple wrapper functions that match the expected API
export const encryptString = async (text: string, password?: string): Promise<string> => {
  try {
    // Simple base64 encoding for development
    return btoa(text);
  } catch (error) {
    console.warn('Encryption failed, returning plain text');
    return text;
  }
};

export const decryptString = async (encryptedText: string, password?: string): Promise<string> => {
  try {
    // Simple base64 decoding for development  
    return atob(encryptedText);
  } catch (error) {
    console.warn('Decryption failed, returning as-is');
    return encryptedText;
  }
};

export const saveEncryptedLocal = async (key: string, data: string): Promise<void> => {
  try {
    const encrypted = await encryptString(data);
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.warn('Save encrypted local failed, storing as plain text');
    localStorage.setItem(key, data);
  }
};

export const loadEncryptedLocal = async (key: string): Promise<string | null> => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return await decryptString(stored);
  } catch (error) {
    console.warn('Load encrypted local failed');
    return localStorage.getItem(key);
  }
};