<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import EntryTypeDialog from './EntryTypeDialog.vue';
import CalendarEntryDialog from './CalendarEntryDialog.vue';
import ConfirmDialog from '../../common/components/ConfirmDialog.vue';
import FilterDialog from './FilterDialog.vue';
import {
  createDetailedCalendarEvent,
  compareEntries,
  formatEntryTime,
  resolveEffectiveReferralStatus,
  isPendingReferral,
  getLocalDateString
} from '../utils/calendarUtils';
import { renderMarkdownLinks } from '../../common/utils/stringUtils';
import { showSnackbar } from '../../common/utils/snackbarService';

const props = defineProps({
  initialEntries: {
    type: Array,
    required: true
  }
});
const emit = defineEmits(['update:entries']);

const { t, locale } = useI18n();
const entries = ref(props.initialEntries);
const typeDialog = ref(false);
const entryDialog = ref(false);
const exportDialog = ref(false);
const filterDialog = ref(false);
const currentEntry = ref({});
const editingIndex = ref(-1);
const detailEntryIndex = ref(-1);
const detailSheetOpen = ref(false);
const lastAddedEntry = ref(null);
const filterTypes = ref([]);

watch(
  entries,
  (newVal) => {
    emit('update:entries', newVal);
  },
  { deep: true }
);

onMounted(() => {
  nextTick(() => {
    const todayEl = document.getElementById('separator-today');
    if (todayEl) {
      todayEl.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  });
});

const sortedEntries = computed(() => {
  let filtered = entries.value.map((item, index) => ({ ...item, originalIndex: index }));

  if (filterTypes.value.length > 0) {
    const hasOpenReferrals = filterTypes.value.includes('open_referrals');
    const regularTypes = filterTypes.value.filter((ft) => ft !== 'open_referrals');
    const today = getLocalDateString();

    filtered = filtered.filter((entry) => {
      const matchesOpen = hasOpenReferrals && isPendingReferral(entry, entries.value, today);
      const matchesType = regularTypes.length > 0 && regularTypes.includes(entry.type);

      if (hasOpenReferrals && regularTypes.length > 0) {
        return matchesOpen || matchesType;
      }
      if (hasOpenReferrals) {
        return matchesOpen;
      }
      return matchesType;
    });
  }

  const sorted = filtered.sort(compareEntries);

  return sorted.map((entry) => {
    if (entry.type === 'doctor' && entry.needsReferral) {
      return { ...entry, effectiveReferralStatus: resolveEffectiveReferralStatus(entry, entries.value) || 'needed' };
    }
    return entry;
  });
});

const selectedDetailEntry = computed(() => {
  if (detailEntryIndex.value < 0) return null;
  const raw = entries.value[detailEntryIndex.value];
  if (!raw) return null;
  const enriched = { ...raw, originalIndex: detailEntryIndex.value };
  if (enriched.type === 'doctor' && enriched.needsReferral) {
    enriched.effectiveReferralStatus = resolveEffectiveReferralStatus(enriched, entries.value) || 'needed';
  }
  return enriched;
});

const groupedEntries = computed(() => {
  const today = getLocalDateString();
  const combined = [...sortedEntries.value];

  if (combined.length > 0) {
    const minDate = new Date(combined[combined.length - 1].date);
    const maxDate = new Date(combined[0].date);

    const now = new Date();
    if (now > maxDate) maxDate.setTime(now.getTime());

    let current = new Date(minDate.getFullYear(), Math.floor(minDate.getMonth() / 3) * 3, 1);

    while (current <= maxDate) {
      const qDate = new Date(current);
      const qStr = getLocalDateString(qDate);
      const q = Math.floor((qDate.getMonth() + 3) / 3);
      const y = qDate.getFullYear();

      combined.push({
        date: qStr,
        title: t('calendar.quarter', { q, year: y }),
        type: 'quarter',
        isVirtual: true
      });
      current.setMonth(current.getMonth() + 3);
    }
  }

  combined.sort(compareEntries);

  const finalResult = [];
  let todayInsertedLoop = false;

  for (const entry of combined) {
    if (!todayInsertedLoop && entry.date < today) {
      finalResult.push({ type: 'separator-today', date: today });
      todayInsertedLoop = true;
    }
    if (entry.isVirtual) {
      finalResult.push({ type: 'quarter', data: entry });
    } else {
      finalResult.push({ type: 'entry', data: entry });
    }
  }

  if (!todayInsertedLoop) {
    finalResult.push({ type: 'separator-today', date: today });
  }

  return finalResult;
});

const formatDate = (dateStr, forceShort = false) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentQuarter = Math.floor(today.getMonth() / 3);
  const dateQuarter = Math.floor(date.getMonth() / 3);

  const isFuture = date >= today;
  const isRecentPast = date.getFullYear() === today.getFullYear() && dateQuarter === currentQuarter;

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };

  if ((isFuture || isRecentPast) && !forceShort) {
    options.weekday = 'short';
  }

  return date.toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US', options);
};

