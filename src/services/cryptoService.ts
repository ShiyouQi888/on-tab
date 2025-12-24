/**
 * Simple encryption utility for sensitive data using Web Crypto API.
 * In a real application, you would use a user-derived key.
 */

export const cryptoService = {
  async encrypt(text: string, secret: string): Promise<string> {
    if (!text) return '';
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      const key = await this.deriveKey(secret);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      
      const encryptedArray = new Uint8Array(encrypted);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv);
      combined.set(encryptedArray, iv.length);
      
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      return text;
    }
  },

  async decrypt(encryptedBase64: string, secret: string): Promise<string> {
    if (!encryptedBase64) return '';
    try {
      const combined = new Uint8Array(
        atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
      );
      
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);
      
      const key = await this.deriveKey(secret);
      
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '[Encrypted Data]';
    }
  },

  async deriveKey(secret: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('dao-hang-shu-qian-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
};
