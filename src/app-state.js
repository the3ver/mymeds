import { reactive, watch } from 'vue';
import * as dataService from './modules/common/utils/dataService';

export const state = reactive({
  isLocked: true,
  isActionPending: false,
  activeDatabaseId: null,
  activeDatabasePassword: null,
  decryptedData: {
    version: 1,
    meds: [],
    calendar: [],
    lastDoseUpdate: null,
  },
  deductions: {}, // To show animations on unlock
});

// --- Debounce Utility ---
function debounce(func, timeout = 500) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

// --- Auto-Save Logic ---
const saveState = debounce(async () => {
  if (state.isLocked || !state.activeDatabaseId) {
    console.log('[app-state] Auto-save skipped: App is locked or no active database.');
    return;
  }

  console.log('[app-state] Auto-saving data...');
  try {
    // We only need to save the main data, not re-encrypt the password
    await dataService.saveAndLockDatabase(
      state.activeDatabaseId,
      state.activeDatabasePassword,
      state.decryptedData
    );
    console.log('[app-state] Auto-save successful.');
  } catch (error) {
    console.error('[app-state] Auto-save failed:', error);
  }
});

// Watch for changes in the decrypted data and trigger the debounced save
watch(() => state.decryptedData, saveState, { deep: true });


// --- State Management Functions ---
export function unlock(id, password, data, deductions = {}) {
  state.activeDatabaseId = id;
  state.activeDatabasePassword = password;
  state.decryptedData.meds = data.meds || [];
  state.decryptedData.calendar = data.calendar || [];
  state.decryptedData.lastDoseUpdate = data.lastDoseUpdate;
  state.deductions = deductions;
  state.decryptedData.version += 1;
  state.isLocked = false;
}

export async function lock() {
  // Ensure the very last changes are saved before locking
  await saveState(); 

  state.activeDatabaseId = null;
  state.activeDatabasePassword = null;
  state.decryptedData.meds = [];
  state.decryptedData.calendar = [];
  state.decryptedData.lastDoseUpdate = null;
  state.deductions = {}; // Clear deductions on lock
  state.isLocked = true;
}
