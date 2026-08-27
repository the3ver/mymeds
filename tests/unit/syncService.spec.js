import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as syncService from '../../src/modules/common/utils/syncService';
import * as dbAdapter from '../../src/modules/common/utils/indexedDbAdapter';

describe('syncService', () => {
  beforeEach(async () => {
    await dbAdapter.deleteAllData();
  });

  describe('generateSyncCode & normalizeSyncCode', () => {
    it('generates a 6-character alphanumeric sync code', () => {
      const code = syncService.generateSyncCode();
      expect(code).toBeDefined();
      expect(typeof code).toBe('string');
      // Should be 6 digits or uppercase chars
      expect(code.length).toBe(6);
      expect(/^[0-9A-Z]{6}$/.test(code)).toBe(true);
    });

    it('normalizes formatted sync code with spaces and dashes', () => {
      expect(syncService.normalizeSyncCode(' 123-456 ')).toBe('123456');
      expect(syncService.normalizeSyncCode('abc 123')).toBe('ABC123');
      expect(syncService.normalizeSyncCode('')).toBe('');
    });
  });

  describe('exportVaultForSync & validateSyncPayload', () => {
    it('creates a valid sync payload from a database entry', () => {
      const mockDbEntry = {
        id: 1,
        name: 'Hausapotheke',
        createdAt: new Date('2026-01-01T10:00:00Z'),
        modifiedAt: new Date('2026-01-02T12:00:00Z'),
        medsCount: 4,
        calendarCount: 2,
        encryptionStrategy: 'password',
        passwordData: {
          salt: new Uint8Array([1, 2, 3, 4]),
          iv: new Uint8Array([5, 6, 7, 8]),
        },
        encryptedData: new Uint8Array([9, 10, 11, 12]),
      };

      const payload = syncService.exportVaultForSync(mockDbEntry);

      expect(payload.type).toBe('mymeds-vault-sync');
      expect(payload.version).toBe(1);
      expect(payload.vault.name).toBe('Hausapotheke');
      expect(payload.vault.medsCount).toBe(4);
      expect(payload.vault.calendarCount).toBe(2);
      expect(payload.vault.encryptionStrategy).toBe('password');
      expect(typeof payload.vault.encryptedData).toBe('string'); // base64
      expect(typeof payload.vault.passwordData.salt).toBe('string'); // base64
      expect(typeof payload.vault.passwordData.iv).toBe('string'); // base64

      const validation = syncService.validateSyncPayload(payload);
      expect(validation.isValid).toBe(true);
      expect(validation.vaultSummary.name).toBe('Hausapotheke');
      expect(validation.vaultSummary.medsCount).toBe(4);
    });

    it('rejects invalid or corrupted payloads', () => {
      expect(syncService.validateSyncPayload(null).isValid).toBe(false);
      expect(syncService.validateSyncPayload({ type: 'wrong-type' }).isValid).toBe(false);
      expect(syncService.validateSyncPayload({ type: 'mymeds-vault-sync', vault: {} }).isValid).toBe(false);
    });
  });

  describe('importVaultFromSync', () => {
    it('imports a valid payload as a new vault', async () => {
      const mockDbEntry = {
        name: 'Urlaub Tresor',
        createdAt: new Date('2026-03-01T08:00:00Z'),
        modifiedAt: new Date('2026-03-01T09:00:00Z'),
        medsCount: 2,
        calendarCount: 1,
        encryptionStrategy: 'password',
        passwordData: {
          salt: new Uint8Array([11, 22, 33]),
          iv: new Uint8Array([44, 55, 66]),
        },
        encryptedData: new Uint8Array([77, 88, 99]),
      };

      const payload = syncService.exportVaultForSync(mockDbEntry);
      const newId = await syncService.importVaultFromSync(payload, { mode: 'create' });

      expect(newId).toBeDefined();

      const stored = await dbAdapter.getFullDatabase(newId);
      expect(stored).toBeDefined();
      expect(stored.name).toBe('Urlaub Tresor');
      expect(stored.medsCount).toBe(2);
      expect(stored.encryptionStrategy).toBe('password');
      expect(new Uint8Array(stored.encryptedData)).toEqual(new Uint8Array([77, 88, 99]));
      expect(new Uint8Array(stored.passwordData.salt)).toEqual(new Uint8Array([11, 22, 33]));
      expect(new Uint8Array(stored.passwordData.iv)).toEqual(new Uint8Array([44, 55, 66]));
    });

    it('imports a payload with customized copy name', async () => {
      const mockDbEntry = {
        name: 'Haupttresor',
        createdAt: new Date(),
        modifiedAt: new Date(),
        medsCount: 5,
        calendarCount: 0,
        encryptionStrategy: 'password',
        passwordData: { salt: new Uint8Array([1]), iv: new Uint8Array([2]) },
        encryptedData: new Uint8Array([3, 4]),
      };

      const payload = syncService.exportVaultForSync(mockDbEntry);
      const newId = await syncService.importVaultFromSync(payload, {
        mode: 'create',
        newName: 'Haupttresor (vom Handy)',
      });

      const stored = await dbAdapter.getFullDatabase(newId);
      expect(stored.name).toBe('Haupttresor (vom Handy)');
    });

    it('overwrites an existing vault when mode is overwrite', async () => {
      // 1. Create existing vault
      const existingId = await dbAdapter.createDatabase({
        name: 'Alter Tresor',
        createdAt: new Date('2025-01-01'),
        modifiedAt: new Date('2025-01-01'),
        medsCount: 1,
        calendarCount: 0,
        encryptionStrategy: 'password',
        passwordData: { salt: new Uint8Array([1]), iv: new Uint8Array([2]) },
        encryptedData: new Uint8Array([10]),
      });

      // 2. Prepare payload from new source
      const incomingEntry = {
        name: 'Aktualisierter Tresor',
        createdAt: new Date('2025-01-01'),
        modifiedAt: new Date('2026-08-27'),
        medsCount: 6,
        calendarCount: 3,
        encryptionStrategy: 'password',
        passwordData: { salt: new Uint8Array([5, 6]), iv: new Uint8Array([7, 8]) },
        encryptedData: new Uint8Array([100, 101]),
      };
      const payload = syncService.exportVaultForSync(incomingEntry);

      await syncService.importVaultFromSync(payload, {
        mode: 'overwrite',
        targetId: existingId,
      });

      const updated = await dbAdapter.getFullDatabase(existingId);
      expect(updated.id).toBe(existingId);
      expect(updated.name).toBe('Aktualisierter Tresor');
      expect(updated.medsCount).toBe(6);
      expect(updated.calendarCount).toBe(3);
    });
  });

  describe('generateQrCodeDataUrl', () => {
    it('generates a QR code data URL from string', async () => {
      const qrDataUrl = await syncService.generateQrCodeDataUrl('https://example.com#sync=123456');
      expect(qrDataUrl).toBeDefined();
      expect(qrDataUrl.startsWith('data:image/png;base64,')).toBe(true);
    });
  });

  describe('startSenderSession & startReceiverSession error handling', () => {
    it('creates sender session object with close function', () => {
      const session = syncService.startSenderSession({
        vaultId: 1,
        onCodeReady: () => {},
      });
      expect(session).toBeDefined();
      expect(typeof session.close).toBe('function');
      session.close();
    });

    it('creates receiver session object with close function', () => {
      const session = syncService.startReceiverSession({
        syncCode: '123456',
      });
      expect(session).toBeDefined();
      expect(typeof session.close).toBe('function');
      session.close();
    });
  });
});
