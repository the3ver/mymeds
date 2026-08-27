<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560px"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="pa-2">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between pb-2">
        <div class="d-flex align-center font-weight-bold">
          <v-icon icon="mdi-sync" color="primary" class="mr-2" />
          {{ t('sync.title') }}
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          density="comfortable"
          class="close-sync-btn"
          @click="handleClose"
        />
      </v-card-title>

      <!-- Tabs (Send / Receive) -->
      <v-tabs
        v-model="activeTab"
        color="primary"
        grow
        class="border-b mb-4"
      >
        <v-tab value="send">
          <v-icon icon="mdi-upload" class="mr-1" />
          {{ t('sync.tabSend') }}
        </v-tab>
        <v-tab value="receive">
          <v-icon icon="mdi-download" class="mr-1" />
          {{ t('sync.tabReceive') }}
        </v-tab>
      </v-tabs>

      <v-card-text class="pt-0">
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

        <!-- Success Toast Alert -->
        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          class="mb-4"
        >
          {{ successMessage }}
        </v-alert>

        <!-- TAB 1: SEND VAULT -->
        <div v-if="activeTab === 'send'">
          <!-- Vault Selection -->
          <v-select
            v-model="selectedVaultId"
            :items="databases"
            item-title="name"
            item-value="id"
            :label="t('sync.selectVault')"
            prepend-inner-icon="mdi-safe"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            @update:model-value="initSenderSession"
          />

          <div v-if="selectedVaultId" class="text-center">
            <p class="text-caption text-medium-emphasis mb-3">
              {{ t('sync.sendInstructions') }}
            </p>

            <!-- 6-digit Code Display -->
            <v-card
              variant="outlined"
              color="primary"
              class="pa-3 mb-3 bg-surface-light d-flex flex-column align-center justify-center"
            >
              <div class="text-caption font-weight-medium mb-1 text-medium-emphasis">
                {{ t('sync.syncCodeLabel') }}
              </div>
              <div class="d-flex align-center gap-2">
                <span class="text-h4 font-weight-bold letter-spacing-wide font-monospace text-primary">
                  {{ formattedSyncCode }}
                </span>
                <v-btn
                  icon="mdi-content-copy"
                  size="small"
                  variant="text"
                  color="primary"
                  :title="t('sync.copyCode')"
                  @click="copySyncCode"
                />
              </div>
              <span v-if="codeCopied" class="text-caption text-success font-weight-medium mt-1">
                {{ t('sync.codeCopied') }}
              </span>
            </v-card>

            <!-- QR Code Display -->
            <div v-if="qrCodeDataUrl" class="d-flex justify-center mb-3">
              <v-img
                :src="qrCodeDataUrl"
                alt="QR Code"
                max-width="200"
                aspect-ratio="1"
                class="rounded-lg elevation-1"
              />
            </div>

            <!-- Copy Encrypted Payload Button (Fallback) -->
            <div class="mt-2 mb-2">
              <v-btn
                variant="text"
                size="small"
                prepend-icon="mdi-content-copy"
                color="primary"
                @click="copyEncryptedPayload"
              >
                {{ t('sync.copyEncryptedText') }}
              </v-btn>
            </div>

            <!-- Status Indicator -->
            <div class="d-flex align-center justify-center text-caption text-medium-emphasis py-2">
              <v-progress-circular
                v-if="senderStatus === 'waiting' || senderStatus === 'connecting'"
                indeterminate
                size="16"
                width="2"
                color="primary"
                class="mr-2"
              />
              <v-icon
                v-else-if="senderStatus === 'success'"
                icon="mdi-check-circle"
                color="success"
                class="mr-1"
              />
              <span>
                {{ senderStatusText }}
              </span>
            </div>
          </div>
        </div>

        <!-- TAB 2: RECEIVE VAULT -->
        <div v-if="activeTab === 'receive'">
          <!-- State 1: Input Code & Connect -->
          <div v-if="!receivedVault">
            <p class="text-caption text-medium-emphasis mb-3">
              {{ t('sync.receiveInstructions') }}
            </p>

            <v-text-field
              v-model="receiveCode"
              :label="t('sync.enterCode')"
              placeholder="123 456"
              prepend-inner-icon="mdi-key"
              variant="outlined"
              maxlength="8"
              class="text-h6 font-monospace mb-2"
              :disabled="receiverStatus === 'connecting' || receiverStatus === 'receiving'"
              @keyup.enter="handleConnectAndReceive"
            />

            <v-btn
              block
              color="primary"
              size="large"
              prepend-icon="mdi-download"
              :loading="receiverStatus === 'connecting' || receiverStatus === 'receiving'"
              :disabled="!isReceiveCodeValid"
              @click="handleConnectAndReceive"
            >
              {{ t('sync.connectAndReceive') }}
            </v-btn>

            <div v-if="receiverStatus !== 'idle'" class="d-flex align-center justify-center text-caption text-medium-emphasis pt-3">
              <v-progress-circular
                v-if="receiverStatus === 'connecting' || receiverStatus === 'receiving'"
                indeterminate
                size="16"
                width="2"
                color="primary"
                class="mr-2"
              />
              <span>{{ receiverStatusText }}</span>
            </div>

            <v-divider class="my-4"></v-divider>

            <div class="text-caption font-weight-medium mb-1 text-medium-emphasis">
              {{ t('sync.orManualPaste') }}
            </div>
            <v-textarea
              v-model="pastePayloadText"
              :placeholder="t('sync.pasteCodePlaceholder')"
              rows="2"
              variant="outlined"
              density="compact"
              class="font-monospace text-caption mb-2"
              hide-details
            />
            <v-btn
              block
              variant="tonal"
              color="primary"
              size="default"
              prepend-icon="mdi-import"
              :disabled="!pastePayloadText.trim()"
              @click="handleImportFromPastedText"
            >
              {{ t('sync.importFromCode') }}
            </v-btn>
          </div>

          <!-- State 2: Preview & Import Options -->
          <div v-else>
            <v-card variant="tonal" color="primary" class="pa-4 mb-4">
              <div class="text-subtitle-1 font-weight-bold mb-1">
                <v-icon icon="mdi-package-down" class="mr-1" />
                {{ t('sync.previewTitle') }}: {{ receivedVault.name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                <div>{{ t('app.db.meds') }}: <strong>{{ receivedVault.medsCount }}</strong></div>
                <div>{{ t('app.db.entries') }}: <strong>{{ receivedVault.calendarCount }}</strong></div>
                <div v-if="receivedVault.modifiedAt">
                  {{ t('app.db.modified') }}: {{ formatTimestamp(receivedVault.modifiedAt) }}
                </div>
              </div>
            </v-card>

            <!-- Conflict Strategy when matching name exists -->
            <div v-if="existingConflictDb" class="mb-4">
              <div class="text-subtitle-2 font-weight-bold text-warning mb-1">
                <v-icon icon="mdi-alert" color="warning" size="small" class="mr-1" />
                {{ t('sync.conflictTitle') }}
              </div>
              <p class="text-caption text-medium-emphasis mb-2">
                {{ t('sync.conflictMessage', { name: receivedVault.name }) }}
              </p>

              <v-radio-group v-model="conflictMode" density="compact" hide-details>
                <v-radio
                  value="overwrite"
                  :label="t('sync.modeOverwrite')"
                  color="warning"
                />
                <v-radio
                  value="copy"
                  :label="t('sync.modeCopy')"
                  color="primary"
                />
              </v-radio-group>
            </div>

            <!-- Save Action Button -->
            <v-btn
              block
              color="primary"
              size="large"
              prepend-icon="mdi-content-save"
              @click="handleSaveReceivedVault"
            >
              {{ t('sync.saveVault') }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as syncService from '../utils/syncService';
import * as dbAdapter from '../utils/indexedDbAdapter';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  initialVaultId: {
    type: Number,
    default: null,
  },
  initialTab: {
    type: String,
    default: null, // 'send' | 'receive'
  },
  databases: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'vault-imported']);

const { t } = useI18n();

// Tab State
const activeTab = ref('send');

// Send State
const selectedVaultId = ref(props.initialVaultId || (props.databases[0]?.id ?? null));
const currentSyncCode = ref('');
const qrCodeDataUrl = ref('');
const senderStatus = ref('idle'); // 'idle' | 'waiting' | 'connecting' | 'success' | 'error'
const codeCopied = ref(false);
let senderSession = null;

// Receive State
const receiveCode = ref('');
const pastePayloadText = ref('');
const receiverStatus = ref('idle'); // 'idle' | 'connecting' | 'receiving' | 'received' | 'error'
const receivedPayload = ref(null);
const receivedVault = ref(null);
const conflictMode = ref('copy'); // 'overwrite' | 'copy'
let receiverSession = null;

// Common Feedback
const errorMessage = ref('');
const successMessage = ref('');

const formattedSyncCode = computed(() => {
  if (!currentSyncCode.value) return '';
  const code = currentSyncCode.value;
  if (code.length === 6) {
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  }
  return code;
});

const isReceiveCodeValid = computed(() => {
  const norm = syncService.normalizeSyncCode(receiveCode.value);
  return norm.length === 6;
});

const senderStatusText = computed(() => {
  if (senderStatus.value === 'waiting') return t('sync.waitingForReceiver');
  if (senderStatus.value === 'connecting') return t('sync.connected');
  if (senderStatus.value === 'success') {
    const db = props.databases.find(d => d.id === selectedVaultId.value);
    return t('sync.sendSuccess', { name: db?.name || '' });
  }
  return '';
});

const receiverStatusText = computed(() => {
  if (receiverStatus.value === 'connecting') return t('sync.connecting');
  if (receiverStatus.value === 'receiving') return t('sync.receiving');
  return '';
});

const existingConflictDb = computed(() => {
  if (!receivedVault.value) return null;
  return props.databases.find(db => db.name.toLowerCase() === receivedVault.value.name.toLowerCase());
});

// Format timestamp helper
function formatTimestamp(isoStr) {
  try {
    return new Date(isoStr).toLocaleString();
  } catch (e) {
    return isoStr;
  }
}

// Reset all internal form and session state
function resetState() {
  cleanupSessions();
  errorMessage.value = '';
  successMessage.value = '';
  receivedPayload.value = null;
  receivedVault.value = null;
  receiveCode.value = '';
  pastePayloadText.value = '';
  receiverStatus.value = 'idle';
  senderStatus.value = 'idle';
  currentSyncCode.value = '';
  qrCodeDataUrl.value = '';
  codeCopied.value = false;
}

// Close and clean up sessions
function handleClose() {
  resetState();
  emit('update:modelValue', false);
}

function cleanupSessions() {
  if (senderSession) {
    senderSession.close();
    senderSession = null;
  }
  if (receiverSession) {
    receiverSession.close();
    receiverSession = null;
  }
}

// --- Sender Implementation ---
async function initSenderSession() {
  cleanupSessions();
  errorMessage.value = '';
  successMessage.value = '';

  if (!selectedVaultId.value) return;

  senderStatus.value = 'waiting';

  try {
    senderSession = syncService.startSenderSession({
      vaultId: selectedVaultId.value,
      onCodeReady: async (code) => {
        currentSyncCode.value = code;
        try {
          qrCodeDataUrl.value = await syncService.generateQrCodeDataUrl(code);
        } catch (err) {
          console.error('QR generation failed:', err);
        }
      },
      onConnected: () => {
        senderStatus.value = 'connecting';
      },
      onTransferred: () => {
        senderStatus.value = 'success';
        const db = props.databases.find(d => d.id === selectedVaultId.value);
        successMessage.value = t('sync.sendSuccess', { name: db?.name || '' });
      },
      onError: (err) => {
        senderStatus.value = 'error';
        errorMessage.value = t('sync.errorTransfer', { error: err.message || err });
      }
    });
  } catch (err) {
    senderStatus.value = 'error';
    errorMessage.value = t('sync.errorTransfer', { error: err.message || err });
  }
}

async function copySyncCode() {
  if (!currentSyncCode.value) return;
  try {
    await navigator.clipboard.writeText(currentSyncCode.value);
    codeCopied.value = true;
    setTimeout(() => {
      codeCopied.value = false;
    }, 3000);
  } catch (e) {
    console.error('Clipboard copy failed:', e);
  }
}

async function copyEncryptedPayload() {
  if (!selectedVaultId.value) return;
  try {
    const vaultEntry = await dbAdapter.getFullDatabase(selectedVaultId.value);
    if (!vaultEntry) throw new Error('Vault not found');
    const payload = syncService.exportVaultForSync(vaultEntry);
    const jsonString = JSON.stringify(payload);
    await navigator.clipboard.writeText(jsonString);
    successMessage.value = t('sync.encryptedTextCopied');
    setTimeout(() => {
      successMessage.value = '';
    }, 4000);
  } catch (err) {
    errorMessage.value = t('sync.errorTransfer', { error: err.message || err });
  }
}

function handleImportFromPastedText() {
  errorMessage.value = '';
  try {
    const raw = pastePayloadText.value.trim();
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const validation = syncService.validateSyncPayload(parsed);
    if (!validation.isValid) {
      errorMessage.value = validation.error || t('sync.errorInvalidCode');
      return;
    }
    receivedPayload.value = parsed;
    receivedVault.value = parsed.vault;
    if (existingConflictDb.value) {
      conflictMode.value = 'copy';
    }
  } catch (err) {
    errorMessage.value = t('sync.errorTransfer', { error: err.message || 'Invalid format' });
  }
}

// --- Receiver Implementation ---
async function handleConnectAndReceive() {
  cleanupSessions();
  errorMessage.value = '';
  successMessage.value = '';
  receivedPayload.value = null;
  receivedVault.value = null;

  const normalized = syncService.normalizeSyncCode(receiveCode.value);
  if (normalized.length !== 6) {
    errorMessage.value = t('sync.errorInvalidCode');
    return;
  }

  receiverStatus.value = 'connecting';

  try {
    receiverSession = syncService.startReceiverSession({
      syncCode: normalized,
      onConnected: () => {
        receiverStatus.value = 'receiving';
      },
      onPayloadReceived: (payload) => {
        receiverStatus.value = 'received';
        receivedPayload.value = payload;
        receivedVault.value = payload.vault;

        if (existingConflictDb.value) {
          conflictMode.value = 'copy';
        }
      },
      onError: (err) => {
        receiverStatus.value = 'error';
        errorMessage.value = t('sync.errorConnectionFailed');
      }
    });
  } catch (err) {
    receiverStatus.value = 'error';
    errorMessage.value = t('sync.errorConnectionFailed');
  }
}

async function handleSaveReceivedVault() {
  if (!receivedPayload.value) return;

  try {
    const isConflict = !!existingConflictDb.value;
    let importOptions = { mode: 'create' };

    if (isConflict && conflictMode.value === 'overwrite') {
      importOptions = {
        mode: 'overwrite',
        targetId: existingConflictDb.value.id,
      };
    } else if (isConflict && conflictMode.value === 'copy') {
      importOptions = {
        mode: 'create',
        newName: `${receivedVault.value.name} (${t('dialog.copy') || 'Kopie'})`,
      };
    }

    const savedId = await syncService.importVaultFromSync(receivedPayload.value, importOptions);
    emit('vault-imported', savedId);
    successMessage.value = t('sync.importSuccess', { name: receivedVault.value.name });
    
    // Close after short feedback
    setTimeout(() => {
      handleClose();
    }, 1200);
  } catch (err) {
    errorMessage.value = t('sync.errorTransfer', { error: err.message || err });
  }
}

// Watch dialog open to setup tab and auto-init sender if appropriate
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    resetState();

    // Determine default tab
    if (props.initialTab) {
      activeTab.value = props.initialTab;
    } else if (props.initialVaultId) {
      activeTab.value = 'send';
    } else if (props.databases.length === 0) {
      activeTab.value = 'receive';
    } else {
      activeTab.value = 'send';
    }

    // Determine selected vault
    if (props.initialVaultId) {
      selectedVaultId.value = props.initialVaultId;
    } else if (props.databases.length > 0) {
      selectedVaultId.value = props.databases[0].id;
    } else {
      selectedVaultId.value = null;
    }

    if (activeTab.value === 'send' && selectedVaultId.value) {
      initSenderSession();
    }
  } else {
    resetState();
  }
}, { immediate: true });

// Watch tab change by user
watch(activeTab, (tab) => {
  errorMessage.value = '';
  successMessage.value = '';
  if (tab === 'send' && props.modelValue && selectedVaultId.value) {
    initSenderSession();
  } else {
    cleanupSessions();
  }
});

// Watch initialVaultId prop update
watch(() => props.initialVaultId, (newId) => {
  if (newId) {
    selectedVaultId.value = newId;
    activeTab.value = 'send';
    if (props.modelValue) {
      initSenderSession();
    }
  }
});

onUnmounted(() => {
  cleanupSessions();
});
</script>

<style scoped>
.letter-spacing-wide {
  letter-spacing: 0.25em;
}
.font-monospace {
  font-family: 'Courier New', Courier, monospace;
}
</style>
