import {
  isValidEthereumAddress,
  isValidSolanaAddress,
  isValidBitcoinAddress,
  isValidPrivateKey,
  isStrongPassword,
} from '../validation';

describe('validation', () => {
  describe('Ethereum addresses', () => {
    it('accepts valid checksummed address', () => {
      expect(isValidEthereumAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).toBe(true);
    });
    it('accepts lowercase address', () => {
      expect(isValidEthereumAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa96045')).toBe(true);
    });
    it('rejects address without 0x prefix', () => {
      expect(isValidEthereumAddress('d8da6bf26964af9d7eed9e03e53415d37aa96045')).toBe(false);
    });
    it('rejects short address', () => {
      expect(isValidEthereumAddress('0x1234')).toBe(false);
    });
  });

  describe('Solana addresses', () => {
    it('accepts valid Solana address', () => {
      expect(isValidSolanaAddress('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')).toBe(true);
    });
    it('rejects invalid address', () => {
      expect(isValidSolanaAddress('0xinvalid')).toBe(false);
    });
  });

  describe('Bitcoin addresses', () => {
    it('accepts legacy P2PKH address', () => {
      expect(isValidBitcoinAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf')).toBe(true);
    });
    it('accepts bech32 address', () => {
      expect(isValidBitcoinAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe(true);
    });
  });

  describe('private keys', () => {
    it('accepts valid 64-char hex key', () => {
      expect(isValidPrivateKey('a'.repeat(64))).toBe(true);
    });
    it('accepts 0x-prefixed key', () => {
      expect(isValidPrivateKey('0x' + 'a'.repeat(64))).toBe(true);
    });
    it('rejects short key', () => {
      expect(isValidPrivateKey('abc123')).toBe(false);
    });
  });

  describe('password strength', () => {
    it('accepts strong password', () => {
      expect(isStrongPassword('MyPass123')).toBe(true);
    });
    it('rejects short password', () => {
      expect(isStrongPassword('Ab1')).toBe(false);
    });
    it('rejects no uppercase', () => {
      expect(isStrongPassword('mypass123')).toBe(false);
    });
    it('rejects no number', () => {
      expect(isStrongPassword('MyPassword')).toBe(false);
    });
  });
});
