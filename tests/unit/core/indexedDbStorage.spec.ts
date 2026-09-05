import { describe, it, expect, beforeEach } from 'vitest';
import { createVaultStorage, VaultStorage } from '../../../src/core/storage/indexedDbStorage';
import type { VaultRecord } from '../../../src/core/types/vault';

describe('core/storage/indexedDbStorage', () => {
  let storage: VaultStorage;

  beforeEach(async () => {
    storage = createVaultStorage({
      dbName: 'TestVaultDB_' + Math.random().toString(36).substring(2, 8),
      dbVersion: 1,
      vaultStoreName: 'vaults',
      settingsStoreName: 'settings',
    });
    await storage.clearAll();
  });

  it('creates, retrieves, and lists vaults cleanly', async () => {
    const now = new Date();
    const newEntry: Omit<VaultRecord, 'id'> = {
      name: 'Personal Vault',
      createdAt: now,
      modifiedAt: now,
      encryptionStrategy: 'password',
      passwordData: { salt: new Uint8Array([1, 2, 3]), iv: new Uint8Array([4, 5, 6]) },
      encryptedData: new ArrayBuffer(16),
      metadata: { itemCount: 10, category: 'finance' },
    };

    const id = await storage.createVault(newEntry);
    expect(id).toBeDefined();

    const retrieved = await storage.getVault(id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(id);
    expect(retrieved?.name).toBe('Personal Vault');
    expect(retrieved?.metadata?.itemCount).toBe(10);

    const list = await storage.listVaults();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(id);
    expect(list[0].name).toBe('Personal Vault');
    // Ensure raw encrypted data is omitted from summary
    expect(list[0].encryptedData).toBeUndefined();
  });

  it('renames and deletes a vault', async () => {
    const id = await storage.createVault({
      name: 'Old Name',
      createdAt: new Date(),
      modifiedAt: new Date(),
      encryptionStrategy: 'password',
      passwordData: { salt: new Uint8Array(16), iv: new Uint8Array(12) },
      encryptedData: new ArrayBuffer(8),
    });

    await storage.renameVault(id, 'New Name');
    const updated = await storage.getVault(id);
    expect(updated?.name).toBe('New Name');

    await storage.deleteVault(id);
    const deleted = await storage.getVault(id);
    expect(deleted).toBeUndefined();
  });

  it('manages key-value settings', async () => {
    expect(await storage.getSetting('theme', 'dark')).toBe('dark');

    await storage.setSetting('theme', 'light');
    expect(await storage.getSetting('theme', 'dark')).toBe('light');

    await storage.deleteSetting('theme');
    expect(await storage.getSetting('theme', 'dark')).toBe('dark');
  });
});
