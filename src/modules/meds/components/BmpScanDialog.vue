<template>
  <v-dialog
    :model-value="modelValue"
    max-width="640px"
    scrollable
    persistent
    @update:model-value="handleClose"
  >
    <v-card class="bmp-scan-dialog">
      <!-- Toolbar Header -->
      <v-toolbar color="primary" density="comfortable">
        <v-btn icon="mdi-close" variant="text" @click="handleClose" />
        <v-toolbar-title class="text-subtitle-1 font-weight-bold">
          {{ t('bmp.scanTitle') }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          v-if="step === 'preview'"
          icon="mdi-refresh"
          variant="text"
          :title="t('bmp.rescan')"
          @click="resetToScanner"
        />
      </v-toolbar>

      <v-card-text class="pa-4">
        <!-- Error Alert -->
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <!-- STEP 1: SCANNER & CAPTURE -->
        <div v-if="step === 'scanner'">
          <p class="text-body-2 text-medium-emphasis mb-3">
            {{ t('bmp.scanSubtitle') }}
          </p>

          <!-- Camera Viewfinder -->
          <div class="viewfinder-wrapper mb-4">
            <video
              ref="videoEl"
              class="camera-video"
              autoplay
              playsinline
              muted
            ></video>
            
            <div class="viewfinder-overlay">
              <div class="target-box">
                <div class="target-corner top-left"></div>
                <div class="target-corner top-right"></div>
                <div class="target-corner bottom-left"></div>
                <div class="target-corner bottom-right"></div>
                <div class="scan-laser"></div>
              </div>
            </div>

            <!-- Controls overlay -->
            <div class="viewfinder-controls">
              <v-btn
                icon="mdi-camera-flip"
                size="small"
                variant="flat"
                color="surface"
                class="ma-1"
                @click="switchCameraFacing"
              />
              <v-btn
                v-if="hasTorch"
                :icon="isTorchOn ? 'mdi-flashlight-off' : 'mdi-flashlight'"
                size="small"
                variant="flat"
                color="surface"
                class="ma-1"
                @click="toggleTorch"
              />
            </div>
          </div>

          <!-- Action Buttons: File Upload & Manual Code -->
          <div class="d-flex flex-column gap-2 mb-3">
            <v-btn
              color="primary"
              variant="outlined"
              size="large"
              prepend-icon="mdi-camera"
              :loading="isProcessingImage"
              @click="triggerFileUpload"
            >
              {{ t('bmp.uploadImage') }}
            </v-btn>
            <input
              ref="fileInputEl"
              type="file"
              accept="image/*"
              capture="environment"
              style="display: none"
              @change="onFileSelected"
            />
          </div>

          <!-- Manual Code Paste Accordion -->
          <v-expansion-panels variant="accordion" class="mt-2">
            <v-expansion-panel :title="t('bmp.manualInput')">
              <v-expansion-panel-text>
                <v-textarea
                  v-model="manualCode"
                  :placeholder="t('bmp.pastePlaceholder')"
                  rows="3"
                  variant="outlined"
                  density="compact"
                  class="font-monospace text-caption mb-2"
                  hide-details
                />
                <v-btn
                  block
                  variant="tonal"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-code-json"
                  :disabled="!manualCode.trim()"
                  @click="handleManualParse"
                >
                  {{ t('bmp.parseCode') }}
                </v-btn>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>

        <!-- STEP 2: PREVIEW & SELECTION -->
        <div v-else-if="step === 'preview'">
          <!-- Metadata Card -->
          <v-card
            v-if="metadata.patient?.lastName || metadata.doctor?.name"
            variant="tonal"
            color="primary"
            class="pa-3 mb-4"
          >
            <div v-if="metadata.patient?.lastName" class="d-flex align-center text-body-2 font-weight-medium mb-1">
              <v-icon icon="mdi-account" size="small" class="mr-1" />
              <span>
                {{ t('bmp.patient') }}: {{ metadata.patient.firstName }} {{ metadata.patient.lastName }}
                <span v-if="metadata.patient.birthDate" class="text-caption text-medium-emphasis">
                  (*{{ metadata.patient.birthDate }})
                </span>
              </span>
            </div>
            <div v-if="metadata.doctor?.name" class="d-flex align-center text-caption text-medium-emphasis">
              <v-icon icon="mdi-hospital-building" size="small" class="mr-1" />
              <span>{{ t('bmp.doctor') }}: {{ metadata.doctor.name }} {{ metadata.doctor.city ? `(${metadata.doctor.city})` : '' }}</span>
            </div>
          </v-card>

          <!-- Selection Controls -->
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-subtitle-2 font-weight-bold">
              {{ t('bmp.detectedMeds', { count: detectedMeds.length }) }}
            </span>
            <div class="d-flex gap-2">
              <v-btn variant="text" density="compact" size="small" @click="selectAllMeds(true)">
                {{ t('bmp.selectAll') }}
              </v-btn>
              <v-btn variant="text" density="compact" size="small" @click="selectAllMeds(false)">
                {{ t('bmp.deselectAll') }}
              </v-btn>
            </div>
          </div>

          <!-- Medications List -->
          <div class="meds-preview-list mb-4">
            <v-card
              v-for="(med, idx) in detectedMeds"
              :key="idx"
              variant="outlined"
              class="pa-3 mb-2"
              :class="{ 'opacity-50': !med.selected }"
            >
              <div class="d-flex align-start">
                <v-checkbox
                  v-model="med.selected"
                  density="compact"
                  hide-details
                  class="ma-0 pa-0 mr-2"
                  color="primary"
                />

                <div class="flex-grow-1">
                  <div class="d-flex align-center justify-space-between">
                    <span class="font-weight-bold text-body-1">{{ med.name }}</span>
                    <v-chip color="primary" size="small" variant="tonal" class="font-weight-bold ml-2">
                      {{ med.dose }}
                    </v-chip>
                  </div>

                  <div v-if="med.ingredient" class="text-caption text-medium-emphasis">
                    {{ med.ingredient }}
                  </div>

                  <div v-if="med.reason || med.instructions" class="text-caption text-grey mt-1">
                    <span v-if="med.reason"><strong>{{ t('med.reason') || 'Grund' }}:</strong> {{ med.reason }} </span>
                    <span v-if="med.instructions"><strong>{{ t('med.instructions') || 'Hinweis' }}:</strong> {{ med.instructions }}</span>
                  </div>

                  <!-- Count & Package size setup -->
                  <div v-if="med.selected" class="d-flex align-center gap-2 mt-2 pt-2 border-t">
                    <v-text-field
                      v-model.number="med.count"
                      type="number"
                      :label="t('med.count')"
                      density="compact"
                      variant="outlined"
                      hide-details
                      style="max-width: 120px;"
                    />
                    <v-btn size="x-small" variant="tonal" @click="med.count = (med.count || 0) + 20">+20</v-btn>
                    <v-btn size="x-small" variant="tonal" @click="med.count = (med.count || 0) + 50">+50</v-btn>
                    <v-btn size="x-small" variant="tonal" @click="med.count = (med.count || 0) + 100">+100</v-btn>
                  </div>
                </div>
              </div>
            </v-card>
          </div>

          <!-- Import Mode Selection -->
          <div class="mb-4">
            <div class="text-caption font-weight-medium text-medium-emphasis mb-1">
              {{ t('bmp.importMode') }}
            </div>
            <v-radio-group v-model="importMode" density="compact" hide-details>
              <v-radio
                value="append"
                :label="t('bmp.modeAppend')"
                color="primary"
              />
              <v-radio
                value="replace"
                :label="t('bmp.modeReplace')"
                color="error"
              />
            </v-radio-group>
          </div>
        </div>
      </v-card-text>

      <!-- Card Actions -->
      <v-card-actions class="pa-4 pt-0">
        <v-btn variant="text" @click="handleClose">
          {{ t('dialog.cancel') }}
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="step === 'preview'"
          color="primary"
          variant="elevated"
          prepend-icon="mdi-check"
          :disabled="selectedCount === 0"
          @click="confirmImport"
        >
          {{ t('bmp.importSelected', { count: selectedCount }) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { parseBmpData } from '../utils/bmpParser';
import * as bmpScannerService from '../utils/bmpScannerService';
import * as hapticService from '../../common/utils/hapticService';
import { state as appState } from '../../../app-state';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'meds-imported']);

const { t } = useI18n();

// Dialog & Workflow State
const step = ref('scanner'); // 'scanner' | 'preview'
const errorMessage = ref('');
const isProcessingImage = ref(false);
const manualCode = ref('');

// Camera & Scanner State
const videoEl = ref(null);
const fileInputEl = ref(null);
let cameraController = null;
const facingMode = ref('environment');
const hasTorch = ref(false);
const isTorchOn = ref(false);

// Preview Data
const metadata = ref({});
const detectedMeds = ref([]);
const importMode = ref('append'); // 'append' | 'replace'

const selectedCount = computed(() => {
  return detectedMeds.value.filter((m) => m.selected).length;
});

// Start camera scanner
function startCamera() {
  stopCamera();
  if (!props.modelValue || step.value !== 'scanner') return;

  nextTick(() => {
    if (!videoEl.value) return;

    try {
      cameraController = bmpScannerService.startCameraScanner({
        videoElement: videoEl.value,
        facingMode: facingMode.value,
        onResult: (barcodeText) => {
          processRawBmpData(barcodeText);
        },
        onError: (err) => {
          console.warn('[BmpScanDialog] Camera start error:', err);
          errorMessage.value = t('bmp.cameraError');
        }
      });
    } catch (e) {
      console.warn('[BmpScanDialog] Camera scanner error:', e);
      errorMessage.value = t('bmp.cameraError');
    }
  });
}

function stopCamera() {
  if (cameraController) {
    cameraController.stop();
    cameraController = null;
  }
}

async function switchCameraFacing() {
  facingMode.value = facingMode.value === 'environment' ? 'user' : 'environment';
  startCamera();
}

async function toggleTorch() {
  if (!cameraController) return;
  const nextState = !isTorchOn.value;
  const success = await cameraController.toggleTorch(nextState);
  if (success) {
    isTorchOn.value = nextState;
  }
}

function triggerFileUpload() {
  if (fileInputEl.value) {
    fileInputEl.value.click();
  }
}

async function onFileSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  isProcessingImage.value = true;
  errorMessage.value = '';

  try {
    const rawText = await bmpScannerService.scanBarcodeFromFile(file);
    if (rawText) {
      await processRawBmpData(rawText);
    } else {
      errorMessage.value = t('bmp.invalidPlan');
    }
  } catch (err) {
    errorMessage.value = t('bmp.invalidPlan');
  } finally {
    isProcessingImage.value = false;
    event.target.value = '';
  }
}

