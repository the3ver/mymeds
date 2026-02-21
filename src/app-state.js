import { reactive } from 'vue';

export const state = reactive({
  isLocked: true,
  activeDatabaseId: null,
  activeDatabasePassword: null, // IMPORTANT: This will be cleared when locked
  decryptedData: {
    meds: [],
    calendar: [],
  },
  pendingIntent: null, // e.g., 'import'
});

export function unlock(id, password, data) {
  state.activeDatabaseId = id;
  state.activeDatabasePassword = password;
  state.decryptedData = data;
  state.isLocked = false;
}

export function lock() {
  // Clear sensitive data from memory
  state.activeDatabaseId = null;
  state.activeDatabasePassword = null;
  state.decryptedData = { meds: [], calendar: [] };
  state.isLocked = true;
  state.pendingIntent = null;
}
