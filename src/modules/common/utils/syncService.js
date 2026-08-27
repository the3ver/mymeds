import QRCode from 'qrcode';
import mqtt from 'mqtt';
import * as dbAdapter from './indexedDbAdapter';

/**
 * Public WSS MQTT brokers for instant cross-device E2EE relay.
 */
export const BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
];

const TOPIC_PREFIX = 'mymeds/v1/sync/';

/**
 * Generates a random 6-character alphanumeric sync code (uppercase).
 * @returns {string}
 */
export function generateSyncCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes ambiguous chars (0, O, 1, I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Normalizes user-entered sync code by removing spaces, hyphens, and converting to uppercase.
 * @param {string} code 
 * @returns {string}
 */
export function normalizeSyncCode(code) {
  if (!code || typeof code !== 'string') return '';
  return code.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}

/**
 * Converts a Uint8Array or ArrayBuffer to a Base64 string.
 * @param {Uint8Array|ArrayBuffer} buffer 
 * @returns {string}
 */
export function bufferToBase64(buffer) {
  if (!buffer) return '';
  const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

/**
 * Converts a Base64 string to a Uint8Array.
 * @param {string} base64 
 * @returns {Uint8Array}
 */
export function base64ToBuffer(base64) {
  if (!base64 || typeof base64 !== 'string') return new Uint8Array(0);
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Prepares an encrypted vault database entry for P2P synchronization payload.
 * @param {object} dbEntry 
 * @returns {object}
 */
export function exportVaultForSync(dbEntry) {
  if (!dbEntry || !dbEntry.name || !dbEntry.encryptedData) {
    throw new Error('Invalid vault entry for sync export.');
  }

  const saltBase64 = bufferToBase64(dbEntry.passwordData?.salt);
  const ivBase64 = bufferToBase64(dbEntry.passwordData?.iv);
  const encryptedDataBase64 = bufferToBase64(dbEntry.encryptedData);

  return {
    type: 'mymeds-vault-sync',
    version: 1,
    exportTimestamp: new Date().toISOString(),
    vault: {
      name: dbEntry.name,
      createdAt: dbEntry.createdAt ? new Date(dbEntry.createdAt).toISOString() : new Date().toISOString(),
      modifiedAt: dbEntry.modifiedAt ? new Date(dbEntry.modifiedAt).toISOString() : new Date().toISOString(),
      medsCount: dbEntry.medsCount || 0,
      calendarCount: dbEntry.calendarCount || 0,
      encryptionStrategy: dbEntry.encryptionStrategy || 'password',
      passwordData: {
        salt: saltBase64,
        iv: ivBase64,
      },
      encryptedData: encryptedDataBase64,
    }
  };
}

/**
 * Validates an incoming sync payload.
 * @param {any} payload 
 * @returns {{ isValid: boolean, error?: string, vaultSummary?: object }}
 */
export function validateSyncPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, error: 'Empty or invalid payload' };
  }

  if (payload.type !== 'mymeds-vault-sync' || !payload.vault) {
    return { isValid: false, error: 'Incompatible payload format' };
  }

  const { vault } = payload;
  if (!vault.name || !vault.encryptedData || !vault.passwordData?.salt || !vault.passwordData?.iv) {
    return { isValid: false, error: 'Incomplete vault encryption data' };
  }

  return {
    isValid: true,
    vaultSummary: {
      name: vault.name,
      medsCount: vault.medsCount || 0,
      calendarCount: vault.calendarCount || 0,
      modifiedAt: vault.modifiedAt || payload.exportTimestamp || new Date().toISOString(),
      createdAt: vault.createdAt || new Date().toISOString(),
    }
  };
}

/**
 * Imports a validated sync payload into IndexedDB.
 * @param {object} payload 
 * @param {{ mode: 'create' | 'overwrite', targetId?: number, newName?: string }} options 
 * @returns {Promise<number>} Saved database ID
 */
export async function importVaultFromSync(payload, options = { mode: 'create' }) {
  const validation = validateSyncPayload(payload);
  if (!validation.isValid) {
    throw new Error(`Cannot import invalid sync payload: ${validation.error}`);
  }

  const { vault } = payload;
  const salt = base64ToBuffer(vault.passwordData.salt);
  const iv = base64ToBuffer(vault.passwordData.iv);
  const encryptedData = base64ToBuffer(vault.encryptedData);

  const name = options.newName || vault.name;
  const now = new Date();

  if (options.mode === 'overwrite' && options.targetId) {
    const existing = await dbAdapter.getFullDatabase(options.targetId);
    if (existing) {
      const updatedEntry = {
        ...existing,
        name,
        modifiedAt: now,
        medsCount: vault.medsCount || 0,
        calendarCount: vault.calendarCount || 0,
        encryptionStrategy: vault.encryptionStrategy || 'password',
        passwordData: { salt, iv },
        encryptedData,
      };
      await dbAdapter.updateDatabase(updatedEntry);
      return options.targetId;
    }
  }

  // Create mode (or targetId not found)
  const newDbEntry = {
    name,
    createdAt: vault.createdAt ? new Date(vault.createdAt) : now,
    modifiedAt: now,
    medsCount: vault.medsCount || 0,
    calendarCount: vault.calendarCount || 0,
    encryptionStrategy: vault.encryptionStrategy || 'password',
    passwordData: { salt, iv },
    encryptedData,
  };

  return dbAdapter.createDatabase(newDbEntry);
}

