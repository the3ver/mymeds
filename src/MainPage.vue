<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { state as appState, lock } from './app-state'
import * as dataService from './modules/common/utils/dataService'
import MedDialog from './modules/meds/components/MedDialog.vue'
import NavDrawer from './modules/common/components/NavDrawer.vue'
import MedList from './modules/meds/components/MedList.vue'
import CalendarPage from './modules/calendar/components/CalendarPage.vue'

const theme = useTheme()
const { t } = useI18n()
const drawer = ref(false)
const dialog = ref(false)
const editDialog = ref(false)
const editingIndex = ref(-1)
const currentEditMed = ref({})
const activeTab = ref('meds')
const calendarPageRef = ref(null)

// --- Inactivity Timer ---
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(async () => {
    await handleLock();
  }, INACTIVITY_TIMEOUT);
}

async function handleLock() {
  if (!appState.isLocked) {
    await dataService.saveAndLockDatabase(
      appState.activeDatabaseId,
      appState.activeDatabasePassword,
      appState.decryptedData
    );
    lock();
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleLock);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      handleLock();
    }
  });
  // Reset timer on user activity
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
const openDialog = () => {
  dialog.value = true
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
  <NavDrawer v-model="drawer" />

  <v-app-bar
    :color="theme.global.current.value.dark ? 'surface' : 'primary'"
    density="compact"
  >
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </template>
    <v-app-bar-title>
      {{ t('app.title') }}
      <span v-if="activeTab === 'meds'" class="text-subtitle-1 ml-2 opacity-70">- {{ t('app.nav.meds') }}</span>
      <span v-else-if="activeTab === 'calendar'" class="text-subtitle-1 ml-2 opacity-70">- {{ t('app.nav.calendar') }}</span>
    </v-app-bar-title>
    <template v-slot:append>
      <v-btn
        v-if="activeTab === 'calendar'"
        icon="mdi-filter-variant"
        @click="openCalendarFilter"
      ></v-btn>
      <v-btn icon="mdi-lock" @click="handleLock"></v-btn>
    </template>
  </v-app-bar>

  <v-main>
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
            @click="openDialog"
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
  </v-main>

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
    v-model="dialog"
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
</template>

<style scoped>
.border-dashed {
  border-style: dashed !important;
}
.opacity-70 {
  opacity: 0.7;
}
</style>
