<script setup>
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'
import * as dataService from '../utils/dataService'

const props = defineProps({
  modelValue: Boolean,
  isExistingUser: {
    type: Boolean,
    default: false,
  }
})

const emit = defineEmits(['update:modelValue'])

const theme = useTheme()
const { t, locale } = useI18n()
const disclaimerAccepted = ref(false)

const setTheme = (mode) => {
  theme.global.name.value = mode
  dataService.saveTheme(mode)
}

const setLanguage = (lang) => {
  locale.value = lang
  dataService.saveLocale(lang)
}

const onGetStarted = async () => {
  if (!disclaimerAccepted.value) return
  await dataService.saveDisclaimerAccepted(true)
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="540px" persistent scrollable>
    <v-card>
      <v-card-title class="text-h5 text-center pt-4">
        {{ isExistingUser ? t('welcome.existingUserTitle') : t('welcome.title') }}
      </v-card-title>
      
      <v-card-text class="pt-2">
        <p v-if="!isExistingUser" class="text-center mb-2">{{ t('welcome.thankYou') }}</p>
        <p v-else class="text-center mb-2 font-weight-medium text-body-1">{{ t('welcome.existingUserIntro') }}</p>
        <p class="text-center mb-6 text-body-2 text-grey-darken-1">{{ t('welcome.explanation') }}</p>

        <p class="mb-2 font-weight-bold text-center">{{ t('welcome.chooseLanguage') }}</p>
        <div class="d-flex justify-center gap-4 mb-6">
          <v-btn
            variant="outlined"
            :color="locale === 'en' ? 'primary' : ''"
            @click="setLanguage('en')"
          >
            English
          </v-btn>
          <v-btn
            variant="outlined"
            :color="locale === 'de' ? 'primary' : ''"
            @click="setLanguage('de')"
          >
            Deutsch
          </v-btn>
        </div>

        <p class="mb-2 font-weight-bold text-center">{{ t('welcome.chooseTheme') }}</p>
        <div class="d-flex justify-center gap-4 mb-6">
          <v-card
            variant="outlined"
            class="pa-4 cursor-pointer d-flex flex-column align-center"
            :color="theme.global.name.value === 'light' ? 'primary' : ''"
            @click="setTheme('light')"
            width="120"
          >
            <v-icon size="large" class="mb-2">mdi-weather-sunny</v-icon>
            <span>{{ t('welcome.light') }}</span>
          </v-card>

          <v-card
            variant="outlined"
            class="pa-4 cursor-pointer d-flex flex-column align-center"
            :color="theme.global.name.value === 'dark' ? 'primary' : ''"
            @click="setTheme('dark')"
            width="120"
          >
            <v-icon size="large" class="mb-2">mdi-weather-night</v-icon>
            <span>{{ t('welcome.dark') }}</span>
          </v-card>
        </div>

        <!-- Medical Disclaimer Alert / Card -->
        <v-alert
          type="warning"
          variant="tonal"
          border="start"
          class="mb-4 text-body-2 disclaimer-box"
        >
          <template #title>
            <span class="font-weight-bold">{{ t('welcome.disclaimer.title') }}</span>
          </template>
          <ul class="mt-2 pl-4">
            <li class="mb-1">{{ t('welcome.disclaimer.pointNoAdvice') }}</li>
            <li class="mb-1">{{ t('welcome.disclaimer.pointResponsibility') }}</li>
            <li class="mb-1">{{ t('welcome.disclaimer.pointSoftwareErrors') }}</li>
            <li class="mb-1">{{ t('welcome.disclaimer.pointConsult') }}</li>
            <li>{{ t('welcome.disclaimer.pointEmergency') }}</li>
          </ul>
        </v-alert>

        <v-checkbox
          v-model="disclaimerAccepted"
          color="primary"
          density="comfortable"
          hide-details
          class="mt-2"
        >
          <template #label>
            <span class="text-caption font-weight-medium">
              {{ t('welcome.disclaimer.checkbox') }}
            </span>
          </template>
        </v-checkbox>
      </v-card-text>

      <v-card-actions class="justify-center pb-4 pt-2">
        <v-btn
          color="primary"
          variant="elevated"
          size="large"
          :disabled="!disclaimerAccepted"
          @click="onGetStarted"
          class="px-8"
        >
          {{ t('welcome.getStarted') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.gap-4 {
  gap: 16px;
}
.cursor-pointer {
  cursor: pointer;
}
.disclaimer-box ul {
  line-height: 1.45;
}
</style>