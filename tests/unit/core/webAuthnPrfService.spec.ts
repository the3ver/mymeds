import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isWebAuthnAvailable,
  isPrfSupported,
  deriveAesKeyFromPrfOutput,
  wrapPassword,
  unwrapPassword,
  createPrfCredential,
  getPrfKey,
} from '../../../src/core/crypto/webAuthnPrfService';
import { generateSalt } from '../../../src/core/crypto/cryptoService';
import { bufferToBase64 } from '../../../src/core/crypto/base64';

describe('core/crypto/webAuthnPrfService', () => {
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    if (!navigator.credentials) {
      Object.defineProperty(navigator, 'credentials', {
        value: {
          create: vi.fn(),
          get: vi.fn(),
        },
        configurable: true,
        writable: true,
      });
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Feature Detection', () => {
    it('detects WebAuthn availability based on PublicKeyCredential existence', () => {
      // In jsdom environment, window is defined
      const origPKC = (window as any).PublicKeyCredential;

      (window as any).PublicKeyCredential = function () {};
      expect(isWebAuthnAvailable()).toBe(true);

      (window as any).PublicKeyCredential = undefined;
      expect(isWebAuthnAvailable()).toBe(false);

      (window as any).PublicKeyCredential = origPKC;
    });

    it('checks PRF support via getClientCapabilities if supported', async () => {
      const mockPKC: any = function () {};
      mockPKC.getClientCapabilities = vi.fn().mockResolvedValue({ prf: true });
      (window as any).PublicKeyCredential = mockPKC;

      const supported = await isPrfSupported();
      expect(supported).toBe(true);
      expect(mockPKC.getClientCapabilities).toHaveBeenCalled();
    });

    it('falls back to isUserVerifyingPlatformAuthenticatorAvailable if getClientCapabilities is absent', async () => {
      const mockPKC: any = function () {};
      mockPKC.isUserVerifyingPlatformAuthenticatorAvailable = vi.fn().mockResolvedValue(true);
      (window as any).PublicKeyCredential = mockPKC;

      const supported = await isPrfSupported();
      expect(supported).toBe(true);
    });
  });

  describe('Key Derivation and Password Wrapping', () => {
    it('derives a valid AES-GCM key deterministically from PRF output and salt', async () => {
      const prfOutput = generateSalt(32);
      const salt = generateSalt(16);

      const key1 = await deriveAesKeyFromPrfOutput(prfOutput, salt);
      const key2 = await deriveAesKeyFromPrfOutput(prfOutput, salt);

      expect(key1).toBeDefined();
      expect(key1.algorithm.name).toBe('AES-GCM');

      // Test encryption with key1 and decryption with key2
      const { wrappedPassword, iv } = await wrapPassword('master-vault-password-123!', key1);
      const unwrapped = await unwrapPassword(wrappedPassword, iv, key2);
      expect(unwrapped).toBe('master-vault-password-123!');
    });

    it('fails to unwrap password when decrypted with key from different PRF output', async () => {
      const prfOutput1 = generateSalt(32);
      const prfOutput2 = generateSalt(32);
      const salt = generateSalt(16);

      const key1 = await deriveAesKeyFromPrfOutput(prfOutput1, salt);
      const key2 = await deriveAesKeyFromPrfOutput(prfOutput2, salt);

      const { wrappedPassword, iv } = await wrapPassword('top-secret', key1);

      await expect(unwrapPassword(wrappedPassword, iv, key2)).rejects.toThrow();
    });

    it('derives key when prfOutput or salt is an ArrayBuffer or Uint8Array', async () => {
      const prfBuffer = new ArrayBuffer(32);
      new Uint8Array(prfBuffer).fill(99);
      const saltBuffer = new ArrayBuffer(16);
      new Uint8Array(saltBuffer).fill(11);

      const keyFromBuffer = await deriveAesKeyFromPrfOutput(prfBuffer, new Uint8Array(saltBuffer));
      expect(keyFromBuffer).toBeDefined();
      expect(keyFromBuffer.algorithm.name).toBe('AES-GCM');

      const keyFromUint8 = await deriveAesKeyFromPrfOutput(new Uint8Array(prfBuffer), new Uint8Array(saltBuffer));
      expect(keyFromUint8).toBeDefined();

      const { wrappedPassword, iv } = await wrapPassword('test-password', keyFromBuffer);
      const unwrapped = await unwrapPassword(wrappedPassword, iv, keyFromUint8);
      expect(unwrapped).toBe('test-password');
    });
  });

  describe('WebAuthn Credential Mocking', () => {
    it('creates PRF credential and returns credentialId', async () => {
      const mockRawId = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const mockPrfSecret = new Uint8Array(32).fill(7);

      const mockCredential: any = {
        rawId: mockRawId.buffer,
        getClientExtensionResults: () => ({
          prf: {
            enabled: true,
            results: { first: mockPrfSecret.buffer },
          },
        }),
      };

      (window as any).PublicKeyCredential = function () {};
      navigator.credentials.create = vi.fn().mockResolvedValue(mockCredential);

      const prfSalt = generateSalt(16);
      const result = await createPrfCredential('MyMeds', 'test-vault', prfSalt);

      expect(result.credentialId).toBe(bufferToBase64(mockRawId));
      expect(result.prfEnabled).toBe(true);
      expect(result.initialPrfKey).toBeDefined();
    });

    it('retrieves PRF key on assertion via getPrfKey', async () => {
      const mockPrfSecret = new Uint8Array(32).fill(42);
      const mockAssertion: any = {
        getClientExtensionResults: () => ({
          prf: {
            results: { first: mockPrfSecret.buffer },
          },
        }),
      };

      (window as any).PublicKeyCredential = function () {};
      navigator.credentials.get = vi.fn().mockResolvedValue(mockAssertion);

      const credId = bufferToBase64(new Uint8Array([10, 20, 30]));
      const salt = generateSalt(16);

      const key = await getPrfKey(credId, salt);
      expect(key).toBeDefined();
      expect(key.algorithm.name).toBe('AES-GCM');
    });

    it('throws error when PRF output is missing in assertion', async () => {
      const mockAssertion: any = {
        getClientExtensionResults: () => ({
          prf: {}, // No results.first
        }),
      };

      (window as any).PublicKeyCredential = function () {};
      navigator.credentials.get = vi.fn().mockResolvedValue(mockAssertion);

      const credId = bufferToBase64(new Uint8Array([10, 20, 30]));
      const salt = generateSalt(16);

      await expect(getPrfKey(credId, salt)).rejects.toThrow('PRF result not returned by authenticator.');
    });
  });
});