async function handleManualParse() {
  if (!manualCode.value.trim()) return;
  await processRawBmpData(manualCode.value);
}

/**
 * Parses raw barcode text (XML, Base64, etc.) and transitions to preview step.
 */
async function processRawBmpData(rawData) {
  errorMessage.value = '';
  const result = parseBmpData(rawData);

  if (!result.success || !result.meds || result.meds.length === 0) {
    hapticService.vibrateWarning();
    errorMessage.value = t('bmp.invalidPlan');
    return;
  }

  hapticService.vibrateSuccess();
  stopCamera();
  metadata.value = result.metadata || {};
  detectedMeds.value = result.meds.map((m) => ({
    ...m,
    selected: true,
    count: m.count || 0
  }));
  step.value = 'preview';
}

function selectAllMeds(select) {
  detectedMeds.value.forEach((m) => {
    m.selected = select;
  });
}

function resetToScanner() {
  step.value = 'scanner';
  metadata.value = {};
  detectedMeds.value = [];
  errorMessage.value = '';
  manualCode.value = '';
  startCamera();
}

function handleClose() {
  stopCamera();
  emit('update:modelValue', false);
  // Reset dialog state
  setTimeout(() => {
    step.value = 'scanner';
    metadata.value = {};
    detectedMeds.value = [];
    errorMessage.value = '';
    manualCode.value = '';
    importMode.value = 'append';
  }, 300);
}

