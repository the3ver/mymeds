// This file is the central data access point for the app.
// It uses an adapter to abstract the underlying storage mechanism.
// To switch from localStorage to IndexedDB, only this file needs to be changed.

import * as storageAdapter from './indexedDbAdapter';

// --- Meds Data ---
export const getMeds = storageAdapter.getMeds;
export const saveMeds = storageAdapter.saveMeds;
export const getLastDoseUpdate = storageAdapter.getLastDoseUpdate;
export const setLastDoseUpdate = storageAdapter.setLastDoseUpdate;

// --- Calendar Data ---
export const getCalendarEntries = storageAdapter.getCalendarEntries;
export const saveCalendarEntries = storageAdapter.saveCalendarEntries;

// --- Settings ---
export const getSettings = storageAdapter.getSettings;
export const saveLocale = storageAdapter.saveLocale;
export const saveTheme = storageAdapter.saveTheme;
export const saveSortMode = storageAdapter.saveSortMode;
export const saveDisplayMode = storageAdapter.saveDisplayMode;
export const saveUiScale = storageAdapter.saveUiScale;
export const saveYellowLimit = storageAdapter.saveYellowLimit;
export const saveRedLimit = storageAdapter.saveRedLimit;
export const saveShowOverview = storageAdapter.saveShowOverview;

// --- App Meta Data ---
export const getLastVersion = storageAdapter.getLastVersion;
export const saveLastVersion = storageAdapter.saveLastVersion;
export const getFirstRunCompleted = storageAdapter.getFirstRunCompleted;
export const setFirstRunCompleted = storageAdapter.setFirstRunCompleted;

// --- Bulk Data Operations ---
export const exportData = storageAdapter.exportData;
export const importData = storageAdapter.importData;
export const deleteMedsData = storageAdapter.deleteMedsData;
export const deleteCalendarData = storageAdapter.deleteCalendarData;
export const deleteAllData = storageAdapter.deleteAllData;
