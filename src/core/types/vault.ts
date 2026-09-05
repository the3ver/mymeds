/**
 * Supported encryption and authentication strategies.
 * 'password': PBKDF2 + AES-GCM (current)
 * 'biometric' / 'passkey': Prepared for WebAuthn/Passkey integration
 */
export type EncryptionStrategy = 'password' | 'biometric' | 'passkey';

export interface VaultPasswordData {
  salt: Uint8Array;
  iv: Uint8Array;
  /** Prepared for WebAuthn / Passkey credential ID */
  credentialId?: string;
}

export interface VaultRecord {
  id?: number;
  name: string;
  createdAt: Date;
  modifiedAt: Date;
  encryptionStrategy: EncryptionStrategy;
  passwordData: VaultPasswordData;
  encryptedData: ArrayBuffer;
  /** Application-specific metadata (e.g. counts, tags, preview stats) */
  metadata?: Record<string, any>;
  [key: string]: any; // Backward-compatible with extra legacy fields
}

export interface VaultSummary {
  id: number;
  name: string;
  createdAt: Date;
  modifiedAt: Date;
  encryptionStrategy: EncryptionStrategy;
  metadata?: Record<string, any>;
  [key: string]: any; // Backward-compatible with extra legacy fields
}

export interface VaultLifecycleHooks<T = unknown> {
  /** Called after decryption upon unlocking */
  onUnlock?: (data: T) => Promise<{ data: T; metadata?: Record<string, any> }> | { data: T; metadata?: Record<string, any> };
  /** Extracts metadata to store alongside encrypted blob on save */
  extractMetadata?: (data: T) => Record<string, any>;
  /** Called before saving to modify or validate data */
  beforeSave?: (data: T) => Promise<T> | T;
  /** Called on lock */
  onLock?: () => void;
}
