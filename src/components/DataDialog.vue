<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
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

const deleteMeds = () => {
  localStorage.removeItem('myMedsItems')
  localStorage.removeItem('lastDoseUpdate')
  window.location.reload() // Reload to refresh data
}

const deleteCalendar = () => {
  localStorage.removeItem('myMedsCalendarEntries')
  window.location.reload() // Reload to refresh data
}

const deleteAll = () => {
  localStorage.clear()
  window.location.reload() // Reload to refresh data
}

const prepareExport = () => {
  const meds = JSON.parse(localStorage.getItem('myMedsItems') || '[]')
  const calendar = JSON.parse(localStorage.getItem('myMedsCalendarEntries') || '[]')

  const data = {
    exportDate: new Date().toISOString(),
    meds: meds,
    calendar: calendar
  }

  exportDataContent.value = JSON.stringify(data, null, 2)

  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  exportFileName.value = `mymeds_daten_${day}.${month}.${year}.json`

  exportDialog.value = true
}

const triggerImport = () => {
  fileInput.value.click()
}

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)

      // Validate structure
      if (!data.meds || !data.calendar) {
        alert(t('app.importError'))
        return
      }

      const currentMeds = JSON.parse(localStorage.getItem('myMedsItems') || '[]')
      const currentCalendar = JSON.parse(localStorage.getItem('myMedsCalendarEntries') || '[]')

      importStats.value = {
        date: new Date(data.exportDate).toLocaleString(),
        medsCount: data.meds.length,
        currentMedsCount: currentMeds.length,
        calendarCount: data.calendar.length,
        currentCalendarCount: currentCalendar.length,
        data: data
      }

      importDialog.value = true

    } catch (error) {
      console.error('Import error:', error)
      alert(t('app.importError'))
    }
    // Reset file input
    event.target.value = ''
  }
  reader.readAsText(file)
}

const confirmImport = () => {
  const data = importStats.value.data
  localStorage.setItem('myMedsItems', JSON.stringify(data.meds))
  localStorage.setItem('myMedsCalendarEntries', JSON.stringify(data.calendar))

  // We do NOT update lastDoseUpdate here.
  // The user is responsible for the data consistency regarding daily doses.
  // The app will keep its current lastDoseUpdate state.

  alert(t('app.importSuccess'))
  window.location.reload()
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
              @click="prepareExport"
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
      @confirm="confirmImport"
    />

    <!-- Confirm Delete Meds Dialog -->
    <ConfirmDialog
      v-model="confirmDeleteMedsDialog"
      :title="t('app.deleteMeds')"
      :message="t('app.deleteMedsConfirm')"
      :confirm-text="t('dialog.delete')"
      :cancel-text="t('dialog.cancel')"
      @confirm="deleteMeds"
    />

    <!-- Confirm Delete Calendar Dialog -->
    <ConfirmDialog
      v-model="confirmDeleteCalendarDialog"
      :title="t('app.deleteCalendar')"
      :message="t('app.deleteCalendarConfirm')"
      :confirm-text="t('dialog.delete')"
      :cancel-text="t('dialog.cancel')"
      @confirm="deleteCalendar"
    />

    <!-- Confirm Delete All Dialog -->
    <ConfirmDialog
      v-model="confirmDeleteAllDialog"
      :title="t('app.deleteAll')"
      :message="t('app.deleteAllConfirm')"
      :confirm-text="t('dialog.delete')"
      :cancel-text="t('dialog.cancel')"
      @confirm="deleteAll"
    />
  </v-dialog>
</template>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>