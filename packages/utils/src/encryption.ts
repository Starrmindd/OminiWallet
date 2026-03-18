import CryptoJS from 'crypto-js';

/**
 * AES-256 encryption for sensitive data (private keys, mnemonics).
 * Keys NEVER leave the client — this runs browser-side only.
 */
export function encryptData(data: string, password: string): string {
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
    hasher: CryptoJS.algo.SHA256,
  });
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  // Encode: salt + iv + ciphertext
  const result = salt.toString() + iv.toString() + encrypted.toString();
  return result;
}

export function decryptData(encryptedData: string, password: string): string {
  const salt = CryptoJS.enc.Hex.parse(encryptedData.substring(0, 32));
  const iv = CryptoJS.enc.Hex.parse(encryptedData.substring(32, 64));
  const ciphertext = encryptedData.substring(64);
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
    hasher: CryptoJS.algo.SHA256,
  });
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

export function generateDeviceKey(): string {
  return CryptoJS.lib.WordArray.random(256 / 8).toString();
}
