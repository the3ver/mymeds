<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { state as appState } from './app-state';
import MedDialog from './modules/meds/components/MedDialog.vue';
import MedList from './modules/meds/components/MedList.vue';
import CalendarPage from './modules/calendar/components/CalendarPage.vue';
import MorePage from './modules/common/components/MorePage.vue';
import { consumeShortcutIntent } from './modules/common/utils/shortcutService';
import { updateCriticalMedsBadge } from './modules/common/utils/badgingService';
import { getSettings } from './modules/common/utils/dataService';
import { calculateDaysRemaining } from './modules/meds/utils/medUtils';
import { isPendingReferral, getLocalDateString } from './modules/calendar/utils/calendarUtils';
import { showSnackbar } from './modules/common/utils/snackbarService';

const BmpScanDialog = defineAsyncComponent(() => import('./modules/meds/components/BmpScanDialog.vue'));
const BmpExportDialog = defineAsyncComponent(() => import('./modules/meds/components/BmpExportDialog.vue'));
const DataDialog = defineAsyncComponent(() => import('./modules/common/components/DataDialog.vue'));

defineProps({
  dataDialogOpen: Boolean
});
const emit = defineEmits(['update:dataDialogOpen', 'update:activeTab', 'open-whats-new', 'vault-imported']);

const { t } = useI18n();
const medDialog = ref(false);
const bmpScanDialog = ref(false);
const bmpExportDialog = ref(false);
const editDialog = ref(false);
const editingIndex = ref(-1);
const currentEditMed = ref({});
const activeTab = ref('meds');
const calendarPageRef = ref(null);
const medFabMenuOpen = ref(false);
const redLimit = ref(7);

watch(activeTab, (newTab) => {
  medFabMenuOpen.value = false;
  emit('update:activeTab', newTab);
});

const criticalMedsCount = computed(() => {
  const meds = appState.decryptedData?.meds || [];
  return meds.filter((m) => {
    const days = calculateDaysRemaining(m);
    return days !== null && days <= redLimit.value;
  }).length;
});

const pendingReferralsCount = computed(() => {
  const entries = appState.decryptedData?.calendar || [];
  const today = getLocalDateString();
  return entries.filter((e) => isPendingReferral(e, entries, today)).length;
});

// Keep app badge updated when medications change
watch(
  () => appState.decryptedData?.meds,
  async (meds) => {
    try {
      const settings = await getSettings();
      redLimit.value = settings?.redLimit || 7;
      await updateCriticalMedsBadge(meds, redLimit.value);
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
    redLimit.value = settings?.redLimit || 7;
    await updateCriticalMedsBadge(appState.decryptedData?.meds, redLimit.value);
  } catch (err) {
    console.warn('[MainPage] Error updating badge on mount:', err);
  }
});

// --- Component Logic ---
const openMedDialog = () => {
  medFabMenuOpen.value = false;
  medDialog.value = true;
};

const openBmpScan = () => {
  medFabMenuOpen.value = false;
  bmpScanDialog.value = true;
};

const openBmpExport = () => {
  medFabMenuOpen.value = false;
  bmpExportDialog.value = true;
};

const addItem = (med) => {
  appState.decryptedData.meds.unshift(med);
};

const deleteItem = (index) => {
  const removed = appState.decryptedData.meds[index];
  if (!removed) return;
  appState.decryptedData.meds.splice(index, 1);

  showSnackbar({
    text: t('med.deletedToast', { name: removed.name }),
    actionText: t('app.undo'),
    onAction: () => {
      appState.decryptedData.meds.splice(index, 0, removed);
      showSnackbar({ text: t('med.restoredToast', { name: removed.name }), timeout: 2500 });
    }
  });
};

const refillItem = (index) => {
  const med = appState.decryptedData.meds[index];
  const size = parseFloat(med?.packageSize);
  if (!med || !size || size <= 0) return;

  const previousCount = parseFloat(med.count) || 0;
  med.count = previousCount + size;

  showSnackbar({
    text: t('med.refilledToast', { size, name: med.name }),
    actionText: t('app.undo'),
    onAction: () => {
      med.count = previousCount;
      showSnackbar({ text: t('med.refillUndoneToast'), timeout: 2500 });
    }
  });
};

const openEditDialog = (index) => {
  editingIndex.value = index;
  currentEditMed.value = { ...appState.decryptedData.meds[index] };
  editDialog.value = true;
};

const saveEdit = (med) => {
  if (editingIndex.value > -1) {
    appState.decryptedData.meds[editingIndex.value] = med;
    editingIndex.value = -1;
  }
};

const openCalendarFilter = () => {
  if (calendarPageRef.value) {
    calendarPageRef.value.openFilterDialog();
  }
};

const openCalendarAddDialog = () => {
  if (calendarPageRef.value) {
    calendarPageRef.value.openTypeDialog();
  }
};

defineExpose({
  openCalendarFilter,
  activeTab,
  bmpScanDialog,
  bmpExportDialog,
  medFabMenuOpen
});
</script>

