import mqtt, { type MqttClient } from 'mqtt';
import { bufferToBase64, base64ToBuffer } from '../crypto/base64';
import { generateSyncCode, normalizeSyncCode } from './syncCodes';
import type {
  SyncPayload,
  SyncValidationResult,
  SyncSessionController
} from '../types/sync';
import type { VaultRecord } from '../types/vault';

export const DEFAULT_MQTT_BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
];

export interface ExportSyncOptions {
  payloadType?: string;
  extractExtraMetadata?: (vault: VaultRecord) => Record<string, any>;
}

/**
 * Prepares an encrypted vault record for P2P synchronization over an untrusted relay.
 * The payload is already encrypted with AES-GCM; the broker sees zero plaintext.
 */
export function exportVaultForSync(
  vault: VaultRecord,
  options: ExportSyncOptions = {}
): SyncPayload {
  if (!vault || !vault.name || !vault.encryptedData) {
    throw new Error('Invalid vault entry for sync export.');
  }

  const saltBase64 = bufferToBase64(vault.passwordData?.salt);
  const ivBase64 = bufferToBase64(vault.passwordData?.iv);
  const encryptedDataBase64 = bufferToBase64(vault.encryptedData);

  const extraMeta = options.extractExtraMetadata ? options.extractExtraMetadata(vault) : {};

  // Preserve legacy top-level metadata if present
  const legacyFields: Record<string, any> = {};
  for (const [key, value] of Object.entries(vault)) {
    if (!['encryptedData', 'passwordData', 'id'].includes(key)) {
      legacyFields[key] = value;
    }
  }

  return {
    type: options.payloadType ?? 'pwa-vault-sync',
    version: 1,
    exportTimestamp: new Date().toISOString(),
    vault: {
      ...legacyFields,
      name: vault.name,
      createdAt: vault.createdAt ? new Date(vault.createdAt).toISOString() : new Date().toISOString(),
      modifiedAt: vault.modifiedAt ? new Date(vault.modifiedAt).toISOString() : new Date().toISOString(),
      encryptionStrategy: vault.encryptionStrategy || 'password',
      passwordData: {
        salt: saltBase64,
        iv: ivBase64,
        credentialId: vault.passwordData?.credentialId,
      },
      encryptedData: encryptedDataBase64,
      metadata: {
        ...(vault.metadata || {}),
        ...extraMeta,
      },
    },
  };
}

/**
 * Validates an incoming sync payload.
 */
export function validateSyncPayload(
  payload: any,
  expectedType = 'pwa-vault-sync'
): SyncValidationResult {
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, error: 'Empty or invalid payload' };
  }

  if (payload.type !== expectedType || !payload.vault) {
    return { isValid: false, error: `Incompatible payload format (expected type '${expectedType}')` };
  }

  const { vault } = payload;
  if (!vault.name || !vault.encryptedData || !vault.passwordData?.salt || !vault.passwordData?.iv) {
    return { isValid: false, error: 'Incomplete vault encryption data' };
  }

  return {
    isValid: true,
    vaultSummary: {
      name: vault.name,
      createdAt: vault.createdAt || new Date().toISOString(),
      modifiedAt: vault.modifiedAt || payload.exportTimestamp || new Date().toISOString(),
      metadata: vault.metadata || {},
      ...vault,
    },
  };
}

/**
 * Converts a validated sync payload back into a VaultRecord ready for IndexedDB.
 */
export function syncPayloadToVaultRecord(
  payload: SyncPayload,
  newName?: string
): Omit<VaultRecord, 'id'> {
  const { vault } = payload;
  const salt = base64ToBuffer(vault.passwordData.salt);
  const iv = base64ToBuffer(vault.passwordData.iv);
  const encryptedData = base64ToBuffer(vault.encryptedData);

  const name = newName || vault.name;
  const now = new Date();

  // Extract non-standard properties to preserve backwards compatibility (e.g. medsCount)
  const extraProps: Record<string, any> = {};
  for (const [key, value] of Object.entries(vault)) {
    if (!['name', 'createdAt', 'modifiedAt', 'encryptionStrategy', 'passwordData', 'encryptedData', 'metadata'].includes(key)) {
      extraProps[key] = value;
    }
  }

  return {
    ...extraProps,
    name,
    createdAt: vault.createdAt ? new Date(vault.createdAt) : now,
    modifiedAt: now,
    encryptionStrategy: (vault.encryptionStrategy as any) || 'password',
    passwordData: {
      salt,
      iv,
      credentialId: vault.passwordData.credentialId,
    },
    encryptedData: encryptedData.buffer as ArrayBuffer,
    metadata: vault.metadata || {},
  };
}

