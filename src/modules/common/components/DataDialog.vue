<script setup>
import { ref } from 'vue'
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

const triggerImport = () => {
  fileInput.value.click()
}

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return;

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = importExportService.processImport(e.target.result)
    if (result.success) {
      result.stats.currentMedsCount = appState.decryptedData.meds.length;
      result.stats.currentCalendarCount = appState.decryptedData.calendar.length;
      importStats.value = result.stats
      importDialog.value = true
    } else {
      alert(t('app.importError') + (result.error ? `\n${result.error}` : ''))
    }
    event.target.value = ''
  }
  reader.readAsText(file)
}

const handleConfirmImport = () => {
  // Directly update the reactive app state.
  appState.decryptedData.meds = importStats.value.data.meds
  appState.decryptedData.calendar = importStats.value.data.calendar
  appState.decryptedData.version += 1; // This will trigger the re-render in App.vue

  alert(t('app.importSuccess'))
  importDialog.value = false
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
  </v-dialog>
</template>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
