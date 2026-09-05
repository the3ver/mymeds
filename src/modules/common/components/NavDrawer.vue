<script setup>
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { state as appState } from '../../../app-state'
import * as dataService from '../utils/dataService'
import { checkForAppUpdates, applyUpdateAndReload } from '../utils/updateService'
import packageJson from '../../../../package.json'
import HelpDialog from './HelpDialog.vue'
import SettingsDialog from './SettingsDialog.vue'
import SyncDialog from './SyncDialog.vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'open-data', 'vault-imported', 'open-whats-new'])

const theme = useTheme()
const { t } = useI18n()
const aboutDialog = ref(false)
const helpDialog = ref(false)
const settingsDialog = ref(false)
const syncDialog = ref(false)
const databases = ref([])
const appVersion = packageJson.version

const isCheckingUpdates = ref(false)
const updateSnackbar = ref(false)
const updateSnackbarText = ref('')
const updateSnackbarColor = ref('info')
const updateReady = ref(false)
const updateRegistration = ref(null)

async function handleCheckUpdates() {
  if (isCheckingUpdates.value) return
  isCheckingUpdates.value = true
  updateReady.value = false

  const [res] = await Promise.all([
    checkForAppUpdates(),
    new Promise(resolve => setTimeout(resolve, 500))
  ])

  isCheckingUpdates.value = false

  if (res.status === 'update_ready') {
    updateReady.value = true
    updateRegistration.value = res.registration
    updateSnackbarColor.value = 'primary'
    updateSnackbarText.value = t('updates.updateReady')
    updateSnackbar.value = true
  } else if (res.status === 'update_found') {
    updateSnackbarColor.value = 'info'
    updateSnackbarText.value = t('updates.updateFound')
    updateSnackbar.value = true
  } else if (res.status === 'offline') {
    updateSnackbarColor.value = 'warning'
    updateSnackbarText.value = t('updates.offline')
    updateSnackbar.value = true
  } else if (res.status === 'error') {
    updateSnackbarColor.value = 'error'
    updateSnackbarText.value = t('updates.error')
    updateSnackbar.value = true
  } else {
    // up_to_date or no_registration
    updateSnackbarColor.value = 'success'
    updateSnackbarText.value = t('updates.upToDate', { version: appVersion })
    updateSnackbar.value = true
  }
}

function handleApplyUpdate() {
  applyUpdateAndReload(updateRegistration.value)
}

async function loadDatabasesForSync() {
  try {
    databases.value = await dataService.getDatabaseList();
  } catch (e) {
    databases.value = [];
  }
}

function handleOpenSync() {
  loadDatabasesForSync();
  syncDialog.value = true;
}

const toggleTheme = () => {
  const newTheme = theme.global.current.value.dark ? 'light' : 'dark'
  theme.global.name.value = newTheme
  dataService.saveTheme(newTheme)
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

      <v-list-item @click="handleOpenSync">
        <template v-slot:prepend>
          <v-icon>mdi-sync</v-icon>
        </template>
        <v-list-item-title>{{ t('sync.title') }}</v-list-item-title>
      </v-list-item>

      <v-list-item v-if="!appState.isLocked" @click="emit('open-data')">
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

      <v-list-item @click="emit('open-whats-new'); emit('update:modelValue', false)" data-testid="nav-whats-new-btn">
        <template v-slot:prepend>
          <v-icon color="primary">mdi-sparkles</v-icon>
        </template>
        <v-list-item-title>{{ t('whatsNew.title') }}</v-list-item-title>
      </v-list-item>

      <v-list-item @click="handleCheckUpdates" :disabled="isCheckingUpdates" data-testid="nav-check-updates-btn">
        <template v-slot:prepend>
          <v-progress-circular
            v-if="isCheckingUpdates"
            indeterminate
            size="20"
            width="2"
            color="primary"
            class="mr-3"
          ></v-progress-circular>
          <v-icon v-else>mdi-update</v-icon>
        </template>
        <v-list-item-title>
          {{ isCheckingUpdates ? t('updates.checking') : t('updates.check') }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- Settings Dialog -->
  <SettingsDialog v-model="settingsDialog" />

  <!-- Sync Dialog -->
  <SyncDialog
    v-model="syncDialog"
    :databases="databases"
    @vault-imported="emit('vault-imported', $event)"
  />

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

        <div class="d-flex flex-column mt-4">
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-sparkles"
            @click="emit('open-whats-new'); aboutDialog = false; emit('update:modelValue', false)"
            class="mb-2 text-none"
            data-testid="about-whats-new-btn"
          >
            {{ t('whatsNew.title') }}
          </v-btn>
          <v-btn
            variant="outlined"
            prepend-icon="mdi-update"
            :loading="isCheckingUpdates"
            @click="handleCheckUpdates"
            class="text-none"
            data-testid="about-check-updates-btn"
          >
            {{ t('updates.check') }}
          </v-btn>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="aboutDialog = false">{{ t('about.close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Update Feedback Snackbar -->
  <v-snackbar
    v-model="updateSnackbar"
    :color="updateSnackbarColor"
    :timeout="updateReady ? -1 : 4000"
    location="bottom center"
  >
    {{ updateSnackbarText }}
    <template v-slot:actions>
      <v-btn
        v-if="updateReady"
        variant="elevated"
        color="white"
        class="text-primary font-weight-bold"
        @click="handleApplyUpdate"
        data-testid="snackbar-reload-btn"
      >
        {{ t('updates.reloadNow') }}
      </v-btn>
      <v-btn
        variant="text"
        @click="updateSnackbar = false"
      >
        {{ t('about.close') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
</style>
