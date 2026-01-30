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
const displayMode = ref('pills') // 'pills' or 'days'
const sortMode = ref('added') // 'added', 'name', 'days'

onMounted(() => {
  const savedMode = localStorage.getItem('myMedsDisplayMode')
  if (savedMode) {
    displayMode.value = savedMode
  }
  
  const savedSort = localStorage.getItem('myMedsSortMode')
  if (savedSort) {
    sortMode.value = savedSort
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

const toggleDisplayMode = () => {
  displayMode.value = displayMode.value === 'pills' ? 'days' : 'pills'
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

const getSortModeLabel = () => {
  if (sortMode.value === 'added') return t('app.sortAdded')
  if (sortMode.value === 'name') return t('app.sortName')
  return t('app.sortDays')
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

      <v-list-item @click="toggleDisplayMode">
        <template v-slot:prepend>
          <v-icon>{{ displayMode === 'pills' ? 'mdi-pill' : 'mdi-calendar-clock' }}</v-icon>
        </template>
        <v-list-item-title>
          {{ displayMode === 'pills' ? t('app.showDays') : t('app.showPills') }}
        </v-list-item-title>
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