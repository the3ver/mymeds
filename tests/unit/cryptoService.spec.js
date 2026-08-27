import { describe, it, expect } from 'vitest';
import {
  generateSalt,
  deriveKeyFromPassword,
  encryptData,
  decryptData,
} from '../../src/modules/common/utils/cryptoService';

describe('cryptoService', () => {
  describe('generateSalt', () => {
    it('should generate a 16-byte Uint8Array salt', () => {
      const salt = generateSalt();
      expect(salt).toBeInstanceOf(Uint8Array);
      expect(salt.byteLength).toBe(16);
    });

    it('should generate distinct salts on successive calls', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toEqual(salt2);
    });
  });

  describe('deriveKeyFromPassword', () => {
    it('should derive an AES-GCM CryptoKey from password and salt', async () => {
      const salt = generateSalt();
      const password = 'my-secure-password';

      const key = await deriveKeyFromPassword(password, salt);

      expect(key).toBeDefined();
      expect(key.type).toBe('secret');
      expect(key.algorithm.name).toBe('AES-GCM');
      expect(key.algorithm.length).toBe(256);
      expect(key.usages).toContain('encrypt');
      expect(key.usages).toContain('decrypt');
    });

    it('should derive consistent keys for the same password and salt', async () => {
      const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
      const password = 'repeatable-password';

      const key1 = await deriveKeyFromPassword(password, salt);
      const key2 = await deriveKeyFromPassword(password, salt);

      const rawKey1 = await window.crypto.subtle.exportKey('raw', key1);
      const rawKey2 = await window.crypto.subtle.exportKey('raw', key2);

      expect(new Uint8Array(rawKey1)).toEqual(new Uint8Array(rawKey2));
    });

    it('should derive different keys for different passwords with the same salt', async () => {
      const salt = generateSalt();
      const key1 = await deriveKeyFromPassword('password-1', salt);
      const key2 = await deriveKeyFromPassword('password-2', salt);

      const rawKey1 = await window.crypto.subtle.exportKey('raw', key1);
      const rawKey2 = await window.crypto.subtle.exportKey('raw', key2);

      expect(new Uint8Array(rawKey1)).not.toEqual(new Uint8Array(rawKey2));
    });
  });

  describe('encryptData and decryptData', () => {
    it('should encrypt and decrypt data roundtrip successfully', async () => {
      const salt = generateSalt();
      const key = await deriveKeyFromPassword('test-password', salt);
      const testPayload = {
        meds: [
          { name: 'Ibuprofen 400mg', count: 20, dose: '1-0-1' },
          { name: 'Pantoprazol', count: 14, dose: '1/2' }
        ],
        calendar: [
          { title: 'Zahnarzt Kontrolltermin', date: '2026-09-15', type: 'doctor' }
        ],
        specialChars: 'Äpfel, Überraschung, Groß & Klein, € 12,50',
        nested: { a: 1, b: [true, false, null] }
      };

      const { iv, encryptedData } = await encryptData(testPayload, key);

      expect(iv).toBeInstanceOf(Uint8Array);
      expect(iv.byteLength).toBe(12);
      expect(encryptedData.byteLength).toBeGreaterThan(0);

      const decryptedPayload = await decryptData(encryptedData, iv, key);

      expect(decryptedPayload).toEqual(testPayload);
    });

    it('should fail decryption when using a different key (wrong password)', async () => {
      const salt = generateSalt();
      const correctKey = await deriveKeyFromPassword('correct-password', salt);
      const wrongKey = await deriveKeyFromPassword('wrong-password', salt);

      const testPayload = { secret: 'top-secret-data' };
      const { iv, encryptedData } = await encryptData(testPayload, correctKey);

      await expect(decryptData(encryptedData, iv, wrongKey)).rejects.toThrow();
    });

    it('should fail decryption when IV is tampered with', async () => {
      const salt = generateSalt();
      const key = await deriveKeyFromPassword('test-password', salt);
      const testPayload = { secret: 'data' };

      const { iv, encryptedData } = await encryptData(testPayload, key);

      const corruptedIv = new Uint8Array(iv);
      corruptedIv[0] ^= 0xFF; // Invert first byte

      await expect(decryptData(encryptedData, corruptedIv, key)).rejects.toThrow();
    });

    it('should fail decryption when encrypted data is tampered with', async () => {
      const salt = generateSalt();
      const key = await deriveKeyFromPassword('test-password', salt);
      const testPayload = { secret: 'data' };

      const { iv, encryptedData } = await encryptData(testPayload, key);

      const tamperedBuffer = encryptedData.slice(0);
      const view = new Uint8Array(tamperedBuffer);
      view[0] ^= 0xFF; // Invert first byte of ciphertext/tag

      await expect(decryptData(tamperedBuffer, iv, key)).rejects.toThrow();
    });
  });
});
