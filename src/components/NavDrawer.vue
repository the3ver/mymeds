<script setup>
import { ref, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const theme = useTheme()
const { t, locale } = useI18n()
const aboutDialog = ref(false)
const displayMode = ref('pills') // 'pills', 'days', 'packages'
const sortMode = ref('added') // 'added', 'name', 'days'
const uiScale = ref('normal') // 'small', 'normal', 'large'

onMounted(() => {
  const savedMode = localStorage.getItem('myMedsDisplayMode')
  if (savedMode) {
    displayMode.value = savedMode
  }
  
  const savedSort = localStorage.getItem('myMedsSortMode')
  if (savedSort) {
    sortMode.value = savedSort
  }

  const savedScale = localStorage.getItem('myMedsUiScale')
  if (savedScale) {
    uiScale.value = savedScale
    applyScale(savedScale)
  }
})

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  localStorage.setItem('myMedsTheme', theme.global.name.value)
}

const toggleLanguage = () => {
  const newLang = locale.value === 'en' ? 'de' : 'en'
  locale.value = newLang
  localStorage.setItem('myMedsLocale', newLang)
}

const cycleDisplayMode = () => {
  if (displayMode.value === 'pills') displayMode.value = 'days'
  else if (displayMode.value === 'days') displayMode.value = 'packages'
  else displayMode.value = 'pills'
  
  localStorage.setItem('myMedsDisplayMode', displayMode.value)
  window.dispatchEvent(new Event('storage-display-mode-changed'))
}

const cycleSortMode = () => {
  if (sortMode.value === 'added') sortMode.value = 'name'
  else if (sortMode.value === 'name') sortMode.value = 'days'
  else sortMode.value = 'added'
  
  localStorage.setItem('myMedsSortMode', sortMode.value)
  window.dispatchEvent(new Event('storage-sort-mode-changed'))
}

const cycleUiScale = () => {
  if (uiScale.value === 'small') uiScale.value = 'normal'
  else if (uiScale.value === 'normal') uiScale.value = 'large'
  else uiScale.value = 'small'
  
  localStorage.setItem('myMedsUiScale', uiScale.value)
  applyScale(uiScale.value)
}

const applyScale = (scale) => {
  const root = document.documentElement
  if (scale === 'small') root.style.fontSize = '14px'
  else if (scale === 'large') root.style.fontSize = '18px'
  else root.style.fontSize = '16px' // normal
}

const getSortModeLabel = () => {
  if (sortMode.value === 'added') return t('app.sortAdded')
  if (sortMode.value === 'name') return t('app.sortName')
  return t('app.sortDays')
}

const getUiScaleLabel = () => {
  if (uiScale.value === 'small') return t('app.scaleSmall')
  if (uiScale.value === 'large') return t('app.scaleLarge')
  return t('app.scaleNormal')
}

const getDisplayModeLabel = () => {
  if (displayMode.value === 'pills') return t('app.showPills')
  if (displayMode.value === 'days') return t('app.showDays')
  return t('app.showPackages')
}

const getDisplayModeIcon = () => {
  if (displayMode.value === 'pills') return 'mdi-pill'
  if (displayMode.value === 'days') return 'mdi-calendar-clock'
  return 'mdi-package-variant-closed'
}
</script>

<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="val => emit('update:modelValue', val)"
    temporary
  >
    <v-list>
      <v-list-item :title="t('app.settings')" :subtitle="t('app.preferences')"></v-list-item>
      <v-divider></v-divider>
      
      <v-list-item @click="toggleTheme">
        <template v-slot:prepend>
          <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </template>
        <v-list-item-title>
          {{ theme.global.current.value.dark ? t('app.lightMode') : t('app.darkMode') }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item @click="toggleLanguage">
        <template v-slot:prepend>
          <v-icon>mdi-translate</v-icon>
        </template>
        <v-list-item-title>
          {{ locale === 'en' ? 'Deutsch' : 'English' }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item @click="cycleDisplayMode">
        <template v-slot:prepend>
          <v-icon>{{ getDisplayModeIcon() }}</v-icon>
        </template>
        <v-list-item-title>
          {{ getDisplayModeLabel() }}
        </v-list-item-title>
        <v-list-item-subtitle>{{ t('app.displayMode') }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item @click="cycleSortMode">
        <template v-slot:prepend>
          <v-icon>mdi-sort</v-icon>
        </template>
        <v-list-item-title>
          {{ getSortModeLabel() }}
        </v-list-item-title>
        <v-list-item-subtitle>{{ t('app.sortMode') }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item @click="cycleUiScale">
        <template v-slot:prepend>
          <v-icon>mdi-format-size</v-icon>
        </template>
        <v-list-item-title>
          {{ getUiScaleLabel() }}
        </v-list-item-title>
        <v-list-item-subtitle>{{ t('app.uiScale') }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item @click="aboutDialog = true">
        <template v-slot:prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        <v-list-item-title>{{ t('app.about') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- About Dialog -->
  <v-dialog v-model="aboutDialog" max-width="500px">
    <v-card>
      <v-card-title>{{ t('about.title') }}</v-card-title>
      <v-card-text>
        <p class="mb-4">{{ t('about.description') }}</p>
        
        <v-list density="compact">
          <v-list-item
            prepend-icon="mdi-github"
            :title="t('about.github')"
            href="https://github.com/the3ver/mymeds"
            target="_blank"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-license"
            :title="t('about.license')"
            href="https://github.com/the3ver/mymeds/blob/main/LICENSE"
            target="_blank"
          ></v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="aboutDialog = false">{{ t('about.close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>