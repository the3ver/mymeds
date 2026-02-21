<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
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

const confirmDeleteMedsDialog = ref(false)
const confirmDeleteCalendarDialog = ref(false)
const confirmDeleteAllDialog = ref(false)
const exportDialog = ref(false)
const importDialog = ref(false)
const importStats = ref(null)
const fileInput = ref(null)
const exportDataContent = ref('')
const exportFileName = ref('')

const deleteMeds = async () => {
  await dataService.deleteMedsData()
  window.location.reload()
}

const deleteCalendar = async () => {
  await dataService.deleteCalendarData()
  window.location.reload()
}

const deleteAll = async () => {
  await dataService.deleteAllData()
  window.location.reload()
}

const handleExport = async () => {
  const { exportDataContent: content, exportFileName: name } = await importExportService.prepareExport()
  exportDataContent.value = content
  exportFileName.value = name
  exportDialog.value = true
}

const triggerImport = () => {
  fileInput.value.click()
}

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    const result = await importExportService.processImport(e.target.result)
    if (result.success) {
      importStats.value = result.stats
      importDialog.value = true
    } else {
      alert(t('app.importError') + (result.error ? `\n${result.error}` : ''))
    }
    event.target.value = '' // Reset file input
  }
  reader.readAsText(file)
}

const handleConfirmImport = async () => {
  const success = await importExportService.confirmImport(importStats.value.data)
  if (success) {
    alert(t('app.importSuccess'))
    window.location.reload()
  } else {
    alert(t('app.importError'))
  }
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
              variant="outlined"
              prepend-icon="mdi-pill"
              @click="confirmDeleteMedsDialog = true"
            >
              {{ t('app.deleteMeds') }}
            </v-btn>
            <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-calendar"
              @click="confirmDeleteCalendarDialog = true"
            >
              {{ t('app.deleteCalendar') }}
            </v-btn>
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

    <!-- Export Dialog -->
    <ExportDialog
      v-model="exportDialog"
      :data-content="exportDataContent"
      :file-name="exportFileName"
    />

    <!-- Import Confirmation Dialog -->
    <ImportDialog
      v-model="importDialog"
      :stats="importStats"
      @confirm="handleConfirmImport"
    />

    <!-- Confirm Delete Meds Dialog -->
    <ConfirmDialog
      v-model="confirmDeleteMedsDialog"
      :title="t('app.deleteMeds')"
      :message="t('app.deleteMedsConfirm')"
      :confirm-text="t('dialog.delete')"
      :cancel-text="t('dialog.cancel')"
      :confirm-input-label="t('app.deleteConfirmLabel')"
      :confirm-input-value="t('app.deleteConfirmValue')"
      @confirm="deleteMeds"
    />

    <!-- Confirm Delete Calendar Dialog -->
    <ConfirmDialog
      v-model="confirmDeleteCalendarDialog"
      :title="t('app.deleteCalendar')"
      :message="t('app.deleteCalendarConfirm')"
      :confirm-text="t('dialog.delete')"
      :cancel-text="t('dialog.cancel')"
      :confirm-input-label="t('app.deleteConfirmLabel')"
      :confirm-input-value="t('app.deleteConfirmValue')"
      @confirm="deleteCalendar"
    />

    <!-- Confirm Delete All Dialog -->
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