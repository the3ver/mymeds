<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as dataService from '../../common/utils/dataService';
import MedCard from './MedCard.vue';
import CalendarDialog from '../../common/components/CalendarDialog.vue';
import ConfirmDialog from '../../common/components/ConfirmDialog.vue';
import { parseDose, calculateDaysRemaining, getStatusColor } from '../utils/medUtils';

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  deductions: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['edit', 'delete', 'refill']);
const { t, locale } = useI18n();

const sortMode = ref('added');
const displayMode = ref('pills');
const yellowLimit = ref(21);
const redLimit = ref(7);
const calendarDialog = ref(false);
const confirmDeleteDialog = ref(false);
const medIndexToDelete = ref(-1);

const medToDelete = computed(() => {
  if (medIndexToDelete.value > -1 && props.items[medIndexToDelete.value]) {
    return props.items[medIndexToDelete.value];
  }
  return null;
});

function requestDelete(index) {
  medIndexToDelete.value = index;
  confirmDeleteDialog.value = true;
}

function confirmDelete() {
  if (medIndexToDelete.value > -1) {
    emit('delete', medIndexToDelete.value);
    medIndexToDelete.value = -1;
  }
  confirmDeleteDialog.value = false;
}

async function updateSettings() {
  const settings = await dataService.getSettings();
  if (settings?.sortMode) sortMode.value = settings.sortMode;
  if (settings?.displayMode) displayMode.value = settings.displayMode;
  if (settings?.yellowLimit !== undefined) yellowLimit.value = settings.yellowLimit;
  if (settings?.redLimit !== undefined) redLimit.value = settings.redLimit;
}

async function setDisplayMode(mode) {
  displayMode.value = mode;
  if (typeof dataService.saveDisplayMode === 'function') {
    await dataService.saveDisplayMode(mode);
  }
  window.dispatchEvent(new Event('storage-display-mode-changed'));
}

async function cycleSortMode() {
  const order = ['days', 'name', 'added'];
  const next = order[(order.indexOf(sortMode.value) + 1) % order.length];
  sortMode.value = next;
  if (typeof dataService.saveSortMode === 'function') {
    await dataService.saveSortMode(next);
  }
  window.dispatchEvent(new Event('storage-sort-mode-changed'));
}

const sortLabel = computed(() => {
  if (sortMode.value === 'days') return t('app.sortDays');
  if (sortMode.value === 'name') return t('app.sortName');
  return t('app.sortAdded');
});

onMounted(() => {
  updateSettings();
  window.addEventListener('storage-sort-mode-changed', updateSettings);
  window.addEventListener('storage-display-mode-changed', updateSettings);
  window.addEventListener('storage-limits-changed', updateSettings);
});

onUnmounted(() => {
  window.removeEventListener('storage-sort-mode-changed', updateSettings);
  window.removeEventListener('storage-display-mode-changed', updateSettings);
  window.removeEventListener('storage-limits-changed', updateSettings);
});

const sortedItems = computed(() => {
  const itemsWithIndex = props.items.map((item, index) => ({ ...item, originalIndex: index }));

  if (sortMode.value === 'name') {
    return itemsWithIndex.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortMode.value === 'days') {
    return itemsWithIndex.sort((a, b) => {
      const doseA = parseDose(a.dose);
      const doseB = parseDose(b.dose);

      if (doseA <= 0 && doseB <= 0) return 0;
      if (doseA <= 0) return 1;
      if (doseB <= 0) return -1;

      const daysA = a.count / doseA;
      const daysB = b.count / doseB;
      return daysA - daysB;
    });
  }

  return itemsWithIndex;
});

const overviewData = computed(() => {
  if (props.items.length === 0) return null;

  let minDays = Infinity;
  let hasValidMeds = false;

  for (const item of props.items) {
    const days = calculateDaysRemaining(item);
    if (days !== null) {
      hasValidMeds = true;
      if (days < minDays) {
        minDays = days;
      }
    }
  }

  if (!hasValidMeds || minDays === Infinity) return null;

  const date = new Date();
  date.setDate(date.getDate() + minDays);

  const options = { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formattedDate = date.toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US', options);

  const status = getStatusColor(minDays, yellowLimit.value, redLimit.value);

  return {
    date: formattedDate,
    days: minDays,
    status: status,
    isCritical: status !== null,
    rawDate: date
  };
});

const calendarDate = computed(() => {
  if (!overviewData.value) return null;

  const emptyDate = new Date(overviewData.value.rawDate);
  const reminderDate = new Date(emptyDate);
  reminderDate.setDate(reminderDate.getDate() - yellowLimit.value);

  const now = new Date();
  if (reminderDate < now) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }

  return reminderDate;
});

