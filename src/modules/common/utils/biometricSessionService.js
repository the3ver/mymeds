import * as dbAdapter from './indexedDbAdapter';
import * as dataService from './dataService';
import {
  isWebAuthnAvailable,
  isPrfSupported,
  createPrfCredential,
  getPrfKey,
  wrapPassword,
  unwrapPassword
} from './webAuthnPrfService';
import { generateSalt } from '../../../core/crypto/cryptoService';
import { bufferToBase64, base64ToBuffer } from '../../../core/crypto/base64';

export { isWebAuthnAvailable, isPrfSupported };

/**
 * Checks if a valid, unexpired biometric session exists for the given vaultId.
 * Automatically cleans up expired sessions.
 */
export async function hasBiometricSession(vaultId) {
  if (vaultId === undefined || vaultId === null) return false;
  try {
    const session = await dbAdapter.getBiometricSession(vaultId);
    if (!session) return false;

    if (session.expiresAt && session.expiresAt <= Date.now()) {
      await dbAdapter.deleteBiometricSession(vaultId);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[biometricSessionService] Error checking session:', err);
    return false;
  }
}

/**
 * Retrieves the raw biometric session object if valid and not expired.
 */
export async function getBiometricSession(vaultId) {
  const isValid = await hasBiometricSession(vaultId);
  if (!isValid) return null;
  return dbAdapter.getBiometricSession(vaultId);
}

/**
 * Enrolls a vault for biometric unlock on this device:
 * 1. Generates salt and registers a PRF-enabled WebAuthn credential.
 * 2. Obtains the PRF-derived AES-GCM key.
 * 3. Wraps the master password and persists the session object in IndexedDB.
 */
export async function enrollBiometrics(vaultId, password, vaultName = null, ttlDays = 30) {
  if (!password) {
    throw new Error('Password is required for biometric enrollment.');
  }

  let name = vaultName;
  let ttl = ttlDays;
  if (typeof vaultName === 'number') {
    ttl = vaultName;
    name = null;
  }

  if (!name) {
    try {
      const db = await dbAdapter.getFullDatabase(vaultId);
      if (db?.name) {
        name = db.name;
      }
    } catch (e) {
      // Fallback to vaultId if lookup fails
    }
  }

  const credentialName = name && name.trim() ? name.trim() : `Vault ${vaultId}`;

  const prfSalt = generateSalt(32);
  const credential = await createPrfCredential('MyMeds', credentialName, prfSalt);

  let prfKey = credential.initialPrfKey;
  if (!prfKey) {
    // If the authenticator did not evaluate PRF on creation, perform an immediate assertion
    prfKey = await getPrfKey(credential.credentialId, prfSalt);
  }

  const { wrappedPassword, iv } = await wrapPassword(password, prfKey);

  const now = Date.now();
  const sessionData = {
    vaultId,
    credentialId: credential.credentialId,
    prfSalt: bufferToBase64(prfSalt),
    wrappedPassword: bufferToBase64(wrappedPassword),
    iv: bufferToBase64(iv),
    createdAt: now,
    expiresAt: now + (ttlDays * 24 * 60 * 60 * 1000),
  };

  await dbAdapter.saveBiometricSession(sessionData);
  return sessionData;
}

/**
 * Performs biometric authentication via WebAuthn PRF assertion,
 * unwraps the master password, and unlocks the vault.
 */
export async function unlockWithBiometrics(vaultId) {
  const session = await getBiometricSession(vaultId);
  if (!session) {
    return { success: false, data: null, deductions: {}, error: 'no_session' };
  }

  try {
    const rawCredId = base64ToBuffer(session.credentialId);
    const prfSalt = base64ToBuffer(session.prfSalt);
    const wrappedBytes = base64ToBuffer(session.wrappedPassword);
    const iv = base64ToBuffer(session.iv);

    const prfKey = await getPrfKey(rawCredId, prfSalt);
    const password = await unwrapPassword(wrappedBytes, iv, prfKey);

    const unlockResult = await dataService.unlockDatabase(vaultId, password);
    if (!unlockResult.success) {
      // If decryption fails (e.g. password was changed on another device), revoke invalid session
      await revokeBiometrics(vaultId);
      return { success: false, data: null, deductions: {}, error: 'invalid_password' };
    }

    return {
      success: true,
      data: unlockResult.data,
      deductions: unlockResult.deductions || {},
      password
    };
  } catch (err) {
    console.warn('[biometricSessionService] Biometric unlock failed:', err);
    return {
      success: false,
      data: null,
      deductions: {},
      error: err?.name === 'NotAllowedError' ? 'cancelled' : 'auth_failed',
      details: err?.message
    };
  }
}

/**
 * Revokes the biometric session for a single vault.
 */
export async function revokeBiometrics(vaultId) {
  return dbAdapter.deleteBiometricSession(vaultId);
}

/**
 * Revokes all biometric sessions on this device.
 */
export async function clearAllBiometrics() {
  return dbAdapter.clearAllBiometricSessions();
}

/**
 * Returns a Set of vault IDs that have an active biometric session on this device.
 */
export async function getActiveBiometricVaultIds() {
  try {
    const allSessions = await dbAdapter.getAllBiometricSessions();
    const activeIds = new Set();
    const now = Date.now();

    for (const session of allSessions) {
      if (session.expiresAt && session.expiresAt <= now) {
        await dbAdapter.deleteBiometricSession(session.vaultId);
      } else {
        activeIds.add(session.vaultId);
      }
    }
    return activeIds;
  } catch (err) {
    console.warn('[biometricSessionService] Failed to load active sessions:', err);
    return new Set();
  }
}