<template>
  <div>
    <v-window v-model="activeTab" :touch="false" class="main-tab-window">
      <v-window-item value="meds" :transition="false" :reverse-transition="false">
        <v-container class="main-content-container pb-24 pt-2">
          <MedList
            :items="appState.decryptedData.meds"
            :deductions="appState.deductions"
            @edit="openEditDialog"
            @delete="deleteItem"
            @refill="refillItem"
            data-testid="med-list"
          />
        </v-container>
      </v-window-item>

      <v-window-item value="calendar" :transition="false" :reverse-transition="false">
        <CalendarPage
          :initial-entries="appState.decryptedData.calendar"
          @update:entries="(newEntries) => (appState.decryptedData.calendar = newEntries)"
          ref="calendarPageRef"
        />
      </v-window-item>

      <v-window-item value="more" :transition="false" :reverse-transition="false">
        <MorePage
          @open-data="emit('update:dataDialogOpen', true)"
          @open-whats-new="emit('open-whats-new')"
          @open-bmp-scan="openBmpScan"
          @open-bmp-export="openBmpExport"
          @vault-imported="emit('vault-imported', $event)"
        />
      </v-window-item>
    </v-window>

    <!-- Meds M3 FAB Speed-Dial Overlay -->
    <div
      v-if="activeTab === 'meds' && medFabMenuOpen"
      class="meds-fab-scrim"
      @click="medFabMenuOpen = false"
      aria-hidden="true"
    ></div>

    <div v-if="activeTab === 'meds' && medFabMenuOpen" class="meds-fab-menu d-flex flex-column align-end ga-2">
      <v-btn
        color="surface"
        variant="elevated"
        rounded="pill"
        size="large"
        prepend-icon="mdi-barcode-scan"
        class="meds-fab-action elevation-3"
        @click="openBmpExport"
        data-testid="bmp-export-btn"
      >
        {{ t('app.showBmp') }}
      </v-btn>
      <v-btn
        color="surface"
        variant="elevated"
        rounded="pill"
        size="large"
        prepend-icon="mdi-qrcode-scan"
        class="meds-fab-action elevation-3"
        @click="openBmpScan"
        data-testid="bmp-scan-btn"
      >
        {{ t('app.scanBmp') }}
      </v-btn>
      <v-btn
        color="primary"
        variant="flat"
        rounded="pill"
        size="large"
        prepend-icon="mdi-pill"
        class="meds-fab-action elevation-4"
        @click="openMedDialog"
        data-testid="add-med-btn"
      >
        {{ t('app.addMed') }}
      </v-btn>
    </div>

    <!-- Meds Primary FAB -->
    <v-fab
      v-if="activeTab === 'meds'"
      :icon="medFabMenuOpen ? 'mdi-close' : 'mdi-plus'"
      location="bottom end"
      size="large"
      color="primary"
      app
      appear
      class="mb-16 meds-primary-fab"
      @click="medFabMenuOpen = !medFabMenuOpen"
      data-testid="meds-fab-btn"
    >
      <v-icon :icon="medFabMenuOpen ? 'mdi-close' : 'mdi-plus'" />
      <span class="d-sr-only">{{ t('med.actionsMenu') }}</span>
    </v-fab>

    <!-- Calendar Primary FAB -->
    <v-fab
      v-if="activeTab === 'calendar'"
      icon="mdi-plus"
      location="bottom end"
      size="large"
      color="primary"
      app
      appear
      class="mb-16"
      @click="openCalendarAddDialog"
    >
      <v-icon icon="mdi-plus" />
      <span class="d-sr-only">{{ t('calendar.add') }}</span>
    </v-fab>

    <!-- 3-Destination Material 3 Bottom Navigation Bar -->
    <v-bottom-navigation v-model="activeTab" color="primary" bg-color="surface-light" grow class="m3-bottom-nav">
      <v-btn value="meds" data-testid="nav-tab-meds">
        <v-badge :model-value="criticalMedsCount > 0" :content="criticalMedsCount" color="error" offset-x="-4">
          <v-icon>mdi-pill</v-icon>
        </v-badge>
        <span>{{ t('app.nav.meds') }}</span>
      </v-btn>
      <v-btn value="calendar" data-testid="nav-tab-calendar">
        <v-badge
          :model-value="pendingReferralsCount > 0"
          :content="pendingReferralsCount"
          color="warning"
          offset-x="-4"
        >
          <v-icon>mdi-calendar-clock</v-icon>
        </v-badge>
        <span>{{ t('app.nav.calendar') }}</span>
      </v-btn>
      <v-btn value="more" data-testid="nav-tab-more">
        <v-icon>mdi-tune-variant</v-icon>
        <span>{{ t('app.nav.more') }}</span>
      </v-btn>
    </v-bottom-navigation>

    <MedDialog v-model="medDialog" :title="t('dialog.addTitle')" :confirm-text="t('dialog.add')" @confirm="addItem" />

    <MedDialog
      v-model="editDialog"
      :med="currentEditMed"
      :title="t('dialog.editTitle')"
      :confirm-text="t('dialog.save')"
      @confirm="saveEdit"
    />

    <BmpScanDialog v-if="bmpScanDialog" v-model="bmpScanDialog" />

    <BmpExportDialog v-if="bmpExportDialog" v-model="bmpExportDialog" />

    <DataDialog
      v-if="dataDialogOpen"
      :model-value="dataDialogOpen"
      @update:model-value="(val) => emit('update:dataDialogOpen', val)"
    />
  </div>
</template>

<style scoped>
.main-tab-window {
  overflow-x: hidden;
}
.main-content-container {
  max-width: 680px;
}
.meds-fab-scrim {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.42);
  z-index: 1004;
}
.meds-fab-menu {
  position: fixed;
  right: 16px;
  bottom: 148px;
  z-index: 1006;
  max-width: calc(100vw - 32px);
}
.meds-fab-action {
  max-width: 100%;
}
.meds-primary-fab {
  z-index: 1006 !important;
}
</style>
