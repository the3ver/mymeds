import * as crypto from '../crypto/cryptoService';
import { VaultStorage } from '../storage/indexedDbStorage';
import type {
  VaultRecord,
  VaultSummary,
  VaultLifecycleHooks,
  EncryptionStrategy
} from '../types/vault';

export interface UnlockResult<T> {
  success: boolean;
  data: T | null;
  key?: CryptoKey;
  metadata?: Record<string, any>;
  error?: string;
}

export class VaultManager {
  private storage: VaultStorage;

  constructor(storage: VaultStorage) {
    this.storage = storage;
  }

  getStorage(): VaultStorage {
    return this.storage;
  }

  /**
   * Retrieves all available vaults.
   */
  async listVaults(): Promise<VaultSummary[]> {
    return this.storage.listVaults();
  }

  /**
   * Renames a vault by ID.
   */
  async renameVault(id: number, newName: string): Promise<void> {
    return this.storage.renameVault(id, newName);
  }

  /**
   * Deletes a vault by ID.
   */
  async deleteVault(id: number): Promise<void> {
    return this.storage.deleteVault(id);
  }

  /**
   * Creates a new vault encrypted with a user-chosen password.
   * @param name Vault display name
   * @param password Password for encryption key derivation
   * @param initialData Plaintext payload to encrypt
   * @param hooks Optional lifecycle hooks (e.g. extractMetadata)
   */
  async createVaultWithPassword<T = unknown>(
    name: string,
    password: string,
    initialData: T,
    hooks?: VaultLifecycleHooks<T>
  ): Promise<number> {
    const salt = crypto.generateSalt();
    const key = await crypto.deriveKeyFromPassword(password, salt);

    const { iv, encryptedData } = await crypto.encryptData(initialData, key);
    const metadata = hooks?.extractMetadata ? hooks.extractMetadata(initialData) : {};

    const now = new Date();
    const newEntry: Omit<VaultRecord, 'id'> = {
      name,
      createdAt: now,
      modifiedAt: now,
      encryptionStrategy: 'password' as EncryptionStrategy,
      passwordData: { salt, iv },
      encryptedData,
      metadata,
    };

    return this.storage.createVault(newEntry);
  }

  /**
   * Unlocks an encrypted vault with the given password.
   * Runs the onUnlock hook if configured.
   */
  async unlockVault<T = unknown>(
    id: number,
    password: string,
    hooks?: VaultLifecycleHooks<T>
  ): Promise<UnlockResult<T>> {
    const dbEntry = await this.storage.getVault(id);
    if (!dbEntry) {
      return { success: false, data: null, error: 'vault_not_found' };
    }

    if (dbEntry.encryptionStrategy === 'password') {
      const { salt, iv } = dbEntry.passwordData;
      try {
        const key = await crypto.deriveKeyFromPassword(password, salt);
        let data = await crypto.decryptData<T>(dbEntry.encryptedData, iv, key);

        let hookMeta: Record<string, any> | undefined;
        if (hooks?.onUnlock) {
          const hookResult = await hooks.onUnlock(data);
          data = hookResult.data as any;
          hookMeta = hookResult.metadata;
        }

        return {
          success: true,
          data,
          key,
          metadata: { ...(dbEntry.metadata || {}), ...hookMeta },
        };
      } catch (err) {
        console.error('[VaultManager] Decryption failed:', err);
        return { success: false, data: null, error: 'invalid_password' };
      }
    }

    // Future hook: biometric / passkey strategy handling
    if (dbEntry.encryptionStrategy === 'biometric' || dbEntry.encryptionStrategy === 'passkey') {
      return { success: false, data: null, error: 'biometric_not_yet_supported' };
    }

    return { success: false, data: null, error: 'unsupported_strategy' };
  }

  /**
   * Encrypts and persists data into an existing vault using password and salt.
   */
  async saveAndLock<T = unknown>(
    id: number,
    password: string,
    data: T,
    hooks?: VaultLifecycleHooks<T>
  ): Promise<number> {
    const dbEntry = await this.storage.getVault(id);
    if (!dbEntry) {
      throw new Error(`Vault ID ${id} not found.`);
    }

    if (dbEntry.encryptionStrategy === 'password') {
      const { salt } = dbEntry.passwordData;
      const key = await crypto.deriveKeyFromPassword(password, salt);
      return this.saveVaultData(id, key, data, hooks);
    }

    throw new Error(`Unsupported encryption strategy: ${dbEntry.encryptionStrategy}`);
  }

  /**
   * Directly encrypts and updates vault data with an already derived key in memory.
   */
  async saveVaultData<T = unknown>(
    id: number,
    key: CryptoKey,
    data: T,
    hooks?: VaultLifecycleHooks<T>
  ): Promise<number> {
    const dbEntry = await this.storage.getVault(id);
    if (!dbEntry) {
      throw new Error(`Vault ID ${id} not found.`);
    }

    const processedData = hooks?.beforeSave ? await hooks.beforeSave(data) : data;
    const { iv, encryptedData } = await crypto.encryptData(processedData, key);

    const extraMetadata = hooks?.extractMetadata ? hooks.extractMetadata(processedData) : {};

    dbEntry.encryptedData = encryptedData;
    dbEntry.passwordData = {
      ...dbEntry.passwordData,
      iv,
    };
    dbEntry.modifiedAt = new Date();
    dbEntry.metadata = {
      ...(dbEntry.metadata || {}),
      ...extraMetadata,
    };

    // Propagate legacy fields if metadata contains them (for backwards compatibility)
    for (const [k, v] of Object.entries(extraMetadata)) {
      dbEntry[k] = v;
    }

    return this.storage.updateVault(dbEntry);
  }
}
