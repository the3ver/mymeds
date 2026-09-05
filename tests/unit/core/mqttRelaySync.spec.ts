import { describe, it, expect } from 'vitest';
import {
  exportVaultForSync,
  validateSyncPayload,
  syncPayloadToVaultRecord
} from '../../../src/core/sync/mqttRelaySync';
import type { VaultRecord } from '../../../src/core/types/vault';

describe('core/sync/mqttRelaySync', () => {
  const mockVault: VaultRecord = {
    id: 1,
    name: 'Generic App Vault',
    createdAt: new Date('2026-01-01T10:00:00Z'),
    modifiedAt: new Date('2026-01-02T12:00:00Z'),
    encryptionStrategy: 'password',
    passwordData: {
      salt: new Uint8Array([10, 20, 30, 40]),
      iv: new Uint8Array([50, 60, 70, 80]),
    },
    encryptedData: new Uint8Array([90, 100, 110, 120]).buffer as ArrayBuffer,
    metadata: {
      recordsCount: 42,
      category: 'secure-notes',
    },
  };

  it('exports vault with custom payloadType and metadata', () => {
    const payload = exportVaultForSync(mockVault, {
      payloadType: 'custom-pwa-sync',
      extractExtraMetadata: (v) => ({ exportedBy: 'test' }),
    });

    expect(payload.type).toBe('custom-pwa-sync');
    expect(payload.version).toBe(1);
    expect(payload.vault.name).toBe('Generic App Vault');
    expect(typeof payload.vault.encryptedData).toBe('string');
    expect(typeof payload.vault.passwordData.salt).toBe('string');
    expect(typeof payload.vault.passwordData.iv).toBe('string');
    expect(payload.vault.metadata?.recordsCount).toBe(42);
    expect(payload.vault.metadata?.exportedBy).toBe('test');
  });

  it('validates incoming payload against expected payload type', () => {
    const payload = exportVaultForSync(mockVault, { payloadType: 'custom-pwa-sync' });

    const validResult = validateSyncPayload(payload, 'custom-pwa-sync');
    expect(validResult.isValid).toBe(true);
    expect(validResult.vaultSummary?.name).toBe('Generic App Vault');

    const invalidTypeResult = validateSyncPayload(payload, 'different-type');
    expect(invalidTypeResult.isValid).toBe(false);
    expect(invalidTypeResult.error).toContain('Incompatible payload format');
  });

  it('re-constructs VaultRecord from validated payload cleanly', () => {
    const payload = exportVaultForSync(mockVault);
    const restoredRecord = syncPayloadToVaultRecord(payload, 'Renamed Restored Vault');

    expect(restoredRecord.name).toBe('Renamed Restored Vault');
    expect(restoredRecord.encryptionStrategy).toBe('password');
    expect(restoredRecord.passwordData.salt).toEqual(mockVault.passwordData.salt);
    expect(restoredRecord.passwordData.iv).toEqual(mockVault.passwordData.iv);
    expect(new Uint8Array(restoredRecord.encryptedData)).toEqual(new Uint8Array(mockVault.encryptedData));
  });
});
