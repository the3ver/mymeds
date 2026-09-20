<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { state as appState } from './app-state'
import MedDialog from './modules/meds/components/MedDialog.vue'
import MedList from './modules/meds/components/MedList.vue'
import BmpScanDialog from './modules/meds/components/BmpScanDialog.vue'
import BmpExportDialog from './modules/meds/components/BmpExportDialog.vue'
import CalendarPage from './modules/calendar/components/CalendarPage.vue'
import DataDialog from './modules/common/components/DataDialog.vue'
import { consumeShortcutIntent } from './modules/common/utils/shortcutService'
import { updateCriticalMedsBadge } from './modules/common/utils/badgingService'
import { getSettings } from './modules/common/utils/dataService'

defineProps({
  dataDialogOpen: Boolean,
});
const emit = defineEmits(['update:dataDialogOpen', 'update:activeTab']);

const { t } = useI18n()
const medDialog = ref(false)
const bmpScanDialog = ref(false)
const bmpExportDialog = ref(false)
const editDialog = ref(false)
const editingIndex = ref(-1)
const currentEditMed = ref({})
const activeTab = ref('meds')
const calendarPageRef = ref(null)

watch(activeTab, (newTab) => {
  emit('update:activeTab', newTab);
});

// Keep app badge updated when medications change
watch(
  () => appState.decryptedData?.meds,
  async (meds) => {
    try {
      const settings = await getSettings();
      await updateCriticalMedsBadge(meds, settings?.redLimit || 7);
    } catch (err) {
      console.warn('[MainPage] Error updating badge on meds change:', err);
    }
  },
  { deep: true }
);

onMounted(async () => {
  if (appState.pendingIntent === 'import') {
    emit('update:dataDialogOpen', true);
  }

  // Handle shortcut intents (e.g. from homescreen app shortcuts)
  const intent = consumeShortcutIntent();
  if (intent.tab) {
    activeTab.value = intent.tab;
  }
  if (intent.action === 'scan') {
    bmpScanDialog.value = true;
  }

  // Initial badge update for critical meds
  try {
    const settings = await getSettings();
    await updateCriticalMedsBadge(appState.decryptedData?.meds, settings?.redLimit || 7);
  } catch (err) {
    console.warn('[MainPage] Error updating badge on mount:', err);
  }
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

defineExpose({
  openCalendarFilter,
});
</script>

<template>
  <div>
    <v-window v-model="activeTab">
      <v-window-item value="meds">
        <v-container>
          <MedList
            :items="appState.decryptedData.meds"
            :deductions="appState.deductions"
            @edit="openEditDialog"
            @delete="deleteItem"
            data-testid="med-list"
          />
          <v-card
            class="mb-3 border-dashed"
            variant="outlined"
            color="grey"
            @click="openMedDialog"
            style="border-style: dashed !important; border-width: 2px;"
          >
            <v-card-text class="d-flex align-center justify-center py-3">
              <v-icon start size="large">mdi-plus</v-icon>
              <span class="text-subtitle-1 font-weight-medium">{{ t('app.addMed') }}</span>
            </v-card-text>
          </v-card>

          <v-btn
            block
            color="primary"
            variant="tonal"
            size="large"
            prepend-icon="mdi-qrcode-scan"
            class="mb-3"
            @click="bmpScanDialog = true"
          >
            {{ t('app.scanBmp') }}
          </v-btn>

          <v-btn
            block
            color="secondary"
            variant="outlined"
            size="large"
            prepend-icon="mdi-barcode-scan"
            class="mb-4"
            @click="bmpExportDialog = true"
          >
            {{ t('app.showBmp') }}
          </v-btn>
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

    <BmpScanDialog v-model="bmpScanDialog" />

    <BmpExportDialog v-model="bmpExportDialog" />

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