const calendarDateFormatted = computed(() => {
  if (!calendarDate.value) return '';
  const options = { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' };
  return calendarDate.value.toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US', options);
});
</script>

<template>
  <div v-if="items.length > 0">
    <!-- M3 High-Contrast Overview Status Banner -->
    <v-card v-if="overviewData" class="mb-3" :color="overviewData.status || 'success'" variant="tonal" rounded="xl">
      <div class="d-flex align-center justify-space-between pa-3 ga-2">
        <div class="d-flex align-center ga-3 min-width-0">
          <v-icon size="22" class="flex-shrink-0">
            {{ overviewData.isCritical ? 'mdi-alert-outline' : 'mdi-check-circle-outline' }}
          </v-icon>
          <div class="text-body-2 font-weight-bold">
            {{
              overviewData.isCritical
                ? t('app.overviewTextCritical', { date: overviewData.date, days: overviewData.days }, overviewData.days)
                : t('app.overviewText', { date: overviewData.date })
            }}
          </div>
        </div>
        <v-btn
          icon="mdi-calendar-plus"
          variant="text"
          size="default"
          :aria-label="t('calendar.title')"
          @click="calendarDialog = true"
        ></v-btn>
      </div>
    </v-card>

    <!-- Direct Display Mode & Sort Controls -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
      <div class="d-flex align-center ga-1 quick-mode-group pa-1 rounded-pill">
        <v-btn
          size="small"
          rounded="pill"
          :variant="displayMode === 'pills' ? 'flat' : 'text'"
          :color="displayMode === 'pills' ? 'primary' : undefined"
          @click="setDisplayMode('pills')"
          data-testid="quick-display-pills"
        >
          {{ t('app.showPills') }}
        </v-btn>
        <v-btn
          size="small"
          rounded="pill"
          :variant="displayMode === 'days' ? 'flat' : 'text'"
          :color="displayMode === 'days' ? 'primary' : undefined"
          @click="setDisplayMode('days')"
          data-testid="quick-display-days"
        >
          {{ t('app.showDays') }}
        </v-btn>
        <v-btn
          size="small"
          rounded="pill"
          :variant="displayMode === 'packages' ? 'flat' : 'text'"
          :color="displayMode === 'packages' ? 'primary' : undefined"
          @click="setDisplayMode('packages')"
          data-testid="quick-display-packages"
        >
          {{ t('app.showPackages') }}
        </v-btn>
      </div>

      <v-btn
        size="small"
        variant="tonal"
        color="secondary"
        rounded="pill"
        prepend-icon="mdi-sort"
        @click="cycleSortMode"
        data-testid="quick-sort-btn"
      >
        {{ sortLabel }}
      </v-btn>
    </div>

    <MedCard
      v-for="item in sortedItems"
      :key="item.originalIndex"
      :item="item"
      :deduction="deductions[item.name]"
      @edit="emit('edit', item.originalIndex)"
      @delete="requestDelete(item.originalIndex)"
      @refill="emit('refill', item.originalIndex)"
    />

    <CalendarDialog
      v-if="overviewData"
      v-model="calendarDialog"
      :date="calendarDateFormatted"
      :raw-date="calendarDate"
    />

    <ConfirmDialog
      v-model="confirmDeleteDialog"
      :title="t('med.deleteTitle')"
      :message="medToDelete ? t('med.deleteConfirmNamed', { name: medToDelete.name }) : t('med.deleteConfirm')"
      :confirm-text="t('dialog.delete')"
      :cancel-text="t('dialog.cancel')"
      @confirm="confirmDelete"
    />
  </div>
  <div v-else class="text-center mt-14 px-4 text-medium-emphasis">
    <v-avatar color="primary" variant="tonal" size="64" rounded="xl" class="mb-4">
      <v-icon size="34">mdi-pill</v-icon>
    </v-avatar>
    <div class="text-subtitle-1 font-weight-medium">{{ t('app.noMeds') }}</div>
  </div>
</template>

<style scoped>
.quick-mode-group {
  background-color: rgb(var(--v-theme-surface-light));
  border: 1px solid rgba(var(--v-border-color), 0.4);
}
.min-width-0 {
  min-width: 0;
}
</style>
