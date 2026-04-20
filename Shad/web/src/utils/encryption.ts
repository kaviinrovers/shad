import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'shad-secret-key-2026';

export const encryptMessage = (message: string): string => {
  try {
    return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return message;
  }
};

export const decryptMessage = (ciphertext: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return ciphertext;
  }
};

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};