const getEntryIcon = (type) => {
  switch (type) {
    case 'doctor':
      return 'mdi-doctor';
    case 'vaccination':
      return 'mdi-needle';
    case 'illness':
      return 'mdi-emoticon-sick';
    case 'note':
      return 'mdi-note-text';
    case 'quarter':
      return 'mdi-calendar-range';
    default:
      return 'mdi-calendar';
  }
};

const getEntryColor = (type) => {
  switch (type) {
    case 'doctor':
      return 'primary';
    case 'vaccination':
      return 'tertiary';
    case 'illness':
      return 'warning';
    case 'note':
      return 'secondary';
    case 'quarter':
      return 'grey';
    default:
      return 'grey';
  }
};

const getEntrySubtitle = (entry) => {
  const time = formatEntryTime(entry.time, locale.value);
  const dateStr = time ? `${formatDate(entry.date)}, ${time}` : formatDate(entry.date);
  if (entry.type === 'illness' && entry.endDate) {
    const start = new Date(entry.date);
    const end = new Date(entry.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${dateStr} - ${formatDate(entry.endDate, true)} (${diffDays} ${t('app.showDays')})`;
  }
  return dateStr;
};

const REFERRAL_STATUS_CONFIG = {
  submitted: { color: 'success', icon: 'mdi-check-circle' },
  present: { color: 'info', icon: 'mdi-file-check' },
  needed: { color: 'warning', icon: 'mdi-file-clock' }
};

const getReferralChipColor = (status) => (REFERRAL_STATUS_CONFIG[status] || REFERRAL_STATUS_CONFIG.needed).color;
const getReferralChipIcon = (status) => (REFERRAL_STATUS_CONFIG[status] || REFERRAL_STATUS_CONFIG.needed).icon;

const openTypeDialog = () => {
  typeDialog.value = true;
};

const onTypeSelected = (type) => {
  currentEntry.value = {
    type,
    date: getLocalDateString(),
    time: '',
    title: '',
    doctor: '',
    doctorType: '',
    location: '',
    agent: '',
    method: '',
    bodyPart: '',
    pathogen: '',
    symptoms: '',
    endDate: '',
    notes: '',
    treatments: '',
    needsReferral: type === 'doctor',
    referralStatus: 'needed'
  };
  editingIndex.value = -1;
  entryDialog.value = true;
};

const addEntry = (entry) => {
  entries.value.push(entry);
  const today = getLocalDateString();
  if (entry.date >= today) {
    lastAddedEntry.value = entry;
    exportDialog.value = true;
  }
};

const openDetailSheet = (index) => {
  detailEntryIndex.value = index;
  detailSheetOpen.value = true;
};

const openEditDialog = (entry) => {
  detailSheetOpen.value = false;
  currentEntry.value = { ...entry };
  if (Array.isArray(currentEntry.value.treatments)) {
    currentEntry.value.treatments = currentEntry.value.treatments.join(', ');
  } else if (!currentEntry.value.treatments) {
    currentEntry.value.treatments = '';
  }
  editingIndex.value = entry.originalIndex;
  entryDialog.value = true;
};

const saveEntry = (entry) => {
  if (editingIndex.value > -1) {
    entries.value[editingIndex.value] = entry;
    editingIndex.value = -1;
  } else {
    addEntry(entry);
  }
};

const confirmDeleteDialog = ref(false);
const entryIndexToDelete = ref(-1);
const entryToDelete = computed(() => {
  if (entryIndexToDelete.value > -1 && entries.value[entryIndexToDelete.value]) {
    return entries.value[entryIndexToDelete.value];
  }
  return null;
});

const requestDeleteEntry = (index) => {
  detailSheetOpen.value = false;
  entryIndexToDelete.value = index;
  confirmDeleteDialog.value = true;
};

const confirmDelete = () => {
  if (entryIndexToDelete.value > -1) {
    const idx = entryIndexToDelete.value;
    const removed = entries.value[idx];
    entries.value.splice(idx, 1);
    entryIndexToDelete.value = -1;
    detailEntryIndex.value = -1;
    detailSheetOpen.value = false;

    if (removed) {
      showSnackbar({
        text: t('calendar.deletedToast', { name: removed.title }),
        actionText: t('app.undo'),
        onAction: () => {
          entries.value.splice(idx, 0, removed);
          showSnackbar({ text: t('calendar.restoredToast', { name: removed.title }), timeout: 2500 });
        }
      });
    }
  }
  confirmDeleteDialog.value = false;
};

const exportToCalendar = (entry) => {
  createDetailedCalendarEvent(entry);
};

const confirmExport = () => {
  if (lastAddedEntry.value) {
    exportToCalendar(lastAddedEntry.value);
    lastAddedEntry.value = null;
  }
};

const clearFilter = () => {
  filterTypes.value = [];
};

const removeFilter = (filterType) => {
  filterTypes.value = filterTypes.value.filter((ft) => ft !== filterType);
};

const toggleFilterChip = (filterType) => {
  if (filterTypes.value.includes(filterType)) {
    removeFilter(filterType);
  } else {
    filterTypes.value = [...filterTypes.value, filterType];
  }
};

const filterText = computed(() => {
  const regularTypes = filterTypes.value.filter((ft) => ft !== 'open_referrals');
  if (regularTypes.length === 0) return '';
  const typeNames = regularTypes.map((type) => t(`calendar.types.${type}`)).join(', ');
  return t('calendar.filterBy', { types: typeNames });
});

const existingTreatments = computed(() => {
  const treatments = new Set();
  const regex = /#([^#]+)#/g;
  entries.value.forEach((entry) => {
    if (typeof entry.treatments === 'string') {
      let match;
      while ((match = regex.exec(entry.treatments)) !== null) {
        treatments.add(match[1]);
      }
    } else if (Array.isArray(entry.treatments)) {
      entry.treatments.forEach((tr) => treatments.add(tr));
    }
  });
  return Array.from(treatments).sort();
});

const parseTreatmentText = (text) => {
  if (!text) return [];
  const segments = [];
  const regex = /#([^#]+)#/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    segments.push({ type: 'tag', content: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.substring(lastIndex) });
  }
  return segments;
};

const openFilterDialog = () => {
  filterDialog.value = true;
};

const pendingReferralsCount = computed(() => {
  const today = getLocalDateString();
  return entries.value.filter((e) => isPendingReferral(e, entries.value, today)).length;
});

const inlineFilterItems = computed(() => [
  { value: 'open_referrals', label: t('calendar.referral.filter'), icon: 'mdi-file-alert-outline', color: 'warning' },
  { value: 'doctor', label: t('calendar.types.doctor'), icon: 'mdi-doctor', color: 'primary' },
  { value: 'vaccination', label: t('calendar.types.vaccination'), icon: 'mdi-needle', color: 'tertiary' },
  { value: 'illness', label: t('calendar.types.illness'), icon: 'mdi-emoticon-sick', color: 'warning' },
  { value: 'note', label: t('calendar.types.note'), icon: 'mdi-note-text', color: 'secondary' }
]);

defineExpose({
  openFilterDialog,
  openTypeDialog,
  requestDeleteEntry,
  confirmDelete,
  confirmDeleteDialog,
  entries,
  pendingReferralsCount,
  filterTypes,
  clearFilter,
  removeFilter,
  filterText,
  groupedEntries,
  sortedEntries,
  filterDialog,
  typeDialog
});
</script>

<template>
  <v-container class="calendar-container pb-fab pt-2">
    <!-- Referral Alert Banner -->
    <v-alert
      v-if="pendingReferralsCount > 0"
      type="warning"
      variant="tonal"
      density="comfortable"
      rounded="xl"
      icon="mdi-alert-circle-outline"
      class="mb-3 referral-alert-banner"
    >
      <div class="d-flex align-center justify-space-between ga-2 flex-wrap">
        <span class="text-body-2 font-weight-medium">
          {{ t('calendar.referral.banner.message', pendingReferralsCount, { count: pendingReferralsCount }) }}
        </span>
        <v-btn
          size="small"
          variant="tonal"
          color="warning"
          rounded="pill"
          @click="filterTypes = ['open_referrals']"
          data-testid="banner-show-referrals-btn"
        >
          {{ t('calendar.showPendingReferrals') }}
        </v-btn>
      </div>
    </v-alert>

    <!-- Multi-line Wrapped M3 Filter Chips (All filters visible at once, zero horizontal overflow) -->
    <div class="d-flex flex-wrap ga-2 mb-4" data-testid="calendar-inline-filters">
      <v-chip
        :variant="filterTypes.length === 0 ? 'flat' : 'outlined'"
        :color="filterTypes.length === 0 ? 'primary' : undefined"
        size="small"
        rounded="pill"
        role="button"
        tabindex="0"
        :aria-pressed="filterTypes.length === 0"
        class="cursor-pointer filter-chip-item"
        @click="clearFilter"
      >
        <v-icon v-if="filterTypes.length === 0" start size="15">mdi-check</v-icon>
        {{ t('calendar.filterAll') }}
      </v-chip>

      <v-chip
        v-for="f in inlineFilterItems"
        :key="f.value"
        :variant="filterTypes.includes(f.value) ? 'flat' : 'outlined'"
        :color="filterTypes.includes(f.value) ? f.color : undefined"
        :closable="filterTypes.includes(f.value)"
        size="small"
        rounded="pill"
        role="button"
        tabindex="0"
        :aria-pressed="filterTypes.includes(f.value)"
        class="cursor-pointer filter-chip-item"
        :class="{
          'open-referrals-filter-chip': f.value === 'open_referrals' && filterTypes.includes('open_referrals')
        }"
        @click="toggleFilterChip(f.value)"
        @click:close.stop="removeFilter(f.value)"
      >
        <v-icon start size="15">{{ filterTypes.includes(f.value) ? 'mdi-check' : f.icon }}</v-icon>
        {{ f.label }}
      </v-chip>
    </div>

    <div v-if="entries.length > 0">
      <template v-for="(item, i) in groupedEntries" :key="i">
        <div v-if="item.type === 'separator-today'" id="separator-today" class="d-flex align-center ga-3 my-4">
          <v-divider color="primary" opacity="0.35"></v-divider>
          <v-chip color="primary" variant="tonal" size="small" rounded="pill" class="font-weight-bold flex-shrink-0">
            {{ t('calendar.today') }} · {{ formatDate(item.date) }}
          </v-chip>
          <v-divider color="primary" opacity="0.35"></v-divider>
        </div>

        <div
          v-else-if="item.type === 'quarter'"
          class="d-flex align-center ga-3 mt-4 mb-2 text-overline text-medium-emphasis"
        >
          <span class="font-weight-bold flex-shrink-0">{{ item.data.title }}</span>
          <v-divider></v-divider>
        </div>

        <v-card
          v-else
          :id="`entry-${item.data.originalIndex}`"
          class="m3-card mb-3 cursor-pointer"
          @click="openDetailSheet(item.data.originalIndex)"
        >
          <v-card-item class="py-3">
            <template v-slot:prepend>
              <v-avatar :color="getEntryColor(item.data.type)" variant="tonal" size="42" rounded="lg" class="mr-3">
                <v-icon size="22">{{ getEntryIcon(item.data.type) }}</v-icon>
              </v-avatar>
            </template>

            <v-card-title class="text-subtitle-1 font-weight-bold text-wrap pa-0" style="line-height: 1.25">
              {{ item.data.title }}
            </v-card-title>

            <v-card-subtitle class="pt-1 text-wrap">
              {{ getEntrySubtitle(item.data) }}
              <span v-if="item.data.doctor"> · {{ item.data.doctor }}</span>
            </v-card-subtitle>

            <div v-if="item.data.effectiveReferralStatus" class="mt-2">
              <v-chip size="x-small" :color="getReferralChipColor(item.data.effectiveReferralStatus)" variant="tonal">
                <v-icon start size="14">{{ getReferralChipIcon(item.data.effectiveReferralStatus) }}</v-icon>
                {{ t(`calendar.referral.status.${item.data.effectiveReferralStatus}`) }}
              </v-chip>
            </div>
          </v-card-item>
        </v-card>
      </template>
    </div>

    <div v-else class="text-center mt-14 px-4 text-medium-emphasis">
      <v-avatar color="primary" variant="tonal" size="64" rounded="xl" class="mb-4">
        <v-icon size="34">mdi-calendar-clock</v-icon>
      </v-avatar>
      <div class="text-subtitle-1 font-weight-medium">{{ t('calendar.noEntries') }}</div>
    </div>

    <!-- M3 Entry Detail Bottom Sheet (Includes Export, Edit, and Delete!) -->
    <v-dialog v-model="detailSheetOpen" class="m3-sheet-dialog" transition="dialog-bottom-transition">
      <v-card v-if="selectedDetailEntry" class="pa-2">
        <div class="m3-sheet-handle"></div>
        <v-card-item class="pt-2 pb-1">
          <template v-slot:prepend>
            <v-avatar
              :color="getEntryColor(selectedDetailEntry.type)"
              variant="tonal"
              size="44"
              rounded="lg"
              class="mr-3"
            >
              <v-icon size="22">{{ getEntryIcon(selectedDetailEntry.type) }}</v-icon>
            </v-avatar>
          </template>
          <v-card-title class="text-h6 font-weight-bold text-wrap">{{ selectedDetailEntry.title }}</v-card-title>
          <v-card-subtitle>{{ getEntrySubtitle(selectedDetailEntry) }}</v-card-subtitle>
        </v-card-item>

        <v-card-text class="pt-3 pb-4 text-body-2">
          <div v-if="selectedDetailEntry.effectiveReferralStatus" class="mb-3">
            <v-chip
              size="small"
              :color="getReferralChipColor(selectedDetailEntry.effectiveReferralStatus)"
              variant="tonal"
            >
              <v-icon start size="16">{{ getReferralChipIcon(selectedDetailEntry.effectiveReferralStatus) }}</v-icon>
              {{ t(`calendar.referral.status.${selectedDetailEntry.effectiveReferralStatus}`) }}
            </v-chip>
          </div>

          <div class="detail-surface rounded-xl pa-3 mb-4">
            <template v-if="selectedDetailEntry.type === 'doctor'">
              <div v-if="selectedDetailEntry.doctor" class="d-flex justify-space-between ga-3 mb-2">
                <span class="text-medium-emphasis">{{ t('calendar.fields.doctor') }}</span>
                <span class="font-weight-medium text-right">{{ selectedDetailEntry.doctor }}</span>
              </div>
              <div v-if="selectedDetailEntry.doctorType" class="d-flex justify-space-between ga-3 mb-2">
                <span class="text-medium-emphasis">{{ t('calendar.fields.type') }}</span>
                <span class="font-weight-medium text-right">
                  {{ t(`calendar.doctorTypes.${selectedDetailEntry.doctorType}`) }}
                </span>
              </div>
              <div v-if="selectedDetailEntry.location" class="d-flex justify-space-between ga-3 mb-2">
                <span class="text-medium-emphasis">{{ t('calendar.fields.location') }}</span>
                <span class="font-weight-medium text-right">{{ selectedDetailEntry.location }}</span>
              </div>
              <div v-if="selectedDetailEntry.treatments" class="mt-2">
                <div class="text-medium-emphasis mb-1">{{ t('calendar.fields.treatments') }}</div>
                <div class="d-flex flex-wrap ga-1">
                  <template v-for="(segment, idx) in parseTreatmentText(selectedDetailEntry.treatments)" :key="idx">
                    <span v-if="segment.type === 'text'">{{ segment.content }}</span>
                    <v-chip v-else size="small" color="primary" variant="tonal">{{ segment.content }}</v-chip>
                  </template>
                </div>
              </div>
            </template>

            <template v-if="selectedDetailEntry.type === 'vaccination'">
              <div v-if="selectedDetailEntry.agent" class="d-flex justify-space-between ga-3 mb-2">
                <span class="text-medium-emphasis">{{ t('calendar.fields.agent') }}</span>
                <span class="font-weight-medium text-right">{{ selectedDetailEntry.agent }}</span>
              </div>
              <div v-if="selectedDetailEntry.method" class="d-flex justify-space-between ga-3 mb-2">
                <span class="text-medium-emphasis">{{ t('calendar.fields.method') }}</span>
                <span class="font-weight-medium text-right">
                  {{ t(`calendar.methods.${selectedDetailEntry.method}`) }}
                </span>
              </div>
              <div v-if="selectedDetailEntry.bodyPart" class="d-flex justify-space-between ga-3">
                <span class="text-medium-emphasis">{{ t('calendar.fields.bodyPart') }}</span>
                <span class="font-weight-medium text-right">{{ selectedDetailEntry.bodyPart }}</span>
              </div>
            </template>

            <template v-if="selectedDetailEntry.type === 'illness'">
              <div v-if="selectedDetailEntry.pathogen" class="d-flex justify-space-between ga-3 mb-2">
                <span class="text-medium-emphasis">{{ t('calendar.fields.pathogen') }}</span>
                <span class="font-weight-medium text-right">{{ selectedDetailEntry.pathogen }}</span>
              </div>
              <div v-if="selectedDetailEntry.symptoms" class="mb-2">
                <div class="text-medium-emphasis">{{ t('calendar.fields.symptoms') }}</div>
                <div class="font-weight-medium">{{ selectedDetailEntry.symptoms }}</div>
              </div>
              <div v-if="selectedDetailEntry.endDate" class="d-flex justify-space-between ga-3">
                <span class="text-medium-emphasis">{{ t('calendar.fields.endDate') }}</span>
                <span class="font-weight-medium">{{ formatDate(selectedDetailEntry.endDate, true) }}</span>
              </div>
            </template>

            <template v-if="selectedDetailEntry.type === 'note'">
              <div v-if="selectedDetailEntry.endDate" class="d-flex justify-space-between ga-3">
                <span class="text-medium-emphasis">{{ t('calendar.fields.endDate') }}</span>
                <span class="font-weight-medium">{{ formatDate(selectedDetailEntry.endDate, true) }}</span>
              </div>
            </template>

            <div v-if="selectedDetailEntry.notes" class="mt-2 pt-2 border-t">
              <div class="text-medium-emphasis mb-1">{{ t('calendar.fields.notes') }}</div>
              <div v-html="renderMarkdownLinks(selectedDetailEntry.notes)"></div>
            </div>
          </div>

          <v-btn
            block
            color="primary"
            variant="tonal"
            size="large"
            rounded="pill"
            prepend-icon="mdi-calendar-export"
            class="mb-3"
            @click.stop="exportToCalendar(selectedDetailEntry)"
          >
            {{ t('calendar.export') }}
          </v-btn>

          <div class="d-flex ga-2">
            <v-btn
              class="flex-grow-1"
              color="secondary"
              variant="tonal"
              size="large"
              rounded="pill"
              prepend-icon="mdi-pencil"
              @click.stop="openEditDialog(selectedDetailEntry)"
              data-testid="calendar-detail-edit-btn"
            >
              {{ t('dialog.edit') }}
            </v-btn>
            <v-btn
              color="error"
              variant="tonal"
              size="large"
              rounded="pill"
              prepend-icon="mdi-delete"
              @click.stop="requestDeleteEntry(selectedDetailEntry.originalIndex)"
              data-testid="calendar-detail-delete-btn"
            >
              {{ t('dialog.delete') }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <EntryTypeDialog v-model="typeDialog" @select="onTypeSelected" />
    <CalendarEntryDialog
      v-model="entryDialog"
      :entry="currentEntry"
      :suggestions="existingTreatments"
      :title="editingIndex > -1 ? t('calendar.edit') : t('calendar.add')"
      :confirm-text="t('dialog.save')"
      :is-edit="editingIndex > -1"
      @confirm="saveEntry"
    />
    <ConfirmDialog
      v-model="exportDialog"
      :title="t('calendar.export')"
      :message="t('calendar.exportConfirm')"
      :confirm-text="t('dialog.yes')"
      :cancel-text="t('dialog.no')"
      confirm-color="primary"
      @confirm="confirmExport"
    />
    <ConfirmDialog
      v-model="confirmDeleteDialog"
      :title="t('calendar.deleteEntryTitle')"
      :message="
        entryToDelete
          ? t('calendar.deleteEntryConfirmNamed', { name: entryToDelete.title })
          : t('calendar.deleteEntryConfirm')
      "
      :confirm-text="t('dialog.delete')"
      :cancel-text="t('dialog.cancel')"
      @confirm="confirmDelete"
    />
    <FilterDialog v-model="filterDialog" v-model:selected-filters="filterTypes" />
  </v-container>
</template>

<style scoped>
.calendar-container {
  max-width: 680px;
}
.cursor-pointer {
  cursor: pointer;
}
.text-wrap {
  white-space: normal !important;
}
.filter-chip-item {
  min-height: 36px;
}
.detail-surface {
  background-color: rgb(var(--v-theme-surface-light));
}
.border-t {
  border-top: 1px solid rgba(var(--v-border-color), 0.35);
}
</style>
