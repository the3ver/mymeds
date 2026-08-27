import QRCode from 'qrcode';
import { Peer } from 'peerjs';
import * as dbAdapter from './indexedDbAdapter';

/**
 * Prefix used for PeerJS IDs to prevent collision with other applications.
 */
const PEER_PREFIX = 'mymeds-sync-';

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
 * Creates a WebRTC Sender Peer Session using PeerJS.
 * Listens for an incoming connection, then sends the vault payload.
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
  const peerId = `${PEER_PREFIX}${syncCode}`;

  let peer = null;
  let connection = null;

  try {
    peer = new Peer(peerId, {
      debug: 1,
    });

    peer.on('open', () => {
      onCodeReady(syncCode);
    });

    peer.on('connection', async (conn) => {
      connection = conn;
      conn.on('open', async () => {
        if (onConnected) onConnected();
        try {
          const vaultEntry = await dbAdapter.getFullDatabase(vaultId);
          if (!vaultEntry) {
            throw new Error('Vault not found in database.');
          }
          const payload = exportVaultForSync(vaultEntry);
          conn.send(payload);
          if (onTransferred) onTransferred();
        } catch (err) {
          if (onError) onError(err);
        }
      });

      conn.on('error', (err) => {
        if (onError) onError(err);
      });
    });

    peer.on('error', (err) => {
      if (onError) onError(err);
    });
  } catch (err) {
    if (onError) onError(err);
  }

  return {
    close: () => {
      if (connection) {
        try { connection.close(); } catch (e) { /* ignore */ }
      }
      if (peer) {
        try { peer.destroy(); } catch (e) { /* ignore */ }
      }
    }
  };
}

/**
 * Creates a WebRTC Receiver Peer Session using PeerJS.
 * Connects to the sender's code and awaits the vault payload.
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
  const targetPeerId = `${PEER_PREFIX}${normalized}`;

  let peer = null;
  let connection = null;

  try {
    peer = new Peer(undefined, {
      debug: 1,
    });

    peer.on('open', () => {
      connection = peer.connect(targetPeerId, {
        reliable: true
      });

      connection.on('open', () => {
        if (onConnected) onConnected();
      });

      connection.on('data', (data) => {
        const validation = validateSyncPayload(data);
        if (validation.isValid) {
          if (onPayloadReceived) onPayloadReceived(data);
        } else {
          if (onError) onError(new Error(validation.error || 'Invalid payload received'));
        }
      });

      connection.on('error', (err) => {
        if (onError) onError(err);
      });
    });

    peer.on('error', (err) => {
      if (onError) onError(err);
    });
  } catch (err) {
    if (onError) onError(err);
  }

  return {
    close: () => {
      if (connection) {
        try { connection.close(); } catch (e) { /* ignore */ }
      }
      if (peer) {
        try { peer.destroy(); } catch (e) { /* ignore */ }
      }
    }
  };
}
