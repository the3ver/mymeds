<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { state as appState } from '../../../app-state'
import * as dataService from '../utils/dataService'
import * as importExportService from '../utils/importExportService'
import ConfirmDialog from './ConfirmDialog.vue'
import ExportDialog from './ExportDialog.vue'
import ImportDialog from './ImportDialog.vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const confirmDeleteAllDialog = ref(false)
const exportDialog = ref(false)
const importDialog = ref(false)
const importStats = ref(null)
const fileInput = ref(null)
const exportDataContent = ref('')
const exportFileName = ref('')
const showResumeImportMessage = ref(false)
const showSaveStateMessage = ref(false)

onMounted(() => {
  if (appState.pendingIntent === 'import') {
    showResumeImportMessage.value = true;
    appState.pendingIntent = null;
  }
});

const deleteAll = async () => {
  await dataService.deleteAllData()
  window.location.reload()
}

const handleExport = () => {
  const { exportDataContent: content, exportFileName: name } = importExportService.prepareExport(appState.decryptedData)
  exportDataContent.value = content
  exportFileName.value = name
  exportDialog.value = true
}

const triggerImport = async () => {
  await dataService.saveRecoveryState(appState.activeDatabaseId, appState.activeDatabasePassword, 'import');
  showSaveStateMessage.value = true;
  setTimeout(() => showSaveStateMessage.value = false, 3000);
  fileInput.value.click()
}

const onFileSelected = async (event) => {
  const file = event.target.files[0]
  if (!file) {
    await dataService.clearRecoveryState();
    return;
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    const result = importExportService.processImport(e.target.result)
    if (result.success) {
      importStats.value = result.stats
      importDialog.value = true
    } else {
      alert(t('app.importError') + (result.error ? `\n${result.error}` : ''))
      await dataService.clearRecoveryState();
    }
    event.target.value = ''
  }
  reader.readAsText(file)
}

const handleConfirmImport = async () => {
  appState.decryptedData.meds = importStats.value.data.meds
  appState.decryptedData.calendar = importStats.value.data.calendar

  alert(t('app.importSuccess'))
  importDialog.value = false
  await dataService.clearRecoveryState();
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" fullscreen transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar color="primary">
        <v-btn icon="mdi-close" @click="close"></v-btn>
        <v-toolbar-title>{{ t('app.dataManagement') }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-container>
          <v-alert
            v-if="showResumeImportMessage"
            type="info"
            variant="tonal"
            class="mb-6"
            border="start"
          >
            Your session was restored. Please select the import file again to continue.
          </v-alert>

          <!-- Import / Export -->
          <div class="text-h6 mb-4">Import / Export</div>
          <div class="d-flex flex-column gap-2 mb-6">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-export"
              @click="handleExport"
            >
              {{ t('app.exportData') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-import"
              @click="triggerImport"
            >
              {{ t('app.importData') }}
            </v-btn>
            <input
              type="file"
              ref="fileInput"
              style="display: none"
              accept=".json"
              @change="onFileSelected"
            >
          </div>

          <v-divider class="mb-6"></v-divider>

          <!-- Delete Actions -->
          <div class="text-h6 mb-4">{{ t('dialog.delete') }}</div>
          <div class="d-flex flex-column gap-2 mb-6">
            <v-btn
              color="error"
              variant="elevated"
              prepend-icon="mdi-delete-forever"
              @click="confirmDeleteAllDialog = true"
            >
              {{ t('app.deleteAll') }}
            </v-btn>
          </div>
        </v-container>
      </v-card-text>
    </v-card>

    <ExportDialog
      v-model="exportDialog"
      :data-content="exportDataContent"
      :file-name="exportFileName"
    />

    <ImportDialog
      v-model="importDialog"
      :stats="importStats"
      @confirm="handleConfirmImport"
    />

    <ConfirmDialog
      v-model="confirmDeleteAllDialog"
      :title="t('app.deleteAll')"
      :message="t('app.deleteAllConfirm')"
      :confirm-text="t('dialog.delete')"
      :cancel-text="t('dialog.cancel')"
      :confirm-input-label="t('app.deleteConfirmLabel')"
      :confirm-input-value="t('app.deleteConfirmValue')"
      @confirm="deleteAll"
    />

    <!-- Debug Snackbar -->
    <v-snackbar
      v-model="showSaveStateMessage"
      :timeout="3000"
      color="blue-grey"
    >
      DEBUG: Saving recovery state...
    </v-snackbar>
  </v-dialog>
</template>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
