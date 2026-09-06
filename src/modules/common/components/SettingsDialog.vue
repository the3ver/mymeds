<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import * as dataService from '../utils/dataService'
import * as biometricService from '../utils/biometricSessionService'
import * as reminderService from '../utils/reminderService'
import ConfirmDialog from './ConfirmDialog.vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
const { t, locale } = useI18n()

// State
const language = ref(locale.value)
const displayMode = ref('pills')
const sortMode = ref('added')
const uiScale = ref('normal')
const yellowLimit = ref(21)
const redLimit = ref(7)
const confirmResetDialog = ref(false)
const confirmClearBiometricsDialog = ref(false)
const biometricsClearedSnackbar = ref(false)

// Reminders State
const isReminderSupported = ref(false)
const reminderEnabled = ref(false)
const reminderSlots = ref([])
const notificationPermission = ref('default')
const timeOptions = reminderService.generateHalfHourOptions()
const testNotificationSnackbar = ref(false)

async function clearAllBiometrics() {
  await biometricService.clearAllBiometrics()
  biometricsClearedSnackbar.value = true
}

// Load settings when dialog opens or component mounts
onMounted(() => {
  loadSettings()
})

watch(() => props.modelValue, (val) => {
  if (val) loadSettings()
})

async function loadSettings() {
  const settings = await dataService.getSettings()
  language.value = settings.locale
  displayMode.value = settings.displayMode
  sortMode.value = settings.sortMode
  uiScale.value = settings.uiScale
  yellowLimit.value = settings.yellowLimit
  redLimit.value = settings.redLimit

  // Check reminders support
  isReminderSupported.value = reminderService.isReminderSupported()
  if (typeof window !== 'undefined' && 'Notification' in window) {
    notificationPermission.value = Notification.permission
  }
  const reminders = await dataService.getReminderSettings()
  reminderEnabled.value = !!reminders.enabled
  reminderSlots.value = Array.isArray(reminders.slots) ? JSON.parse(JSON.stringify(reminders.slots)) : []
}

async function saveReminderConfig() {
  const current = await dataService.getReminderSettings()
  await dataService.saveReminderSettings({
    ...current,
    enabled: reminderEnabled.value,
    slots: reminderSlots.value
  })
}

async function toggleReminders(val) {
  if (val) {
    const perm = await reminderService.requestNotificationPermission()
    notificationPermission.value = perm
    if (perm !== 'granted') {
      reminderEnabled.value = false
      await saveReminderConfig()
      return
    }
    reminderEnabled.value = true
    await reminderService.registerPeriodicSync()
    await saveReminderConfig()
  } else {
    reminderEnabled.value = false
    await reminderService.unregisterPeriodicSync()
    await saveReminderConfig()
  }
}

function addCustomSlot() {
  reminderSlots.value.push({
    id: 'custom_' + Date.now(),
    time: '14:00',
    enabled: true
  })
  saveReminderConfig()
}

function removeCustomSlot(slotId) {
  reminderSlots.value = reminderSlots.value.filter(s => s.id !== slotId)
  saveReminderConfig()
}

async function triggerTestNotification() {
  const success = await reminderService.sendTestNotification(
    t('reminders.notificationTitle'),
    t('reminders.notificationBody')
  )
  if (success) {
    testNotificationSnackbar.value = true
  }
}

// Watchers to save settings immediately
watch(language, (val) => {
  locale.value = val
  dataService.saveLocale(val)
})

watch(displayMode, (val) => {
  dataService.saveDisplayMode(val)
  window.dispatchEvent(new Event('storage-display-mode-changed'))
})

watch(sortMode, (val) => {
  dataService.saveSortMode(val)
  window.dispatchEvent(new Event('storage-sort-mode-changed'))
})

watch(uiScale, (val) => {
  dataService.saveUiScale(val)
  const root = document.documentElement
  if (val === 'small') root.style.fontSize = '14px'
  else if (val === 'large') root.style.fontSize = '18px'
  else root.style.fontSize = '16px'
})

watch([yellowLimit, redLimit], () => {
  dataService.saveYellowLimit(yellowLimit.value)
  dataService.saveRedLimit(redLimit.value)
  window.dispatchEvent(new Event('storage-limits-changed'))
})

watch(reminderSlots, () => {
  saveReminderConfig()
}, { deep: true })

