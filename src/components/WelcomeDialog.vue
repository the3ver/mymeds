<script setup>
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const theme = useTheme()
const { t, locale } = useI18n()

const setTheme = (mode) => {
  theme.global.name.value = mode
  localStorage.setItem('myMedsTheme', mode)
}

const setLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('myMedsLocale', lang)
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="400px" persistent>
    <v-card>
      <v-card-title class="text-h5 text-center pt-4">{{ t('welcome.title') }}</v-card-title>
      <v-card-text class="text-center">
        <p class="mb-4">{{ t('welcome.thankYou') }}</p>
        <p class="mb-6 text-body-2 text-grey-darken-1">{{ t('welcome.explanation') }}</p>
        
        <p class="mb-2 font-weight-bold">{{ t('welcome.chooseLanguage') }}</p>
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

        <p class="mb-2 font-weight-bold">{{ t('welcome.chooseTheme') }}</p>
        <div class="d-flex justify-center gap-4 mb-2">
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
      </v-card-text>
      <v-card-actions class="justify-center pb-4">
        <v-btn 
          color="primary" 
          variant="elevated" 
          size="large"
          @click="close"
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
</style>