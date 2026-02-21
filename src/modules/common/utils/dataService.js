import * as dbAdapter from './indexedDbAdapter';
import * as crypto from './cryptoService';

// --- Database (Tresor) Management ---

/**
 * Gets the metadata list of all available databases.
 */
export const getDatabaseList = dbAdapter.getDatabaseList;

/**
 * Creates a new, empty, encrypted database with a password.
 * @param {string} name - The user-defined name for the database.
 * @param {string} password - The password to encrypt the database.
 */
export async function createDatabaseWithPassword(name, password) {
  const salt = crypto.generateSalt();
  const key = await crypto.deriveKeyFromPassword(password, salt);
  
  const emptyData = { meds: [], calendar: [] };
  const { iv, encryptedData } = await crypto.encryptData(emptyData, key);

  const now = new Date();
  const newDbEntry = {
    name,
    createdAt: now,
    modifiedAt: now,
    encryptionStrategy: 'password',
    passwordData: { salt, iv },
    encryptedData,
  };

  return dbAdapter.createDatabase(newDbEntry);
}

/**
 * Unlocks a database and returns the decrypted data.
 * @param {number} id - The ID of the database to unlock.
 * @param {string} password - The password for the database.
 * @returns {Promise<{success: boolean, data: object|null}>}
 */
export async function unlockDatabase(id, password) {
  const dbEntry = await dbAdapter.getFullDatabase(id);
  if (!dbEntry) return { success: false, data: null };

  if (dbEntry.encryptionStrategy === 'password') {
    const { salt, iv } = dbEntry.passwordData;
    try {
      const key = await crypto.deriveKeyFromPassword(password, salt);
      const data = await crypto.decryptData(dbEntry.encryptedData, iv, key);
      return { success: true, data };
    } catch (e) {
      console.error("Decryption failed:", e);
      return { success: false, data: null }; // Wrong password
    }
  }
  // Placeholder for WebAuthn
  return { success: false, data: null };
}

/**
 * Saves data back into an encrypted database.
 * @param {number} id - The ID of the database.
 * @param {string} password - The password (needed to re-derive the key).
 * @param {object} data - The plain { meds, calendar } object.
 */
export async function saveAndLockDatabase(id, password, data) {
  const dbEntry = await dbAdapter.getFullDatabase(id);
  if (!dbEntry) throw new Error("Database not found for saving.");

  if (dbEntry.encryptionStrategy === 'password') {
    const { salt } = dbEntry.passwordData;
    const key = await crypto.deriveKeyFromPassword(password, salt);
    const { iv, encryptedData } = await crypto.encryptData(data, key);

    dbEntry.encryptedData = encryptedData;
    dbEntry.passwordData.iv = iv; // IV changes with each encryption
    dbEntry.modifiedAt = new Date();
    
    return dbAdapter.updateDatabase(dbEntry);
  }
}

export const deleteDatabase = dbAdapter.deleteDatabase;


// --- Settings & App Meta Data (Unencrypted) ---
export const getSettings = dbAdapter.getSettings;
export const saveLocale = dbAdapter.saveLocale;
export const saveTheme = dbAdapter.saveTheme;
export const saveUiScale = dbAdapter.saveUiScale;
export const saveSortMode = dbAdapter.saveSortMode;
export const saveDisplayMode = dbAdapter.saveDisplayMode;
export const saveYellowLimit = dbAdapter.saveYellowLimit;
export const saveRedLimit = dbAdapter.saveRedLimit;
export const saveShowOverview = dbAdapter.saveShowOverview;
export const getLastVersion = dbAdapter.getLastVersion;
export const saveLastVersion = dbAdapter.saveLastVersion;
export const getFirstRunCompleted = dbAdapter.getFirstRunCompleted;
export const setFirstRunCompleted = dbAdapter.setFirstRunCompleted;
export const deleteAllData = dbAdapter.deleteAllData;
