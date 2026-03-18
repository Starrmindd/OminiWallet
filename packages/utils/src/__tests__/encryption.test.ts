import { encryptData, decryptData, generateDeviceKey } from '../encryption';

describe('encryption', () => {
  const password = 'TestPassword123!';
  const plaintext = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

  it('encrypts and decrypts data correctly', () => {
    const encrypted = encryptData(plaintext, password);
    expect(encrypted).not.toBe(plaintext);
    const decrypted = decryptData(encrypted, password);
    expect(decrypted).toBe(plaintext);
  });

  it('produces different ciphertext each time (random IV)', () => {
    const e1 = encryptData(plaintext, password);
    const e2 = encryptData(plaintext, password);
    expect(e1).not.toBe(e2);
  });

  it('fails to decrypt with wrong password', () => {
    const encrypted = encryptData(plaintext, password);
    const decrypted = decryptData(encrypted, 'WrongPassword');
    expect(decrypted).not.toBe(plaintext);
  });

  it('generates unique device keys', () => {
    const k1 = generateDeviceKey();
    const k2 = generateDeviceKey();
    expect(k1).not.toBe(k2);
    expect(k1).toHaveLength(64); // 32 bytes hex
  });
});
