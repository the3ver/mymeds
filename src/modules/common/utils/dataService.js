import * as dbAdapter from './indexedDbAdapter';
import * as crypto from './cryptoService';
import { checkAndUpdateDailyDose } from '../../meds/utils/medUtils';

// --- Database (Tresor) Management ---

export const getDatabaseList = dbAdapter.getDatabaseList;

export async function createDatabaseWithPassword(name, password) {
  const salt = crypto.generateSalt();
  const key = await crypto.deriveKeyFromPassword(password, salt);
  
  const emptyData = { 
    meds: [], 
    calendar: [],
    lastDoseUpdate: new Date().toDateString() // Initialize on creation
  };
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
      let data = await crypto.decryptData(dbEntry.encryptedData, iv, key);

      // --- This is the new, correct place for the dose update logic ---
      const updateResult = checkAndUpdateDailyDose(data.meds, data.lastDoseUpdate);
      if (updateResult.updated) {
        console.log("Doses updated upon unlock.");
        data.meds = updateResult.updatedItems;
        data.lastDoseUpdate = updateResult.newDate;
      }
      // ----------------------------------------------------------------

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
