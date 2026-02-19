<script setup>
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'
import packageJson from '../../../../package.json'
import HelpDialog from './HelpDialog.vue'
import SettingsDialog from './SettingsDialog.vue'
import DataDialog from './DataDialog.vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const theme = useTheme()
const { t } = useI18n()
const aboutDialog = ref(false)
const helpDialog = ref(false)
const settingsDialog = ref(false)
const dataDialog = ref(false)
const appVersion = packageJson.version

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  localStorage.setItem('myMedsTheme', theme.global.name.value)
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

      <v-list-item @click="settingsDialog = true">
        <template v-slot:prepend>
          <v-icon>mdi-cog</v-icon>
        </template>
        <v-list-item-title>{{ t('app.settings') }}</v-list-item-title>
      </v-list-item>

      <v-list-item @click="dataDialog = true">
        <template v-slot:prepend>
          <v-icon>mdi-database</v-icon>
        </template>
        <v-list-item-title>{{ t('app.dataManagement') }}</v-list-item-title>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item @click="helpDialog = true">
        <template v-slot:prepend>
          <v-icon>mdi-help-circle-outline</v-icon>
        </template>
        <v-list-item-title>{{ t('app.help') }}</v-list-item-title>
      </v-list-item>

      <v-list-item @click="aboutDialog = true">
        <template v-slot:prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        <v-list-item-title>{{ t('app.about') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- Settings Dialog -->
  <SettingsDialog v-model="settingsDialog" />

  <!-- Data Dialog -->
  <DataDialog v-model="dataDialog" />

  <!-- Help Dialog -->
  <HelpDialog v-model="helpDialog" />

  <!-- About Dialog -->
  <v-dialog v-model="aboutDialog" max-width="500px">
    <v-card>
      <v-card-title>{{ t('about.title') }}</v-card-title>
      <v-card-text>
        <p class="mb-4">{{ t('about.description') }}</p>
        <p class="mb-4 text-body-2 text-grey-darken-1">{{ t('about.explanation') }}</p>

        <v-list density="compact">
          <v-list-item
            prepend-icon="mdi-tag-text-outline"
            :title="t('about.version')"
            :subtitle="appVersion"
          >
            <template v-slot:append>
              <v-btn
                variant="text"
                density="compact"
                icon="mdi-open-in-new"
                href="https://github.com/the3ver/mymeds/releases"
                target="_blank"
                :title="t('about.changelog')"
              ></v-btn>
            </template>
          </v-list-item>
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