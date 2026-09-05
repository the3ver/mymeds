import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as biometricService from '../../src/modules/common/utils/biometricSessionService';
import * as dbAdapter from '../../src/modules/common/utils/indexedDbAdapter';
import * as dataService from '../../src/modules/common/utils/dataService';
import * as webAuthnPrf from '../../src/modules/common/utils/webAuthnPrfService';
import { generateSalt } from '../../src/core/crypto/cryptoService';
import { bufferToBase64 } from '../../src/core/crypto/base64';

describe('biometricSessionService', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await dbAdapter.clearAllBiometricSessions();
  });

  afterEach(async () => {
    await dbAdapter.clearAllBiometricSessions();
  });

  describe('hasBiometricSession & Expiration', () => {
    it('returns false when no session exists', async () => {
      const exists = await biometricService.hasBiometricSession(999);
      expect(exists).toBe(false);
    });

    it('returns true when an unexpired session exists', async () => {
      const session = {
        vaultId: 101,
        credentialId: 'mock-cred',
        prfSalt: 'mock-salt',
        wrappedPassword: 'mock-pw',
        iv: 'mock-iv',
        createdAt: Date.now(),
        expiresAt: Date.now() + 100000,
      };
      await dbAdapter.saveBiometricSession(session);

      const exists = await biometricService.hasBiometricSession(101);
      expect(exists).toBe(true);
    });

    it('returns false and automatically removes an expired session', async () => {
      const session = {
        vaultId: 102,
        credentialId: 'mock-cred',
        prfSalt: 'mock-salt',
        wrappedPassword: 'mock-pw',
        iv: 'mock-iv',
        createdAt: Date.now() - 200000,
        expiresAt: Date.now() - 5000, // expired 5s ago
      };
      await dbAdapter.saveBiometricSession(session);

      const exists = await biometricService.hasBiometricSession(102);
      expect(exists).toBe(false);

      const raw = await dbAdapter.getBiometricSession(102);
      expect(raw).toBeNull();
    });
  });

  describe('enrollBiometrics & unlockWithBiometrics', () => {
    it('successfully enrolls and unlocks a vault with wrapped password', async () => {
      const mockKey = await webAuthnPrf.deriveAesKeyFromPrfOutput(generateSalt(32), generateSalt(16));

      vi.spyOn(webAuthnPrf, 'createPrfCredential').mockResolvedValue({
        credentialId: 'test-cred-id',
        rawId: new Uint8Array([1, 2, 3]),
        prfEnabled: true,
        initialPrfKey: mockKey,
      });

      vi.spyOn(webAuthnPrf, 'getPrfKey').mockResolvedValue(mockKey);
      vi.spyOn(dataService, 'unlockDatabase').mockResolvedValue({
        success: true,
        data: { meds: [], calendar: [] },
        deductions: {},
      });

      // 1. Enroll
      const enrolled = await biometricService.enrollBiometrics(42, 'secret-master-pw');
      expect(enrolled.vaultId).toBe(42);
      expect(enrolled.credentialId).toBe('test-cred-id');

      // 2. Check session exists
      const hasSession = await biometricService.hasBiometricSession(42);
      expect(hasSession).toBe(true);

      // 3. Unlock with biometrics
      const unlockResult = await biometricService.unlockWithBiometrics(42);
      expect(unlockResult.success).toBe(true);
      expect(unlockResult.password).toBe('secret-master-pw');
      expect(dataService.unlockDatabase).toHaveBeenCalledWith(42, 'secret-master-pw');
    });

    it('uses user-given vault name for WebAuthn credential name during enrollment', async () => {
      const mockKey = await webAuthnPrf.deriveAesKeyFromPrfOutput(generateSalt(32), generateSalt(16));
      const createSpy = vi.spyOn(webAuthnPrf, 'createPrfCredential').mockResolvedValue({
        credentialId: 'test-named-cred',
        rawId: new Uint8Array([1, 2, 3]),
        prfEnabled: true,
        initialPrfKey: mockKey,
      });

      await biometricService.enrollBiometrics(43, 'secret-pw', 'Hausapotheke');
      expect(createSpy).toHaveBeenCalledWith('MyMeds', 'Hausapotheke', expect.any(Uint8Array));
    });

    it('handles user cancellation gracefully', async () => {
      const session = {
        vaultId: 50,
        credentialId: bufferToBase64(new Uint8Array([1, 2, 3])),
        prfSalt: bufferToBase64(generateSalt(16)),
        wrappedPassword: bufferToBase64(new Uint8Array([4, 5, 6])),
        iv: bufferToBase64(generateSalt(12)),
        createdAt: Date.now(),
        expiresAt: Date.now() + 100000,
      };
      await dbAdapter.saveBiometricSession(session);

      const cancelError = new Error('The operation either timed out or was not allowed');
      cancelError.name = 'NotAllowedError';
      vi.spyOn(webAuthnPrf, 'getPrfKey').mockRejectedValue(cancelError);

      const result = await biometricService.unlockWithBiometrics(50);
      expect(result.success).toBe(false);
      expect(result.error).toBe('cancelled');
    });

    it('revokes session if password unlock fails (e.g. password changed elsewhere)', async () => {
      const mockKey = await webAuthnPrf.deriveAesKeyFromPrfOutput(generateSalt(32), generateSalt(16));
      vi.spyOn(webAuthnPrf, 'createPrfCredential').mockResolvedValue({
        credentialId: 'test-cred-id',
        rawId: new Uint8Array([1, 2, 3]),
        prfEnabled: true,
        initialPrfKey: mockKey,
      });
      vi.spyOn(webAuthnPrf, 'getPrfKey').mockResolvedValue(mockKey);
      vi.spyOn(dataService, 'unlockDatabase').mockResolvedValue({
        success: false,
        data: null,
        deductions: {},
      });

      await biometricService.enrollBiometrics(77, 'old-password');
      const result = await biometricService.unlockWithBiometrics(77);

      expect(result.success).toBe(false);
      expect(result.error).toBe('invalid_password');

      // Session should have been automatically revoked
      const hasSession = await biometricService.hasBiometricSession(77);
      expect(hasSession).toBe(false);
    });
  });

  describe('Revocation & Listing', () => {
    it('revokes single session and clears all sessions', async () => {
      await dbAdapter.saveBiometricSession({
        vaultId: 1,
        credentialId: 'c1',
        createdAt: Date.now(),
        expiresAt: Date.now() + 100000,
      });
      await dbAdapter.saveBiometricSession({
        vaultId: 2,
        credentialId: 'c2',
        createdAt: Date.now(),
        expiresAt: Date.now() + 100000,
      });

      let active = await biometricService.getActiveBiometricVaultIds();
      expect(active.has(1)).toBe(true);
      expect(active.has(2)).toBe(true);

      await biometricService.revokeBiometrics(1);
      active = await biometricService.getActiveBiometricVaultIds();
      expect(active.has(1)).toBe(false);
      expect(active.has(2)).toBe(true);

      await biometricService.clearAllBiometrics();
      active = await biometricService.getActiveBiometricVaultIds();
      expect(active.size).toBe(0);
    });
  });
});
