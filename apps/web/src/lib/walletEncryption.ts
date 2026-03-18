/**
 * Client-side wallet encryption.
 * Private keys are NEVER sent in plaintext — always encrypted before leaving the browser.
 */
import { encryptData, decryptData } from '@/lib/omni';

const DEVICE_KEY_STORAGE = 'omniwallet_device_key';

export function getOrCreateDeviceKey(): string {
  if (typeof window === 'undefined') return '';
  let key = localStorage.getItem(DEVICE_KEY_STORAGE);
  if (!key) {
    key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    localStorage.setItem(DEVICE_KEY_STORAGE, key);
  }
  return key;
}

/**
 * Encrypt a private key using user password + device key (double encryption).
 * The result is safe to store on the server.
 */
export function encryptPrivateKey(privateKey: string, userPassword: string): string {
  const deviceKey = getOrCreateDeviceKey();
  const combined = `${userPassword}:${deviceKey}`;
  return encryptData(privateKey, combined);
}

export function decryptPrivateKey(encrypted: string, userPassword: string): string {
  const deviceKey = getOrCreateDeviceKey();
  const combined = `${userPassword}:${deviceKey}`;
  return decryptData(encrypted, combined);
}

/**
 * Derive an Ethereum wallet from a private key (client-side only)
 */
export async function getEthereumAddress(privateKey: string): Promise<string> {
  const { ethers } = await import('ethers');
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
}
