import { openDB, type IDBPDatabase } from 'idb';
import type { VaultRecord, VaultSummary } from '../types/vault';

export interface VaultStorageConfig {
  dbName: string;
  dbVersion?: number;
  vaultStoreName?: string;
  settingsStoreName?: string;
  onUpgrade?: (db: IDBPDatabase, oldVersion: number, newVersion: number | null) => void;
  onBlocked?: () => void;
}

export class VaultStorage {
  readonly dbName: string;
  readonly dbVersion: number;
  readonly vaultStoreName: string;
  readonly settingsStoreName: string;
  private dbPromise: Promise<IDBPDatabase>;

  constructor(config: VaultStorageConfig) {
    this.dbName = config.dbName;
    this.dbVersion = config.dbVersion ?? 1;
    this.vaultStoreName = config.vaultStoreName ?? 'databases';
    this.settingsStoreName = config.settingsStoreName ?? 'settings';

    const { vaultStoreName, settingsStoreName } = this;
    const { onUpgrade, onBlocked } = config;

    this.dbPromise = openDB(this.dbName, this.dbVersion, {
      upgrade(db, oldVersion, newVersion, tx) {
        if (!db.objectStoreNames.contains(settingsStoreName)) {
          db.createObjectStore(settingsStoreName);
        }
        if (!db.objectStoreNames.contains(vaultStoreName)) {
          db.createObjectStore(vaultStoreName, { keyPath: 'id', autoIncrement: true });
        }
        if (onUpgrade) {
          onUpgrade(db, oldVersion, newVersion);
        }
      },
      blocked() {
        console.warn(`IndexedDB '${config.dbName}' blocked. Other open tabs may be preventing upgrades.`);
        if (onBlocked) onBlocked();
      }
    });
  }

  /**
   * Retrieves summary list of all stored vaults without loading raw encrypted blobs.
   */
  async listVaults(): Promise<VaultSummary[]> {
    const db = await this.dbPromise;
    const records = await db.getAll(this.vaultStoreName) as VaultRecord[];

    return records.map((entry) => {
      const summary: VaultSummary = {
        id: entry.id!,
        name: entry.name,
        createdAt: entry.createdAt,
        modifiedAt: entry.modifiedAt,
        encryptionStrategy: entry.encryptionStrategy,
        metadata: entry.metadata || {},
      };

      // Preserve any legacy fields present on the record (e.g. medsCount, calendarCount)
      for (const [key, value] of Object.entries(entry)) {
        if (!['encryptedData', 'passwordData'].includes(key) && !(key in summary)) {
          summary[key] = value;
        }
      }

      return summary;
    });
  }

  /**
   * Loads the full vault record by ID including ciphertext, salt, and IV.
   */
  async getVault(id: number): Promise<VaultRecord | undefined> {
    const db = await this.dbPromise;
    return db.get(this.vaultStoreName, id);
  }

  /**
   * Stores a newly created vault record.
   * Returns the generated auto-incrementing ID.
   */
  async createVault(vault: Omit<VaultRecord, 'id'>): Promise<number> {
    const db = await this.dbPromise;
    return (await db.add(this.vaultStoreName, vault)) as number;
  }

  /**
   * Updates an existing vault record.
   */
  async updateVault(vault: VaultRecord): Promise<number> {
    const db = await this.dbPromise;
    return (await db.put(this.vaultStoreName, vault)) as number;
  }

  /**
   * Renames a vault by ID and updates modifiedAt.
   */
  async renameVault(id: number, newName: string): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(this.vaultStoreName, 'readwrite');
    const store = tx.objectStore(this.vaultStoreName);
    const entry = await store.get(id) as VaultRecord | undefined;
    if (entry) {
      entry.name = newName;
      entry.modifiedAt = new Date();
      await store.put(entry);
    }
    await tx.done;
  }

  /**
   * Deletes a vault permanently by ID.
   */
  async deleteVault(id: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(this.vaultStoreName, id);
  }

  /**
   * Reads an unencrypted configuration value from settings store.
   */
  async getSetting<T = unknown>(key: string, defaultValue?: T): Promise<T> {
    const db = await this.dbPromise;
    const value = await db.get(this.settingsStoreName, key);
    return value !== undefined ? (value as T) : (defaultValue as T);
  }

  /**
   * Persists an unencrypted configuration value to settings store.
   */
  async setSetting<T = unknown>(key: string, value: T): Promise<IDBValidKey> {
    const db = await this.dbPromise;
    return db.put(this.settingsStoreName, value, key);
  }

  /**
   * Deletes a setting key from the settings store.
   */
  async deleteSetting(key: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(this.settingsStoreName, key);
  }

  /**
   * Clears all vault and settings data in this database.
   */
  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(this.vaultStoreName);
    await db.clear(this.settingsStoreName);
  }
}

export function createVaultStorage(config: VaultStorageConfig): VaultStorage {
  return new VaultStorage(config);
}
