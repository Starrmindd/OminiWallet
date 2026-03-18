import { ChainId } from './types';

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export function isValidBitcoinAddress(address: string): boolean {
  // Supports legacy (1...), P2SH (3...), and bech32 (bc1...)
  return /^(1|3)[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) ||
    /^bc1[a-z0-9]{39,59}$/.test(address);
}

export function isValidAddress(address: string, chainId: ChainId): boolean {
  if (chainId === 'solana') return isValidSolanaAddress(address);
  if (chainId === 'bitcoin') return isValidBitcoinAddress(address);
  return isValidEthereumAddress(address); // all EVM chains
}

export function isValidPrivateKey(key: string): boolean {
  // EVM private key: 64 hex chars, optionally prefixed with 0x
  return /^(0x)?[0-9a-fA-F]{64}$/.test(key);
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
}
