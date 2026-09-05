import * as dbAdapter from './indexedDbAdapter';
import {
  DEFAULT_MQTT_BROKERS,
  exportVaultForSync as coreExportVaultForSync,
  validateSyncPayload as coreValidateSyncPayload,
  syncPayloadToVaultRecord,
  startSenderSession as coreStartSenderSession,
  startReceiverSession as coreStartReceiverSession
} from '../../../core/sync/mqttRelaySync';

export { generateSyncCode, normalizeSyncCode } from '../../../core/sync/syncCodes';
export { bufferToBase64, base64ToBuffer } from '../../../core/crypto/base64';
export { generateQrCodeDataUrl } from '../../../core/sync/qrCode';

export const BROKERS = DEFAULT_MQTT_BROKERS;
const TOPIC_PREFIX = 'mymeds/v1/sync/';
const PAYLOAD_TYPE = 'mymeds-vault-sync';

/**
 * Prepares an encrypted vault database entry for P2P synchronization payload.
 */
export function exportVaultForSync(dbEntry) {
  return coreExportVaultForSync(dbEntry, { payloadType: PAYLOAD_TYPE });
}

/**
 * Validates an incoming sync payload.
 */
export function validateSyncPayload(payload) {
  return coreValidateSyncPayload(payload, PAYLOAD_TYPE);
}

/**
 * Imports a validated sync payload into IndexedDB.
 * @param {object} payload 
 * @param {{ mode: 'create' | 'overwrite', targetId?: number, newName?: string }} options 
 * @returns {Promise<number>} Saved database ID
 */
export async function importVaultFromSync(payload, options = { mode: 'create' }) {
  const plainPayload = JSON.parse(JSON.stringify(payload));
  const validation = validateSyncPayload(plainPayload);
  if (!validation.isValid) {
    throw new Error(`Cannot import invalid sync payload: ${validation.error}`);
  }

  const restored = syncPayloadToVaultRecord(plainPayload, options.newName);
  const now = new Date();

  if (options.mode === 'overwrite' && options.targetId) {
    const existing = await dbAdapter.getFullDatabase(options.targetId);
    if (existing) {
      const updatedEntry = {
        ...existing,
        ...restored,
        id: options.targetId,
        modifiedAt: now,
      };
      await dbAdapter.updateDatabase(updatedEntry);
      return options.targetId;
    }
  }

  return dbAdapter.createDatabase(restored);
}

/**
 * Creates an E2EE Sender Session using WebSocket MQTT broker.
 */
export function startSenderSession({ vaultId, onCodeReady, onConnected, onTransferred, onError }) {
  return coreStartSenderSession({
    loadVault: () => dbAdapter.getFullDatabase(vaultId),
    topicPrefix: TOPIC_PREFIX,
    payloadType: PAYLOAD_TYPE,
    brokers: BROKERS,
    onCodeReady,
    onConnected,
    onTransferred,
    onError,
  });
}

/**
 * Creates an E2EE Receiver Session using WebSocket MQTT broker.
 */
export function startReceiverSession({ syncCode, onConnected, onPayloadReceived, onError }) {
  return coreStartReceiverSession({
    syncCode,
    topicPrefix: TOPIC_PREFIX,
    expectedPayloadType: PAYLOAD_TYPE,
    brokers: BROKERS,
    onConnected,
    onPayloadReceived,
    onError,
  });
}
