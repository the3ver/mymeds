import { reactive } from 'vue';

export const state = reactive({
  isLocked: true,
  isActionPending: false, // Prevents auto-locking during sensitive operations like file picking
  activeDatabaseId: null,
  activeDatabasePassword: null,
  decryptedData: {
    version: 1,
    meds: [],
    calendar: [],
  },
});

export function unlock(id, password, data) {
  state.activeDatabaseId = id;
  state.activeDatabasePassword = password;
  state.decryptedData.meds = data.meds || [];
  state.decryptedData.calendar = data.calendar || [];
  state.decryptedData.version += 1;
  state.isLocked = false;
}

export function lock() {
  state.activeDatabaseId = null;
  state.activeDatabasePassword = null;
  state.decryptedData.meds = [];
  state.decryptedData.calendar = [];
  state.isLocked = true;
}
