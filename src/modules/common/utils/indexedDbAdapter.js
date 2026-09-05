import { openDB } from 'idb';

const DB_NAME = 'MyMedsDB';
const DB_VERSION = 4; // Incremented to force a clean upgrade
const DB_STORE_NAME = 'databases';
const SETTINGS_STORE_NAME = 'settings';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion, newVersion, tx) {
    // This is the most robust upgrade path: ensure the required stores for the current version exist.
    if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
      db.createObjectStore(SETTINGS_STORE_NAME);
    }
    if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
      db.createObjectStore(DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }
  },
  blocked() {
    console.error("IndexedDB blocked. Please close other tabs with this app open.");
    alert("The database needs to update, but other tabs are blocking it. Please close all other tabs with this app open and reload.");
  }
});

// --- Database (Tresor) Management ---

export async function getDatabaseList() {
  const db = await dbPromise;
  const allDbs = await db.getAll(DB_STORE_NAME);
  // Destructure all required fields, providing defaults for older entries
  return allDbs.map(({ id, name, createdAt, modifiedAt, encryptionStrategy, medsCount, calendarCount }) => ({
    id,
    name,
    createdAt,
    modifiedAt,
    encryptionStrategy,
    medsCount: medsCount || 0,
    calendarCount: calendarCount || 0,
  }));
}

export async function createDatabase(dbEntry) {
  const db = await dbPromise;
  return db.add(DB_STORE_NAME, dbEntry);
}

export async function getFullDatabase(id) {
  const db = await dbPromise;
  return db.get(DB_STORE_NAME, id);
}

export async function updateDatabase(dbEntry) {
  const db = await dbPromise;
  return db.put(DB_STORE_NAME, dbEntry);
}

export async function renameDatabase(id, newName) {
  const db = await dbPromise;
  const tx = db.transaction(DB_STORE_NAME, 'readwrite');
  const store = tx.objectStore(DB_STORE_NAME);
  const dbEntry = await store.get(id);
  if (dbEntry) {
    dbEntry.name = newName;
    dbEntry.modifiedAt = new Date();
    await store.put(dbEntry);
  }
  return tx.done;
}

export async function deleteDatabase(id) {
  const db = await dbPromise;
  return db.delete(DB_STORE_NAME, id);
}

// --- Settings (remain unencrypted) ---

export const getSetting = async (key, defaultValue) => {
  const db = await dbPromise;
  const value = await db.get(SETTINGS_STORE_NAME, key);
  return value !== undefined ? value : defaultValue;
};

export const setSetting = async (key, value) => {
  const db = await dbPromise;
  return db.put(SETTINGS_STORE_NAME, value, key);
};

export const CURRENT_DISCLAIMER_VERSION = 1;

export async function getSettings() {
  const disclaimerVersion = await getSetting('disclaimerVersion', 0);
  const settings = {
    locale: await getSetting('locale', navigator.language.startsWith('de') ? 'de' : 'en'),
    theme: await getSetting('theme', 'light'),
    uiScale: await getSetting('uiScale', 'normal'),
    sortMode: await getSetting('sortMode', 'added'),
    displayMode: await getSetting('displayMode', 'pills'),
    yellowLimit: await getSetting('yellowLimit', 21),
    redLimit: await getSetting('redLimit', 7),
    showOverview: await getSetting('showOverview', true),
    disclaimerVersion,
    disclaimerAccepted: disclaimerVersion >= CURRENT_DISCLAIMER_VERSION,
    lastSeenChangelogVersion: await getSetting('lastSeenChangelogVersion', ''),
  };
  return settings;
}

export const saveLocale = (locale) => setSetting('locale', locale);
export const saveTheme = (theme) => setSetting('theme', theme);
export const saveUiScale = (scale) => setSetting('uiScale', scale);
export const saveSortMode = (mode) => setSetting('sortMode', mode);
export const saveDisplayMode = (mode) => setSetting('displayMode', mode);
export const saveYellowLimit = (limit) => setSetting('yellowLimit', limit);
export const saveRedLimit = (limit) => setSetting('redLimit', limit);
export const saveShowOverview = (show) => setSetting('showOverview', show);
export const saveDisclaimerVersion = (version = CURRENT_DISCLAIMER_VERSION) => setSetting('disclaimerVersion', version);
export const saveDisclaimerAccepted = (accepted) => saveDisclaimerVersion(accepted ? CURRENT_DISCLAIMER_VERSION : 0);
export const saveLastSeenChangelogVersion = (version) => setSetting('lastSeenChangelogVersion', version);

// --- Session Recovery ---
export const saveRecoveryState = (state) => setSetting('sessionRecovery', state);
export const getRecoveryState = () => getSetting('sessionRecovery', null);
export const clearRecoveryState = async () => {
  const db = await dbPromise;
  return db.delete(SETTINGS_STORE_NAME, 'sessionRecovery');
};

// --- Biometric Sessions (Hardware-bound Session-Wrapping) ---
export const getBiometricSession = async (vaultId) => {
  return getSetting(`biometric_session_${vaultId}`, null);
};

export const saveBiometricSession = async (sessionData) => {
  if (!sessionData || sessionData.vaultId === undefined) {
    throw new Error("Invalid biometric session: vaultId is required.");
  }
  return setSetting(`biometric_session_${sessionData.vaultId}`, sessionData);
};

export const deleteBiometricSession = async (vaultId) => {
  const db = await dbPromise;
  return db.delete(SETTINGS_STORE_NAME, `biometric_session_${vaultId}`);
};

export const getAllBiometricSessions = async () => {
  const db = await dbPromise;
  const tx = db.transaction(SETTINGS_STORE_NAME, 'readonly');
  const store = tx.objectStore(SETTINGS_STORE_NAME);
  const sessions = [];
  let cursor = await store.openCursor();
  while (cursor) {
    if (typeof cursor.key === 'string' && cursor.key.startsWith('biometric_session_')) {
      sessions.push(cursor.value);
    }
    cursor = await cursor.continue();
  }
  return sessions;
};

export const clearAllBiometricSessions = async () => {
  const db = await dbPromise;
  const tx = db.transaction(SETTINGS_STORE_NAME, 'readwrite');
  const store = tx.objectStore(SETTINGS_STORE_NAME);
  let cursor = await store.openCursor();
  while (cursor) {
    if (typeof cursor.key === 'string' && cursor.key.startsWith('biometric_session_')) {
      await cursor.delete();
    }
    cursor = await cursor.continue();
  }
  await tx.done;
};

// --- Bulk Delete ---
export const deleteAllData = async () => {
  const db = await dbPromise;
  await db.clear(DB_STORE_NAME);
  await db.clear(SETTINGS_STORE_NAME);
};
