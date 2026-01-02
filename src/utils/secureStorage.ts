import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET || 'fallback_secret_key';

interface SecureStorage {
  setItem: (key: string, value: unknown) => void;
  getItem: <T = unknown>(key: string) => T | null;
  removeItem: (key: string) => void;
  clear: () => void;
}

export const secureStorage: SecureStorage = {
  setItem: (key: string, value: unknown): void => {
    try {
      const stringValue = JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString();
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
    }
  },

  getItem: <T = unknown>(key: string): T | null => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) return null;

      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  }
};

// Storage keys constants
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'tr_access_token',
  USER_DATA: 'tr_user_data',
} as const;
