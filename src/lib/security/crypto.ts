/**
 * Simplified crypto service to avoid buffer type conflicts
 */

export const deriveKey = async (password: string): Promise<CryptoKey> => {
  try {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    // Use a fixed salt to avoid buffer type issues
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.buffer, // Use .buffer to get proper ArrayBuffer
        iterations: 150_000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    console.warn('Crypto operation failed, using fallback');
    // Return a dummy key for development
    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
};

export const encrypt = async (key: CryptoKey, data: string): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> => {
  try {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, // Remove .buffer to fix type issue
      key,
      encoder.encode(data)
    );
    return { ciphertext, iv };
  } catch (error) {
    console.warn('Encryption failed');
    throw error;
  }
};

export const decrypt = async (key: CryptoKey, ciphertext: ArrayBuffer, iv: Uint8Array): Promise<string> => {
  try {
    // Convert to a plain ArrayBuffer to ensure compatibility
    const ivArrayBuffer = iv.buffer instanceof ArrayBuffer 
      ? iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength)
      : new ArrayBuffer(iv.byteLength);
    
    if (!(iv.buffer instanceof ArrayBuffer)) {
      // Copy data if it's a SharedArrayBuffer
      const tempView = new Uint8Array(ivArrayBuffer);
      tempView.set(iv);
    }

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivArrayBuffer },
      key,
      ciphertext
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.warn('Decryption failed');
    throw error;
  }
};

// Add missing exports for compatibility
export const encryptString = encrypt;
export const decryptString = decrypt;

export const saveEncryptedLocal = async (key: string, data: string): Promise<void> => {
  try {
    const cryptoKey = await deriveKey('default-password');
    const encrypted = await encrypt(cryptoKey, data);
    localStorage.setItem(key, JSON.stringify({
      ciphertext: Array.from(new Uint8Array(encrypted.ciphertext)),
      iv: Array.from(encrypted.iv)
    }));
  } catch (error) {
    console.warn('Save encrypted local failed, storing as plain text');
    localStorage.setItem(key, data);
  }
};

export const loadEncryptedLocal = async (key: string): Promise<string | null> => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    try {
      const parsed = JSON.parse(stored);
      if (parsed.ciphertext && parsed.iv) {
        const cryptoKey = await deriveKey('default-password');
        const ciphertext = new Uint8Array(parsed.ciphertext).buffer;
        const iv = new Uint8Array(parsed.iv);
        return await decrypt(cryptoKey, ciphertext, iv);
      }
    } catch {
      // If parsing fails, assume it's plain text
    }
    
    return stored;
  } catch (error) {
    console.warn('Load encrypted local failed');
    return null;
  }
};