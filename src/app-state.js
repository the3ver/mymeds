import { reactive } from 'vue';

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

export function lock() {
  state.activeDatabaseId = null;
  state.activeDatabasePassword = null;
  state.decryptedData.meds = [];
  state.decryptedData.calendar = [];
  state.decryptedData.lastDoseUpdate = null;
  state.deductions = {}; // Clear deductions on lock
  state.isLocked = true;
}
