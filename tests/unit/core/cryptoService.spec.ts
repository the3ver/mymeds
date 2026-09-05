import { describe, it, expect } from 'vitest';
import * as crypto from '../../../src/core/crypto/cryptoService';

describe('core/crypto/cryptoService', () => {
  it('generates unique salts and IVs of expected byte lengths', () => {
    const salt1 = crypto.generateSalt(16);
    const salt2 = crypto.generateSalt(16);
    expect(salt1.byteLength).toBe(16);
    expect(salt2.byteLength).toBe(16);
    expect(salt1).not.toEqual(salt2);

    const iv1 = crypto.generateIv(12);
    const iv2 = crypto.generateIv(12);
    expect(iv1.byteLength).toBe(12);
    expect(iv2.byteLength).toBe(12);
    expect(iv1).not.toEqual(iv2);
  });

  it('derives a valid AES-GCM CryptoKey using PBKDF2', async () => {
    const salt = crypto.generateSalt();
    const key = await crypto.deriveKeyFromPassword('super-secret-password', salt, 1000);
    expect(key).toBeDefined();
    expect(key.algorithm.name).toBe('AES-GCM');
  });

  it('encrypts and decrypts arbitrary typed JSON data losslessly', async () => {
    const salt = crypto.generateSalt();
    const key = await crypto.deriveKeyFromPassword('test-password', salt, 1000);

    const originalData = {
      user: 'Alice',
      items: [1, 2, 3],
      nested: { active: true, notes: 'Zero-Knowledge PWA core test' },
      count: 42,
    };

    const { iv, encryptedData } = await crypto.encryptData(originalData, key);
    expect(iv.byteLength).toBe(12);
    expect(encryptedData.byteLength).toBeGreaterThan(0);

    const decrypted = await crypto.decryptData<typeof originalData>(encryptedData, iv, key);
    expect(decrypted).toEqual(originalData);
  });

  it('fails decryption when provided with the wrong key', async () => {
    const salt = crypto.generateSalt();
    const correctKey = await crypto.deriveKeyFromPassword('password-1', salt, 1000);
    const wrongKey = await crypto.deriveKeyFromPassword('password-2', salt, 1000);

    const { iv, encryptedData } = await crypto.encryptData({ secret: 'data' }, correctKey);

    await expect(crypto.decryptData(encryptedData, iv, wrongKey)).rejects.toThrow();
  });
});
