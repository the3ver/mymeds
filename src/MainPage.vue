<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { state as appState, lock } from './app-state'
import * as dataService from './modules/common/utils/dataService'
import MedDialog from './modules/meds/components/MedDialog.vue'
import MedList from './modules/meds/components/MedList.vue'
import CalendarPage from './modules/calendar/components/CalendarPage.vue'
import DataDialog from './modules/common/components/DataDialog.vue'

defineProps({
  dataDialogOpen: Boolean,
});
const emit = defineEmits(['update:dataDialogOpen', 'update:activeTab']);

const { t } = useI18n()
const medDialog = ref(false)
const editDialog = ref(false)
const editingIndex = ref(-1)
const currentEditMed = ref({})
const activeTab = ref('meds')
const calendarPageRef = ref(null)

// --- Inactivity Timer & Auto-Lock ---
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(handleLock, INACTIVITY_TIMEOUT);
}

async function handleLock() {
  if (appState.isLocked || appState.isActionPending) return;

  await dataService.saveAndLockDatabase(
    appState.activeDatabaseId,
    appState.activeDatabasePassword,
    appState.decryptedData
  );
  lock();
}

onMounted(() => {
  if (appState.pendingIntent === 'import') {
    emit('update:dataDialogOpen', true);
  }

  window.addEventListener('beforeunload', handleLock);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') handleLock();
  });
  ['mousemove', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
  });
  resetInactivityTimer();
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleLock);
  document.removeEventListener('visibilitychange', handleLock);
  ['mousemove', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    document.removeEventListener(event, resetInactivityTimer);
  });
  clearTimeout(inactivityTimer);
});

// --- Component Logic ---
const openMedDialog = () => {
  medDialog.value = true
}

const addItem = (med) => {
  appState.decryptedData.meds.unshift(med)
}

const deleteItem = (index) => {
  appState.decryptedData.meds.splice(index, 1)
}

const openEditDialog = (index) => {
  editingIndex.value = index
  currentEditMed.value = { ...appState.decryptedData.meds[index] }
  editDialog.value = true
}

const saveEdit = (med) => {
  if (editingIndex.value > -1) {
    appState.decryptedData.meds[editingIndex.value] = med
    editingIndex.value = -1
  }
}

const openCalendarFilter = () => {
  if (calendarPageRef.value) {
    calendarPageRef.value.openFilterDialog()
  }
}

const openCalendarAddDialog = () => {
  if (calendarPageRef.value) {
    calendarPageRef.value.openTypeDialog()
  }
}
</script>

<template>
  <div>
    <v-window v-model="activeTab">
      <v-window-item value="meds">
        <v-container>
          <MedList
            :items="appState.decryptedData.meds"
            @edit="openEditDialog"
            @delete="deleteItem"
          />
          <v-card
            class="mb-4 border-dashed"
            variant="outlined"
            color="grey"
            @click="openMedDialog"
            style="border-style: dashed !important; border-width: 2px;"
          >
            <v-card-text class="d-flex align-center justify-center py-4">
              <v-icon start size="large">mdi-plus</v-icon>
              <span class="text-h6">{{ t('app.addMed') }}</span>
            </v-card-text>
          </v-card>
        </v-container>
      </v-window-item>
      <v-window-item value="calendar">
        <CalendarPage
          :initial-entries="appState.decryptedData.calendar"
          @update:entries="newEntries => appState.decryptedData.calendar = newEntries"
          ref="calendarPageRef"
        />
      </v-window-item>
    </v-window>

    <v-fab
      v-if="activeTab === 'calendar'"
      icon="mdi-plus"
      location="bottom end"
      size="large"
      color="primary"
      app
      appear
      class="mb-14"
      @click="openCalendarAddDialog"
    ></v-fab>

    <v-bottom-navigation v-model="activeTab" color="primary" grow>
      <v-btn value="meds">
        <v-icon>mdi-format-list-bulleted</v-icon>
        <span>{{ t('app.nav.meds') }}</span>
      </v-btn>
      <v-btn value="calendar">
        <v-icon>mdi-calendar-clock</v-icon>
        <span>{{ t('app.nav.calendar') }}</span>
      </v-btn>
    </v-bottom-navigation>

    <MedDialog
      v-model="medDialog"
      :title="t('dialog.addTitle')"
      :confirm-text="t('dialog.add')"
      @confirm="addItem"
    />

    <MedDialog
      v-model="editDialog"
      :med="currentEditMed"
      :title="t('dialog.editTitle')"
      :confirm-text="t('dialog.save')"
      @confirm="saveEdit"
    />

    <DataDialog :model-value="dataDialogOpen" @update:model-value="val => emit('update:dataDialogOpen', val)" />
  </div>
</template>

<style>
/* Global style to prevent pull-to-refresh on this page */
html, body {
  overscroll-behavior-y: contain;
}
</style>

<style scoped>
.border-dashed {
  border-style: dashed !important;
}
</style>
