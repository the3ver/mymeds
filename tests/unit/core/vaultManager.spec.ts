import { describe, it, expect, beforeEach } from 'vitest';
import { VaultManager } from '../../../src/core/manager/vaultManager';
import { createVaultStorage } from '../../../src/core/storage/indexedDbStorage';

describe('core/manager/VaultManager', () => {
  let manager: VaultManager;

  beforeEach(async () => {
    const storage = createVaultStorage({
      dbName: 'TestManagerDB_' + Math.random().toString(36).substring(2, 8),
      dbVersion: 1,
    });
    await storage.clearAll();
    manager = new VaultManager(storage);
  });

  it('creates, unlocks, and modifies an encrypted vault with hooks', async () => {
    interface TestData {
      notes: string[];
      lastUpdate: string;
    }

    const initialData: TestData = {
      notes: ['buy milk', 'feed cat'],
      lastUpdate: '2026-01-01',
    };

    // 1. Create vault with metadata extraction hook
    const vaultId = await manager.createVaultWithPassword(
      'Daily Notes',
      'secret123',
      initialData,
      {
        extractMetadata: (d) => ({ noteCount: d.notes.length }),
      }
    );

    expect(vaultId).toBeDefined();

    // Verify summary metadata
    const vaults = await manager.listVaults();
    expect(vaults).toHaveLength(1);
    expect(vaults[0].name).toBe('Daily Notes');
    expect(vaults[0].metadata?.noteCount).toBe(2);

    // 2. Unlock with wrong password
    const wrongResult = await manager.unlockVault(vaultId, 'wrong-password');
    expect(wrongResult.success).toBe(false);
    expect(wrongResult.error).toBe('invalid_password');
    expect(wrongResult.data).toBeNull();

    // 3. Unlock with correct password and onUnlock hook
    const unlockResult = await manager.unlockVault<TestData>(vaultId, 'secret123', {
      onUnlock: (data) => {
        return {
          data: {
            ...data,
            lastUpdate: '2026-09-05', // simulated migration or update
          },
          metadata: { sessionChecked: true },
        };
      },
    });

    expect(unlockResult.success).toBe(true);
    expect(unlockResult.data?.notes).toEqual(['buy milk', 'feed cat']);
    expect(unlockResult.data?.lastUpdate).toBe('2026-09-05');
    expect(unlockResult.key).toBeDefined();

    // 4. Save modified data with derived key in memory
    unlockResult.data!.notes.push('call doctor');
    await manager.saveVaultData(
      vaultId,
      unlockResult.key!,
      unlockResult.data!,
      {
        extractMetadata: (d) => ({ noteCount: d.notes.length }),
      }
    );

    // 5. Unlock again and verify changes persisted
    const secondUnlock = await manager.unlockVault<TestData>(vaultId, 'secret123');
    expect(secondUnlock.success).toBe(true);
    expect(secondUnlock.data?.notes).toHaveLength(3);
    expect(secondUnlock.metadata?.noteCount).toBe(3);
  });
});
