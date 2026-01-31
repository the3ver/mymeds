<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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

// Load settings when dialog opens or component mounts
onMounted(() => {
  loadSettings()
})

watch(() => props.modelValue, (val) => {
  if (val) loadSettings()
})

const loadSettings = () => {
  language.value = localStorage.getItem('myMedsLocale') || 'en'
  displayMode.value = localStorage.getItem('myMedsDisplayMode') || 'pills'
  sortMode.value = localStorage.getItem('myMedsSortMode') || 'added'
  uiScale.value = localStorage.getItem('myMedsUiScale') || 'normal'
  
  const savedYellow = localStorage.getItem('myMedsYellowLimit')
  if (savedYellow) yellowLimit.value = parseInt(savedYellow)

  const savedRed = localStorage.getItem('myMedsRedLimit')
  if (savedRed) redLimit.value = parseInt(savedRed)
}

// Watchers to save settings immediately
watch(language, (val) => {
  locale.value = val
  localStorage.setItem('myMedsLocale', val)
})

watch(displayMode, (val) => {
  localStorage.setItem('myMedsDisplayMode', val)
  window.dispatchEvent(new Event('storage-display-mode-changed'))
})

watch(sortMode, (val) => {
  localStorage.setItem('myMedsSortMode', val)
  window.dispatchEvent(new Event('storage-sort-mode-changed'))
})

watch(uiScale, (val) => {
  localStorage.setItem('myMedsUiScale', val)
  const root = document.documentElement
  if (val === 'small') root.style.fontSize = '14px'
  else if (val === 'large') root.style.fontSize = '18px'
  else root.style.fontSize = '16px'
})

watch([yellowLimit, redLimit], () => {
  localStorage.setItem('myMedsYellowLimit', yellowLimit.value)
  localStorage.setItem('myMedsRedLimit', redLimit.value)
  window.dispatchEvent(new Event('storage-limits-changed'))
})

const resetSettings = () => {
  // Reset values to defaults
  language.value = 'en'
  displayMode.value = 'pills'
  sortMode.value = 'added'
  uiScale.value = 'normal'
  yellowLimit.value = 21
  redLimit.value = 7
  
  // Reset overview (not in this dialog but part of settings)
  localStorage.setItem('myMedsShowOverview', 'true')
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
            <v-btn-toggle v-model="sortMode" mandatory color="primary" class="d-flex w-100" divided>
              <v-btn value="added" class="flex-grow-1">{{ t('app.sortAdded') }}</v-btn>
              <v-btn value="name" class="flex-grow-1">{{ t('app.sortName') }}</v-btn>
              <v-btn value="days" class="flex-grow-1">{{ t('app.sortDays') }}</v-btn>
            </v-btn-toggle>
          </div>

          <!-- Display Mode -->
          <div class="mb-6">
            <div class="text-subtitle-1 font-weight-bold mb-2">{{ t('app.displayMode') }}</div>
            <v-btn-toggle v-model="displayMode" mandatory color="primary" class="d-flex w-100" divided>
              <v-btn value="pills" class="flex-grow-1">
                <v-icon start class="d-none d-sm-inline-flex">mdi-pill</v-icon>
                {{ t('app.showPills') }}
              </v-btn>
              <v-btn value="days" class="flex-grow-1">
                <v-icon start class="d-none d-sm-inline-flex">mdi-calendar-clock</v-icon>
                {{ t('app.showDays') }}
              </v-btn>
              <v-btn value="packages" class="flex-grow-1">
                <v-icon start class="d-none d-sm-inline-flex">mdi-package-variant-closed</v-icon>
                {{ t('app.showPackages') }}
              </v-btn>
            </v-btn-toggle>
          </div>

          <!-- UI Scale -->
          <div class="mb-6">
            <div class="text-subtitle-1 font-weight-bold mb-2">{{ t('app.uiScale') }}</div>
            <v-btn-toggle v-model="uiScale" mandatory color="primary" class="d-flex w-100" divided>
              <v-btn value="small" class="flex-grow-1">{{ t('app.scaleSmall') }}</v-btn>
              <v-btn value="normal" class="flex-grow-1">{{ t('app.scaleNormal') }}</v-btn>
              <v-btn value="large" class="flex-grow-1">{{ t('app.scaleLarge') }}</v-btn>
            </v-btn-toggle>
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
            <v-btn-toggle v-model="language" mandatory color="primary" class="d-flex w-100" divided>
              <v-btn value="en" class="flex-grow-1">English</v-btn>
              <v-btn value="de" class="flex-grow-1">Deutsch</v-btn>
            </v-btn-toggle>
          </div>

          <v-divider class="mb-6"></v-divider>

          <!-- Reset Button -->
          <div class="d-flex justify-center">
            <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-restore"
              @click="confirmResetDialog = true"
            >
              {{ t('app.reset') }}
            </v-btn>
          </div>

        </v-container>
      </v-card-text>
    </v-card>

    <!-- Confirm Reset Dialog -->
    <ConfirmDialog
      v-model="confirmResetDialog"
      :title="t('app.reset')"
      :message="t('app.resetConfirm')"
      :confirm-text="t('dialog.confirm')"
      :cancel-text="t('dialog.cancel')"
      @confirm="resetSettings"
    />
  </v-dialog>
</template>

<style scoped>
</style>