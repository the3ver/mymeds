<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ConfirmDialog from './ConfirmDialog.vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const confirmDeleteMedsDialog = ref(false)
const confirmDeleteCalendarDialog = ref(false)
const confirmDeleteAllDialog = ref(false)

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