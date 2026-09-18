<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600px"
    scrollable
    @update:model-value="handleClose"
  >
    <v-card class="bmp-export-dialog">
      <!-- Toolbar Header -->
      <v-toolbar color="primary" density="comfortable">
        <v-btn icon="mdi-close" variant="text" @click="handleClose" />
        <v-toolbar-title class="text-subtitle-1 font-weight-bold">
          {{ t('bmp.exportTitle') }}
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-4">
        <p class="text-body-2 text-medium-emphasis mb-3">
          {{ t('bmp.exportSubtitle') }}
        </p>

        <!-- DataMatrix Preview Card -->
        <v-card
          variant="outlined"
          class="bmp-matrix-preview pa-4 mb-4 text-center d-flex flex-column align-center justify-center bg-white"
        >
          <div v-if="activeMeds.length > 0 && svgMarkup" class="bmp-svg-wrapper mb-2" v-html="svgMarkup"></div>
          <div v-else-if="activeMeds.length === 0" class="text-caption text-medium-emphasis py-8 text-black">
            {{ t('bmp.emptyMeds') }}
          </div>
          <div v-if="generationError" class="text-caption text-error">
            {{ generationError }}
          </div>

          <!-- Meds count badge -->
          <v-chip size="small" variant="tonal" color="primary" class="mt-2">
            {{ t('bmp.medsCountBadge', { selected: activeMeds.length, total: availableMeds.length }) }}
          </v-chip>
        </v-card>

        <!-- Format Selection -->
        <div class="mb-4">
          <v-btn-toggle
            v-model="format"
            mandatory
            density="compact"
            color="primary"
            class="w-100 d-flex"
            variant="outlined"
          >
            <v-btn value="standard" class="flex-grow-1" size="small">
              <v-icon start size="16">mdi-zip-box</v-icon>
              {{ t('bmp.formatStandard') }}
            </v-btn>
            <v-btn value="xml" class="flex-grow-1" size="small">
              <v-icon start size="16">mdi-code-tags</v-icon>
              {{ t('bmp.formatXml') }}
            </v-btn>
          </v-btn-toggle>
        </div>

        <!-- Action Buttons: Download, Share, Copy XML -->
        <div class="d-flex flex-wrap gap-2 mb-4">
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-download"
            size="small"
            class="flex-grow-1"
            :disabled="activeMeds.length === 0"
            @click="downloadPng"
          >
            {{ t('bmp.downloadPng') }}
          </v-btn>

          <v-btn
            v-if="canShare"
            color="primary"
            variant="outlined"
            prepend-icon="mdi-share-variant"
            size="small"
            class="flex-grow-1"
            :disabled="activeMeds.length === 0"
            @click="shareBmp"
          >
            {{ t('bmp.share') }}
          </v-btn>

          <v-btn
            variant="outlined"
            prepend-icon="mdi-content-copy"
            size="small"
            class="flex-grow-1"
            :disabled="activeMeds.length === 0"
            @click="copyXml"
          >
            {{ t('bmp.copyXml') }}
          </v-btn>
        </div>

        <!-- Optional Patient Information (Accordion) -->
        <v-expansion-panels class="mb-4">
          <v-expansion-panel>
            <v-expansion-panel-title class="text-caption font-weight-medium">
              <v-icon start size="18" color="primary">mdi-account-outline</v-icon>
              {{ t('bmp.patientOptional') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text class="pt-2">
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="patient.firstName"
                    :label="t('bmp.firstName')"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="mb-2"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="patient.lastName"
                    :label="t('bmp.lastName')"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="mb-2"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="patient.birthDate"
                    :label="t('bmp.birthDate')"
                    type="date"
                    density="compact"
                    variant="outlined"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Medication Selection Checklist -->
        <div class="mb-2">
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-caption font-weight-medium text-medium-emphasis">
              {{ t('bmp.selectMedsToInclude') }}
            </span>
            <div>
              <v-btn
                variant="text"
                density="compact"
                size="x-small"
                color="primary"
                class="mr-1"
                @click="selectAll"
              >
                {{ t('bmp.selectAll') }}
              </v-btn>
              <v-btn
                variant="text"
                density="compact"
                size="x-small"
                @click="deselectAll"
              >
                {{ t('bmp.deselectAll') }}
              </v-btn>
            </div>
          </div>

          <v-list density="compact" class="border rounded pa-0">
            <v-list-item
              v-for="(med, idx) in availableMeds"
              :key="med.id || med.name + idx"
              class="px-2"
            >
              <template #prepend>
                <v-checkbox-btn
                  v-model="selectedIndices"
                  :value="idx"
                  color="primary"
                  density="compact"
                />
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium">
                {{ med.name }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                {{ [med.dose ? t('med.dose') + ': ' + med.dose : '', med.notes].filter(Boolean).join(' • ') }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>

      <!-- Card Actions -->
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="handleClose">
          {{ t('dialog.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Snackbar for feedback -->
    <v-snackbar v-model="snackbar" timeout="2500">
      {{ snackbarText }}
    </v-snackbar>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { generateBmpXml, generateBmpPayload, generateBmpSvg, generateBmpDataUrl } from '../utils/bmpGenerator';
import { state as appState } from '../../../app-state';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  meds: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

const format = ref('standard');
const selectedIndices = ref([]);
const patient = reactive({
  firstName: '',
  lastName: '',
  birthDate: ''
});

const snackbar = ref(false);
const snackbarText = ref('');
const generationError = ref('');

const canShare = computed(() => typeof navigator !== 'undefined' && !!navigator.share);

const availableMeds = computed(() => {
  if (props.meds && props.meds.length > 0) {
    return props.meds;
  }
  return appState.decryptedData?.meds || [];
});

// Initialize all selected when dialog opens or meds change
watch(
  () => [props.modelValue, availableMeds.value],
  ([isOpen, meds]) => {
    if (isOpen && meds) {
      selectedIndices.value = meds.map((_, i) => i);
    }
  },
  { immediate: true }
);

const activeMeds = computed(() => {
  return availableMeds.value.filter((_, idx) => selectedIndices.value.includes(idx));
});

function selectAll() {
  selectedIndices.value = availableMeds.value.map((_, i) => i);
}

function deselectAll() {
  selectedIndices.value = [];
}

const bmpXml = computed(() => {
  if (activeMeds.value.length === 0) return '';
  const p = (patient.firstName || patient.lastName || patient.birthDate) ? {
    firstName: patient.firstName,
    lastName: patient.lastName,
    birthDate: patient.birthDate
  } : null;

  return generateBmpXml({
    meds: activeMeds.value,
    patient: p
  });
});

const bmpPayload = computed(() => {
  if (!bmpXml.value) return '';
  try {
    generationError.value = '';
    return generateBmpPayload(bmpXml.value, {
      compress: format.value === 'standard'
    });
  } catch (err) {
    generationError.value = err.message;
    return '';
  }
});

const svgMarkup = computed(() => {
  if (!bmpPayload.value) return '';
  try {
    return generateBmpSvg(bmpPayload.value, { size: 260, margin: 2 });
  } catch (err) {
    generationError.value = err.message;
    return '';
  }
});

async function downloadPng() {
  if (!bmpPayload.value) return;
  try {
    const dataUrl = await generateBmpDataUrl(bmpPayload.value, { size: 400, margin: 4 });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `medikationsplan-bmp-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    generationError.value = err.message;
  }
}

async function shareBmp() {
  if (!bmpPayload.value || !navigator.share) return;
  try {
    const dataUrl = await generateBmpDataUrl(bmpPayload.value, { size: 400, margin: 4 });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'medikationsplan.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: t('bmp.exportTitle'),
        files: [file]
      });
    } else {
      await navigator.share({
        title: t('bmp.exportTitle'),
        text: bmpXml.value
      });
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      generationError.value = err.message;
    }
  }
}

async function copyXml() {
  if (!bmpXml.value) return;
  try {
    await navigator.clipboard.writeText(bmpXml.value);
    snackbarText.value = t('bmp.xmlCopied');
    snackbar.value = true;
  } catch (err) {
    generationError.value = err.message;
  }
}

function handleClose() {
  emit('update:modelValue', false);
}

defineExpose({
  format,
  selectedIndices,
  patient,
  activeMeds,
  bmpXml,
  bmpPayload,
  svgMarkup,
  selectAll,
  deselectAll,
  downloadPng,
  copyXml,
  shareBmp,
  handleClose
});
</script>

<style scoped>
.bmp-matrix-preview {
  background-color: #ffffff !important;
  color: #000000;
  min-height: 280px;
}

.bmp-svg-wrapper {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
}

.bmp-svg-wrapper :deep(svg) {
  display: block;
  max-width: 100%;
  height: auto;
}

.gap-2 {
  gap: 8px;
}
</style>
