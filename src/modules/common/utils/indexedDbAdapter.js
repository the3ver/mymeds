import { openDB } from 'idb';

const DB_NAME = 'MyMedsDB';
const DB_VERSION = 1;
const STORES = {
  MEDS: 'meds',
  CALENDAR: 'calendar',
  SETTINGS: 'settings'
};

// --- Database Initialization ---
const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Create stores if they don't exist
    if (!db.objectStoreNames.contains(STORES.MEDS)) {
      db.createObjectStore(STORES.MEDS, { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains(STORES.CALENDAR)) {
      db.createObjectStore(STORES.CALENDAR, { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
      // Use a simple key-value store for settings
      db.createObjectStore(STORES.SETTINGS);
    }
  },
});

// --- Private Helper Functions ---
const getSetting = async (key, defaultValue) => {
  const db = await dbPromise;
  const value = await db.get(STORES.SETTINGS, key);
  return value !== undefined ? value : defaultValue;
};

const setSetting = async (key, value) => {
  const db = await dbPromise;
  // Ensure we are not saving a proxy
  const valueToStore = JSON.parse(JSON.stringify(value));
  return db.put(STORES.SETTINGS, valueToStore, key);
};

// --- Meds Data ---
export async function getMeds() {
  const db = await dbPromise;
  return db.getAll(STORES.MEDS);
}
export async function saveMeds(meds) {
  const db = await dbPromise;
  const tx = db.transaction(STORES.MEDS, 'readwrite');
  await tx.store.clear();
  // Ensure we are not saving proxies
  const plainMeds = JSON.parse(JSON.stringify(meds));
  await Promise.all(plainMeds.map(med => tx.store.add(med)));
  await tx.done;
}
export const getLastDoseUpdate = () => getSetting('lastDoseUpdate', null);
export const setLastDoseUpdate = (date) => setSetting('lastDoseUpdate', date);

// --- Calendar Data ---
export async function getCalendarEntries() {
  const db = await dbPromise;
  return db.getAll(STORES.CALENDAR);
}
export async function saveCalendarEntries(entries) {
  const db = await dbPromise;
  const tx = db.transaction(STORES.CALENDAR, 'readwrite');
  await tx.store.clear();
  // Ensure we are not saving proxies
  const plainEntries = JSON.parse(JSON.stringify(entries));
  await Promise.all(plainEntries.map(entry => tx.store.add(entry)));
  await tx.done;
}

// --- Settings ---
export async function getSettings() {
  return {
    locale: await getSetting('locale', navigator.language.startsWith('de') ? 'de' : 'en'),
    theme: await getSetting('theme', 'light'),
    sortMode: await getSetting('sortMode', 'added'),
    displayMode: await getSetting('displayMode', 'pills'),
    uiScale: await getSetting('uiScale', 'normal'),
    yellowLimit: await getSetting('yellowLimit', 21),
    redLimit: await getSetting('redLimit', 7),
    showOverview: await getSetting('showOverview', true),
  };
}

export const saveLocale = (locale) => setSetting('locale', locale);
export const saveTheme = (theme) => setSetting('theme', theme);
export const saveSortMode = (mode) => setSetting('sortMode', mode);
export const saveDisplayMode = (mode) => setSetting('displayMode', mode);
export const saveUiScale = (scale) => setSetting('uiScale', scale);
export const saveYellowLimit = (limit) => setSetting('yellowLimit', limit);
export const saveRedLimit = (limit) => setSetting('redLimit', limit);
export const saveShowOverview = (show) => setSetting('showOverview', show);

// --- App Meta Data ---
export const getLastVersion = () => getSetting('lastVersion', null);
export const saveLastVersion = (version) => setSetting('lastVersion', version);
export const getFirstRunCompleted = () => getSetting('firstRunCompleted', null);
export const setFirstRunCompleted = () => setSetting('firstRunCompleted', 'true');

// --- Bulk Data Operations ---
export async function exportData() {
  return {
    exportDate: new Date().toISOString(),
    meds: await getMeds(),
    calendar: await getCalendarEntries(),
  };
}

export async function importData(data) {
  if (data && data.meds && data.calendar) {
    await saveMeds(data.meds);
    await saveCalendarEntries(data.calendar);
    return true;
  }
  return false;
}

export async function deleteMedsData() {
  const db = await dbPromise;
  await db.clear(STORES.MEDS);
  await db.delete(STORES.SETTINGS, 'lastDoseUpdate');
}

export async function deleteCalendarData() {
  const db = await dbPromise;
  await db.clear(STORES.CALENDAR);
}

export async function deleteAllData() {
  const db = await dbPromise;
  await Promise.all(Object.values(STORES).map(store => db.clear(store)));
}