/**
 * Generates a QR Code as Data URL (PNG base64).
 * @param {string} text 
 * @returns {Promise<string>}
 */
export async function generateQrCodeDataUrl(text) {
  return QRCode.toDataURL(text, {
    width: 280,
    margin: 1,
    color: {
      dark: '#1e293b',
      light: '#ffffff'
    }
  });
}

/**
 * Creates an E2EE Sender Session using WebSocket MQTT broker.
 * Listens for an incoming connection request, then sends the encrypted vault payload.
 * 
 * @param {object} params
 * @param {number} params.vaultId
 * @param {(code: string) => void} params.onCodeReady
 * @param {() => void} params.onConnected
 * @param {() => void} params.onTransferred
 * @param {(err: any) => void} params.onError
 * @returns {{ close: () => void }}
 */
export function startSenderSession({ vaultId, onCodeReady, onConnected, onTransferred, onError }) {
  const syncCode = generateSyncCode();
  const baseTopic = `${TOPIC_PREFIX}${syncCode}`;

  let client = null;
  let isClosed = false;

  try {
    if (onCodeReady) onCodeReady(syncCode);

    client = mqtt.connect(BROKERS[0], {
      clientId: `mymeds-snd-${syncCode}-${Math.random().toString(36).substring(2, 6)}`,
      clean: true,
      connectTimeout: 10000,
    });

    client.on('connect', () => {
      if (isClosed) return;
      client.subscribe([`${baseTopic}/request`, `${baseTopic}/ack`], { qos: 1 });
    });

    client.on('message', async (topic) => {
      if (isClosed) return;
      if (topic === `${baseTopic}/request`) {
        if (onConnected) onConnected();
        try {
          const vaultEntry = await dbAdapter.getFullDatabase(vaultId);
          if (!vaultEntry) {
            throw new Error('Vault not found in database.');
          }
          const payload = exportVaultForSync(vaultEntry);
          client.publish(`${baseTopic}/data`, JSON.stringify(payload), { qos: 1 });
          if (onTransferred) onTransferred();
        } catch (err) {
          if (onError) onError(err);
        }
      } else if (topic === `${baseTopic}/ack`) {
        if (onTransferred) onTransferred();
      }
    });

    client.on('error', (err) => {
      if (onError && !isClosed) onError(err);
    });
  } catch (err) {
    if (onError) onError(err);
  }

  return {
    close: () => {
      isClosed = true;
      if (client) {
        try { client.end(true); } catch (e) { /* ignore */ }
      }
    }
  };
}

/**
 * Creates an E2EE Receiver Session using WebSocket MQTT broker.
 * Connects to the sender's code topic and requests the encrypted vault payload.
 * 
 * @param {object} params
 * @param {string} params.syncCode
 * @param {() => void} params.onConnected
 * @param {(payload: object) => void} params.onPayloadReceived
 * @param {(err: any) => void} params.onError
 * @returns {{ close: () => void }}
 */
export function startReceiverSession({ syncCode, onConnected, onPayloadReceived, onError }) {
  const normalized = normalizeSyncCode(syncCode);
  const baseTopic = `${TOPIC_PREFIX}${normalized}`;

  let client = null;
  let isClosed = false;

  try {
    client = mqtt.connect(BROKERS[0], {
      clientId: `mymeds-rcv-${normalized}-${Math.random().toString(36).substring(2, 6)}`,
      clean: true,
      connectTimeout: 10000,
    });

    client.on('connect', () => {
      if (isClosed) return;
      if (onConnected) onConnected();

      client.subscribe(`${baseTopic}/data`, { qos: 1 }, () => {
        // Send request message to trigger sender
        client.publish(`${baseTopic}/request`, JSON.stringify({ action: 'request' }), { qos: 1 });
      });
    });

    client.on('message', (topic, message) => {
      if (isClosed) return;
      if (topic === `${baseTopic}/data`) {
        try {
          const payload = JSON.parse(message.toString());
          const validation = validateSyncPayload(payload);
          if (validation.isValid) {
            client.publish(`${baseTopic}/ack`, JSON.stringify({ action: 'ack' }), { qos: 1 });
            if (onPayloadReceived) onPayloadReceived(payload);
          } else {
            if (onError) onError(new Error(validation.error || 'Invalid payload received'));
          }
        } catch (e) {
          if (onError) onError(e);
        }
      }
    });

    client.on('error', (err) => {
      if (onError && !isClosed) onError(err);
    });
  } catch (err) {
    if (onError) onError(err);
  }

  return {
    close: () => {
      isClosed = true;
      if (client) {
        try { client.end(true); } catch (e) { /* ignore */ }
      }
    }
  };
}


