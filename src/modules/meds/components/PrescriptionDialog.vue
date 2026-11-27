<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as dataService from '../../common/utils/dataService';
import { showSnackbar } from '../../common/utils/snackbarService';
import { getLocalDateString } from '../../calendar/utils/calendarUtils';
import {
  calculatePrescriptionNeeds,
  groupIntoPrescriptions,
  formatPrescriptionText,
  DEFAULT_BUFFER_DAYS
} from '../utils/prescriptionUtils';

const props = defineProps({
  modelValue: Boolean,
  meds: { type: Array, default: () => [] },
  calendarEntries: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:modelValue']);
const { t, locale } = useI18n();

const todayStr = getLocalDateString();
const tomorrowStr = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return getLocalDateString(d);
})();

const parseLocalDate = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatDate = (str) =>
  parseLocalDate(str).toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit'
  });

const upcomingAppointments = computed(() =>
  props.calendarEntries
    .filter((e) => e.type === 'doctor' && e.date && e.date > todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)
);

const targetDate = ref(upcomingAppointments.value[0]?.date || '');
const bufferDays = ref(DEFAULT_BUFFER_DAYS);
// Package count per med index, set by the +/- buttons
const overrides = ref({});

onMounted(async () => {
  const settings = await dataService.getSettings();
  if (Number.isInteger(settings?.prescriptionBufferDays)) bufferDays.value = settings.prescriptionBufferDays;
});

const validBuffer = computed(() => {
  const n = Number(bufferDays.value);
  return Number.isInteger(n) && n >= 0 && n <= 365 ? n : null;
});

// Saved on user input only, not when the remembered value loads
function onBufferInput(value) {
  bufferDays.value = value;
  const n = Number(value);
  if (Number.isInteger(n) && n >= 0 && n <= 365) dataService.savePrescriptionBufferDays(n);
}
watch([targetDate, validBuffer], () => {
  overrides.value = {};
});

const lines = computed(() => {
  if (!targetDate.value || targetDate.value <= todayStr || validBuffer.value === null) return [];
  return calculatePrescriptionNeeds(props.meds, parseLocalDate(targetDate.value), {
    bufferDays: validBuffer.value
  }).map((line) => ({
    ...line,
    suggested: line.packages,
    packages: line.packageSize ? (overrides.value[line.index] ?? line.packages) : null
  }));
});

const includedLines = computed(() => lines.value.filter((l) => l.packages === null || l.packages > 0));
const excludedLines = computed(() => lines.value.filter((l) => l.packages === 0));
const prescriptions = computed(() => groupIntoPrescriptions(includedLines.value));
const shareText = computed(() => formatPrescriptionText(prescriptions.value, t));
const canShare = typeof navigator !== 'undefined' && !!navigator.share;

function changePackages(line, delta) {
  overrides.value = { ...overrides.value, [line.index]: Math.max(0, line.packages + delta) };
}

async function copyText() {
  try {
    await navigator.clipboard.writeText(shareText.value);
    showSnackbar({ text: t('prescription.copied') });
  } catch {
    showSnackbar({ text: t('prescription.copyFailed'), color: 'error' });
  }
}

async function shareTextOut() {
  try {
    await navigator.share({ title: t('prescription.title'), text: shareText.value });
  } catch {
    /* cancelled by the user */
  }
}

