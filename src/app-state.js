import { reactive } from 'vue';

export const state = reactive({
  isLocked: true,
  activeDatabaseId: null,
  activeDatabasePassword: null,
  decryptedData: {
    version: 1, // A simple key to force re-rendering on major data changes
    meds: [],
    calendar: [],
  },
});

export function unlock(id, password, data) {
  state.activeDatabaseId = id;
  state.activeDatabasePassword = password;
  state.decryptedData.meds = data.meds || [];
  state.decryptedData.calendar = data.calendar || [];
  state.decryptedData.version += 1; // Increment version to trigger re-render
  state.isLocked = false;
}

export function lock() {
  // Clear sensitive data from memory
  state.activeDatabaseId = null;
  state.activeDatabasePassword = null;
  state.decryptedData.meds = [];
  state.decryptedData.calendar = [];
  state.isLocked = true;
}