export interface SenderSessionConfig {
  loadVault: () => Promise<VaultRecord | undefined>;
  topicPrefix: string;
  brokers?: string[];
  payloadType?: string;
  onCodeReady?: (code: string) => void;
  onConnected?: () => void;
  onTransferred?: () => void;
  onError?: (err: any) => void;
}

/**
 * Creates an E2EE Sender Session using WebSocket MQTT broker.
 * Listens for an incoming connection request on an ephemeral topic, then transmits the encrypted vault.
 */
export function startSenderSession(config: SenderSessionConfig): SyncSessionController {
  const syncCode = generateSyncCode();
  const baseTopic = `${config.topicPrefix}${syncCode}`;
  const brokers = config.brokers ?? DEFAULT_MQTT_BROKERS;

  let client: MqttClient | null = null;
  let isClosed = false;

  try {
    if (config.onCodeReady) config.onCodeReady(syncCode);

    client = mqtt.connect(brokers[0], {
      clientId: `pwa-snd-${syncCode}-${Math.random().toString(36).substring(2, 6)}`,
      clean: true,
      connectTimeout: 10000,
    });

    client.on('connect', () => {
      if (isClosed) return;
      client?.subscribe([`${baseTopic}/request`, `${baseTopic}/ack`], { qos: 1 });
    });

    client.on('message', async (topic) => {
      if (isClosed) return;
      if (topic === `${baseTopic}/request`) {
        if (config.onConnected) config.onConnected();
        try {
          const vaultEntry = await config.loadVault();
          if (!vaultEntry) {
            throw new Error('Vault not found for sync transmission.');
          }
          const payload = exportVaultForSync(vaultEntry, { payloadType: config.payloadType });
          client?.publish(`${baseTopic}/data`, JSON.stringify(payload), { qos: 1 });
          if (config.onTransferred) config.onTransferred();
        } catch (err) {
          if (config.onError) config.onError(err);
        }
      } else if (topic === `${baseTopic}/ack`) {
        if (config.onTransferred) config.onTransferred();
      }
    });

    client.on('error', (err) => {
      if (config.onError && !isClosed) config.onError(err);
    });
  } catch (err) {
    if (config.onError) config.onError(err);
  }

  return {
    close: () => {
      isClosed = true;
      if (client) {
        try { client.end(true); } catch (e) { /* ignore */ }
      }
    },
  };
}

export interface ReceiverSessionConfig {
  syncCode: string;
  topicPrefix: string;
  brokers?: string[];
  expectedPayloadType?: string;
  onConnected?: () => void;
  onPayloadReceived?: (payload: SyncPayload) => void;
  onError?: (err: any) => void;
}

/**
 * Creates an E2EE Receiver Session using WebSocket MQTT broker.
 * Connects to the sender's ephemeral topic and requests the encrypted vault payload.
 */
export function startReceiverSession(config: ReceiverSessionConfig): SyncSessionController {
  const normalized = normalizeSyncCode(config.syncCode);
  const baseTopic = `${config.topicPrefix}${normalized}`;
  const brokers = config.brokers ?? DEFAULT_MQTT_BROKERS;

  let client: MqttClient | null = null;
  let isClosed = false;

  try {
    client = mqtt.connect(brokers[0], {
      clientId: `pwa-rcv-${normalized}-${Math.random().toString(36).substring(2, 6)}`,
      clean: true,
      connectTimeout: 10000,
    });

    client.on('connect', () => {
      if (isClosed) return;
      if (config.onConnected) config.onConnected();

      client?.subscribe(`${baseTopic}/data`, { qos: 1 }, () => {
        // Send request message to trigger sender
        client?.publish(`${baseTopic}/request`, JSON.stringify({ action: 'request' }), { qos: 1 });
      });
    });

    client.on('message', (topic, message) => {
      if (isClosed) return;
      if (topic === `${baseTopic}/data`) {
        try {
          const payload = JSON.parse(message.toString());
          const validation = validateSyncPayload(payload, config.expectedPayloadType);
          if (validation.isValid) {
            client?.publish(`${baseTopic}/ack`, JSON.stringify({ action: 'ack' }), { qos: 1 });
            if (config.onPayloadReceived) config.onPayloadReceived(payload);
          } else {
            if (config.onError) config.onError(new Error(validation.error || 'Invalid payload received'));
          }
        } catch (e) {
          if (config.onError) config.onError(e);
        }
      }
    });

    client.on('error', (err) => {
      if (config.onError && !isClosed) config.onError(err);
    });
  } catch (err) {
    if (config.onError) config.onError(err);
  }

  return {
    close: () => {
      isClosed = true;
      if (client) {
        try { client.end(true); } catch (e) { /* ignore */ }
      }
    },
  };
}