async function confirmImport() {
  const selectedMeds = detectedMeds.value
    .filter((m) => m.selected)
    .map(({ selected, ...medData }) => medData);

  if (selectedMeds.length === 0) {
    errorMessage.value = t('bmp.noMedsSelected');
    return;
  }

  if (importMode.value === 'replace') {
    appState.decryptedData.meds = [...selectedMeds];
  } else {
    // Append to existing meds
    appState.decryptedData.meds = [...selectedMeds, ...appState.decryptedData.meds];
  }

  appState.decryptedData.version += 1;
  emit('meds-imported', selectedMeds);
  handleClose();
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      step.value = 'scanner';
      errorMessage.value = '';
      startCamera();
    } else {
      stopCamera();
    }
  }
);

onMounted(() => {
  if (props.modelValue) {
    startCamera();
  }
});

onUnmounted(() => {
  stopCamera();
});

defineExpose({
  step,
  metadata,
  detectedMeds,
  importMode,
  processRawBmpData,
  confirmImport,
  resetToScanner
});
</script>

<style scoped>
.bmp-scan-dialog {
  min-height: 480px;
}

.viewfinder-wrapper {
  position: relative;
  width: 100%;
  height: 280px;
  background-color: #000;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.viewfinder-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.target-box {
  position: relative;
  width: 200px;
  height: 200px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
}

.target-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: #2196f3;
  border-style: solid;
}

.top-left {
  top: -2px;
  left: -2px;
  border-width: 4px 0 0 4px;
}

.top-right {
  top: -2px;
  right: -2px;
  border-width: 4px 4px 0 0;
}

.bottom-left {
  bottom: -2px;
  left: -2px;
  border-width: 0 0 4px 4px;
}

.bottom-right {
  bottom: -2px;
  right: -2px;
  border-width: 0 4px 4px 0;
}

.scan-laser {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #2196f3, transparent);
  box-shadow: 0 0 8px #2196f3;
  animation: scanLaser 2s linear infinite;
}

@keyframes scanLaser {
  0% {
    top: 0%;
  }
  50% {
    top: 98%;
  }
  100% {
    top: 0%;
  }
}

.viewfinder-controls {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
}

.gap-2 {
  gap: 8px;
}

.font-monospace {
  font-family: 'Courier New', Courier, monospace;
}

.opacity-50 {
  opacity: 0.5;
}

.border-t {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
