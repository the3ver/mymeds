import * as dbAdapter from './indexedDbAdapter';
import * as crypto from './cryptoService';

const SESSION_RECOVERY_KEY = 'myMedsSessionRecovery';

// --- Database (Tresor) Management ---

export const getDatabaseList = dbAdapter.getDatabaseList;

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
  return { success: false, data: null };
}

export async function saveAndLockDatabase(id, password, data) {
  const dbEntry = await dbAdapter.getFullDatabase(id);
  if (!dbEntry) throw new Error("Database not found for saving.");

  if (dbEntry.encryptionStrategy === 'password') {
    const { salt } = dbEntry.passwordData;
    const key = await crypto.deriveKeyFromPassword(password, salt);
    const { iv, encryptedData } = await crypto.encryptData(data, key);

    dbEntry.encryptedData = encryptedData;
    dbEntry.passwordData.iv = iv;
    dbEntry.modifiedAt = new Date();
    
    return dbAdapter.updateDatabase(dbEntry);
  }
}

export const deleteDatabase = dbAdapter.deleteDatabase;

// --- Session Recovery ---
export function saveRecoveryState(id, password) {
  sessionStorage.setItem(SESSION_RECOVERY_KEY, JSON.stringify({ id, password }));
}

export function getRecoveryState() {
  const state = sessionStorage.getItem(SESSION_RECOVERY_KEY);
  return state ? JSON.parse(state) : null;
}

export function clearRecoveryState() {
  sessionStorage.removeItem(SESSION_RECOVERY_KEY);
}


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