const close = () => emit('update:modelValue', false);
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="(val) => !val && close()"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card color="background" rounded="0" class="d-flex flex-column fill-height">
      <v-toolbar color="surface" elevation="0" class="m3-fullscreen-toolbar flex-grow-0">
        <v-btn icon="mdi-close" :aria-label="t('prescription.close')" @click="close"></v-btn>
        <v-toolbar-title class="font-weight-bold text-subtitle-1">{{ t('prescription.title') }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-0 flex-grow-1 overflow-y-auto">
        <v-container class="prescription-container pb-12">
          <p class="text-body-2 text-medium-emphasis mb-4">{{ t('prescription.intro') }}</p>

          <div class="d-flex flex-wrap ga-3">
            <v-text-field
              v-model="targetDate"
              :label="t('prescription.lastUntil')"
              type="date"
              :min="tomorrowStr"
              variant="outlined"
              class="date-field"
              hide-details="auto"
              data-testid="prescription-date"
            />
            <v-text-field
              :model-value="bufferDays"
              @update:model-value="onBufferInput"
              :label="t('prescription.bufferDays')"
              type="number"
              min="0"
              max="365"
              variant="outlined"
              class="buffer-field"
              :error-messages="validBuffer === null ? t('prescription.bufferInvalid') : []"
              hide-details="auto"
              data-testid="prescription-buffer"
            />
          </div>

          <div v-if="upcomingAppointments.length > 0" class="mt-3">
            <div class="text-caption text-medium-emphasis mb-1">{{ t('prescription.nextAppointments') }}</div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="entry in upcomingAppointments"
                :key="entry.id || entry.date + entry.title"
                :color="targetDate === entry.date ? 'primary' : undefined"
                :variant="targetDate === entry.date ? 'flat' : 'outlined'"
                prepend-icon="mdi-stethoscope"
                data-testid="prescription-appointment"
                @click="targetDate = entry.date"
              >
                {{ formatDate(entry.date) }}<span v-if="entry.title" class="ml-1">· {{ entry.title }}</span>
              </v-chip>
            </div>
          </div>

          <div class="mt-6">
            <p v-if="!targetDate || targetDate <= todayStr" class="text-body-1 text-medium-emphasis">
              {{ t('prescription.chooseDate') }}
            </p>
            <p v-else-if="lines.length === 0" class="text-body-1" data-testid="prescription-none">
              {{ t('prescription.noneNeeded', { date: formatDate(targetDate) }) }}
            </p>

            <v-card
              v-for="(rx, i) in prescriptions"
              :key="i"
              class="m3-card mb-3"
              elevation="0"
              data-testid="prescription-card"
            >
              <v-card-title class="text-subtitle-1 font-weight-bold pb-0">
                {{ t('prescription.heading', { number: i + 1 }) }}
              </v-card-title>
              <v-list density="comfortable" bg-color="transparent">
                <v-list-item v-for="line in rx" :key="line.index" data-testid="prescription-line">
                  <v-list-item-title class="font-weight-medium text-wrap">{{ line.name }}</v-list-item-title>
                  <v-list-item-subtitle class="line-subtitle">
                    <span v-if="line.packageSize">{{ t('prescription.packageOf', { size: line.packageSize }) }}</span>
                    <span v-else class="text-warning">
                      {{ t('prescription.missingPackageSize', { units: line.missingUnits }) }}
                    </span>
                  </v-list-item-subtitle>
                  <template v-if="line.packageSize" v-slot:append>
                    <div class="d-flex align-center">
                      <v-btn
                        icon="mdi-minus"
                        size="small"
                        variant="text"
                        :aria-label="t('prescription.fewer', { name: line.name })"
                        @click="changePackages(line, -1)"
                      ></v-btn>
                      <span class="packages font-weight-bold text-center" data-testid="prescription-packages">
                        {{ line.packages }}&nbsp;×
                      </span>
                      <v-btn
                        icon="mdi-plus"
                        size="small"
                        variant="text"
                        :aria-label="t('prescription.more', { name: line.name })"
                        @click="changePackages(line, 1)"
                      ></v-btn>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>

            <div v-if="excludedLines.length > 0" class="mt-4" data-testid="prescription-excluded">
              <div class="text-caption text-medium-emphasis mb-1">{{ t('prescription.excluded') }}</div>
              <v-chip
                v-for="line in excludedLines"
                :key="line.index"
                class="mr-2 mb-2"
                prepend-icon="mdi-plus"
                variant="outlined"
                @click="changePackages(line, line.suggested || 1)"
              >
                {{ line.name }}
              </v-chip>
            </div>

            <div v-if="prescriptions.length > 0" class="d-flex flex-wrap ga-2 mt-4">
              <v-btn
                class="flex-grow-1"
                variant="tonal"
                color="secondary"
                rounded="pill"
                size="large"
                prepend-icon="mdi-content-copy"
                data-testid="prescription-copy"
                @click="copyText"
              >
                {{ t('prescription.copy') }}
              </v-btn>
              <v-btn
                v-if="canShare"
                class="flex-grow-1"
                color="primary"
                variant="flat"
                rounded="pill"
                size="large"
                prepend-icon="mdi-share-variant"
                @click="shareTextOut"
              >
                {{ t('prescription.share') }}
              </v-btn>
            </div>
          </div>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.prescription-container {
  max-width: 640px;
}
.date-field {
  flex: 1 1 11rem;
}
.buffer-field {
  flex: 0 1 8rem;
}
.packages {
  min-width: 2.5rem;
}
/* Vuetify clamps subtitles to one line; the missing package size hint needs two */
.line-subtitle {
  white-space: normal;
  -webkit-line-clamp: unset;
  line-clamp: unset;
}
</style>