const resetSettings = async () => {
  // Reset values to defaults
  language.value = 'de'
  displayMode.value = 'pills'
  sortMode.value = 'added'
  uiScale.value = 'normal'
  yellowLimit.value = 21
  redLimit.value = 7

  reminderEnabled.value = false
  reminderSlots.value = [
    { id: 'morning', labelKey: 'reminders.morning', time: '08:00', enabled: true },
    { id: 'noon', labelKey: 'reminders.noon', time: '12:00', enabled: true },
    { id: 'evening', labelKey: 'reminders.evening', time: '18:00', enabled: true },
    { id: 'night', labelKey: 'reminders.night', time: '22:00', enabled: false },
  ]

  // Save them
  await Promise.all([
    dataService.saveLocale(language.value),
    dataService.saveDisplayMode(displayMode.value),
    dataService.saveSortMode(sortMode.value),
    dataService.saveUiScale(uiScale.value),
    dataService.saveYellowLimit(yellowLimit.value),
    dataService.saveRedLimit(redLimit.value),
    dataService.saveShowOverview(true),
    dataService.saveReminderSettings({
      enabled: false,
      slots: reminderSlots.value,
      lastNotified: {}
    }),
    reminderService.unregisterPeriodicSync()
  ]);

  // Trigger updates
  window.dispatchEvent(new Event('storage-display-mode-changed'))
  window.dispatchEvent(new Event('storage-sort-mode-changed'))
  window.dispatchEvent(new Event('storage-limits-changed'))
  window.dispatchEvent(new Event('storage-overview-changed'))
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
        <v-toolbar-title>{{ t('app.settings') }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-container>
          <!-- Sort Mode -->
          <div class="mb-6">
            <div class="text-subtitle-1 font-weight-bold mb-2">{{ t('app.sortMode') }}</div>
            <v-radio-group v-model="sortMode" color="primary">
              <v-radio :label="t('app.sortAdded')" value="added"></v-radio>
              <v-radio :label="t('app.sortName')" value="name"></v-radio>
              <v-radio :label="t('app.sortDays')" value="days"></v-radio>
            </v-radio-group>
          </div>

          <!-- Display Mode -->
          <div class="mb-6">
            <div class="text-subtitle-1 font-weight-bold mb-2">{{ t('app.displayMode') }}</div>
            <v-radio-group v-model="displayMode" color="primary">
              <v-radio value="pills">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-icon start class="mr-2">mdi-pill</v-icon>
                    {{ t('app.showPills') }}
                  </div>
                </template>
              </v-radio>
              <v-radio value="days">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-icon start class="mr-2">mdi-calendar-clock</v-icon>
                    {{ t('app.showDays') }}
                  </div>
                </template>
              </v-radio>
              <v-radio value="packages">
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-icon start class="mr-2">mdi-package-variant-closed</v-icon>
                    {{ t('app.showPackages') }}
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </div>

          <!-- UI Scale -->
          <div class="mb-6">
            <div class="text-subtitle-1 font-weight-bold mb-2">{{ t('app.uiScale') }}</div>
            <v-radio-group v-model="uiScale" color="primary">
              <v-radio :label="t('app.scaleSmall')" value="small"></v-radio>
              <v-radio :label="t('app.scaleNormal')" value="normal"></v-radio>
              <v-radio :label="t('app.scaleLarge')" value="large"></v-radio>
            </v-radio-group>
          </div>

          <!-- Limits -->
          <div class="text-h6 mb-4">{{ t('app.limits') }}</div>
          <v-row class="mb-6">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="yellowLimit"
                :label="t('app.yellowLimit')"
                type="number"
                variant="outlined"
                hide-details
                class="mb-4 mb-sm-0"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="redLimit"
                :label="t('app.redLimit')"
                type="number"
                variant="outlined"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="mb-6"></v-divider>

          <!-- Language -->
          <div class="mb-6">
            <div class="text-subtitle-1 font-weight-bold mb-2">Language / Sprache</div>
            <v-radio-group v-model="language" color="primary">
              <v-radio label="English" value="en"></v-radio>
              <v-radio label="Deutsch" value="de"></v-radio>
            </v-radio-group>
          </div>

          <v-divider class="mb-6"></v-divider>

          <!-- Biometrics -->
          <div class="mb-6">
            <div class="text-subtitle-1 font-weight-bold mb-2">{{ t('biometrics.title') }}</div>
            <p class="text-body-2 text-medium-emphasis mb-3">
              {{ t('biometrics.activeOnThisDevice') }}
            </p>
            <v-btn
              color="warning"
              variant="outlined"
              prepend-icon="mdi-fingerprint-off"
              @click="confirmClearBiometricsDialog = true"
            >
              {{ t('biometrics.clearAllSessions') }}
            </v-btn>
          </div>

          <v-divider class="mb-6"></v-divider>

          <!-- Reminders (Only visible if supported / Android TWA or debug flag) -->
          <div v-if="isReminderSupported" class="mb-6">
            <div class="text-subtitle-1 font-weight-bold mb-1">{{ t('reminders.title') }}</div>
            <p class="text-body-2 text-medium-emphasis mb-3">
              {{ t('reminders.description') }}
            </p>

            <!-- Permission Warning if blocked -->
            <v-alert
              v-if="notificationPermission === 'denied'"
              type="warning"
              variant="tonal"
              density="compact"
              class="mb-3"
            >
              {{ t('reminders.permissionDenied') }}
            </v-alert>

            <!-- Main Toggle Switch -->
            <v-switch
              v-model="reminderEnabled"
              color="primary"
              :label="t('reminders.enable')"
              hide-details
              class="mb-4"
              @update:model-value="toggleReminders"
            ></v-switch>

            <!-- Slot Configuration (Visible when enabled) -->
            <div v-if="reminderEnabled" class="pl-2">
              <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold mb-2">
                {{ t('reminders.standardTimes') }}
              </div>

              <!-- Standard Slots -->
              <div
                v-for="slot in reminderSlots.filter(s => ['morning', 'noon', 'evening', 'night'].includes(s.id))"
                :key="slot.id"
                class="d-flex align-center justify-space-between mb-2"
              >
                <v-checkbox
                  v-model="slot.enabled"
                  :label="t(slot.labelKey || ('reminders.' + slot.id))"
                  hide-details
                  density="compact"
                  color="primary"
                  class="mr-2"
                ></v-checkbox>
                <v-select
                  v-model="slot.time"
                  :items="timeOptions"
                  density="compact"
                  variant="outlined"
                  hide-details
                  :disabled="!slot.enabled"
                  style="max-width: 130px;"
                ></v-select>
              </div>

              <!-- Custom Slots -->
              <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold mt-4 mb-2">
                {{ t('reminders.customTimes') }}
              </div>

              <div
                v-for="slot in reminderSlots.filter(s => !['morning', 'noon', 'evening', 'night'].includes(s.id))"
                :key="slot.id"
                class="d-flex align-center justify-space-between mb-2"
              >
                <div class="d-flex align-center">
                  <v-checkbox
                    v-model="slot.enabled"
                    hide-details
                    density="compact"
                    color="primary"
                    class="mr-1"
                  ></v-checkbox>
                  <span class="text-body-2">{{ t('reminders.custom') }}</span>
                </div>
                <div class="d-flex align-center">
                  <v-select
                    v-model="slot.time"
                    :items="timeOptions"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :disabled="!slot.enabled"
                    style="max-width: 130px;"
                    class="mr-2"
                  ></v-select>
                  <v-btn
                    icon="mdi-delete-outline"
                    variant="text"
                    color="error"
                    size="small"
                    :aria-label="t('reminders.removeCustom')"
                    @click="removeCustomSlot(slot.id)"
                  ></v-btn>
                </div>
              </div>

              <v-btn
                variant="outlined"
                color="primary"
                size="small"
                prepend-icon="mdi-plus"
                class="mt-2 mb-4"
                @click="addCustomSlot"
              >
                {{ t('reminders.addCustom') }}
              </v-btn>

              <div class="d-flex mt-2">
                <v-btn
                  variant="tonal"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-bell-ring-outline"
                  @click="triggerTestNotification"
                >
                  {{ t('reminders.sendTest') }}
                </v-btn>
              </div>
            </div>
          </div>

          <v-divider v-if="isReminderSupported" class="mb-6"></v-divider>

          <!-- Reset Button -->
          <div class="d-flex justify-center">
            <v-btn
              color="warning"
              variant="text"
              prepend-icon="mdi-restore"
              @click="confirmResetDialog = true"
            >
              {{ t('app.reset') }}
            </v-btn>
          </div>

        </v-container>
      </v-card-text>
    </v-card>

    <!-- Confirm Clear Biometrics Dialog -->
    <ConfirmDialog
      v-model="confirmClearBiometricsDialog"
      :title="t('biometrics.clearAllSessions')"
      :message="t('biometrics.clearAllConfirm')"
      :confirm-text="t('dialog.confirm')"
      :cancel-text="t('dialog.cancel')"
      @confirm="clearAllBiometrics"
    />

    <!-- Confirm Reset Dialog -->
    <ConfirmDialog
      v-model="confirmResetDialog"
      :title="t('app.reset')"
      :message="t('app.resetConfirm')"
      :confirm-text="t('dialog.confirm')"
      :cancel-text="t('dialog.cancel')"
      @confirm="resetSettings"
    />

    <v-snackbar v-model="biometricsClearedSnackbar" color="success" :timeout="3000">
      {{ t('biometrics.clearAllSuccess') }}
    </v-snackbar>

    <v-snackbar v-model="testNotificationSnackbar" color="success" :timeout="3000">
      {{ t('reminders.testSent') }}
    </v-snackbar>
  </v-dialog>
</template>
