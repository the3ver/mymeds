<script setup>
import { ref, defineAsyncComponent } from 'vue';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { state as appState } from '../../../app-state';
import * as dataService from '../utils/dataService';
import { checkForAppUpdates, applyUpdateAndReload } from '../utils/updateService';
import packageJson from '../../../../package.json';
import AboutDialog from './AboutDialog.vue';

const HelpDialog = defineAsyncComponent(() => import('./HelpDialog.vue'));
const SettingsDialog = defineAsyncComponent(() => import('./SettingsDialog.vue'));
const SyncDialog = defineAsyncComponent(() => import('./SyncDialog.vue'));

defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'open-data', 'vault-imported', 'open-whats-new']);

const theme = useTheme();
const { t } = useI18n();
const aboutDialog = ref(false);
const helpDialog = ref(false);
const settingsDialog = ref(false);
const syncDialog = ref(false);
const databases = ref([]);
const appVersion = packageJson.version;

const isCheckingUpdates = ref(false);
const updateSnackbar = ref(false);
const updateSnackbarText = ref('');
const updateSnackbarColor = ref('info');
const updateReady = ref(false);
const updateRegistration = ref(null);

async function handleCheckUpdates() {
  if (isCheckingUpdates.value) return;
  isCheckingUpdates.value = true;
  updateReady.value = false;

  const [res] = await Promise.all([checkForAppUpdates(), new Promise((resolve) => setTimeout(resolve, 500))]);

  isCheckingUpdates.value = false;

  if (res.status === 'update_ready') {
    updateReady.value = true;
    updateRegistration.value = res.registration;
    updateSnackbarColor.value = 'primary';
    updateSnackbarText.value = t('updates.updateReady');
    updateSnackbar.value = true;
  } else if (res.status === 'update_found') {
    updateSnackbarColor.value = 'info';
    updateSnackbarText.value = t('updates.updateFound');
    updateSnackbar.value = true;
  } else if (res.status === 'offline') {
    updateSnackbarColor.value = 'warning';
    updateSnackbarText.value = t('updates.offline');
    updateSnackbar.value = true;
  } else if (res.status === 'error') {
    updateSnackbarColor.value = 'error';
    updateSnackbarText.value = t('updates.error');
    updateSnackbar.value = true;
  } else {
    // up_to_date or no_registration
    updateSnackbarColor.value = 'success';
    updateSnackbarText.value = t('updates.upToDate', { version: appVersion });
    updateSnackbar.value = true;
  }
}

function handleApplyUpdate() {
  applyUpdateAndReload(updateRegistration.value);
}

async function loadDatabasesForSync() {
  try {
    databases.value = await dataService.getDatabaseList();
  } catch (e) {
    databases.value = [];
  }
}

function closeDrawer() {
  emit('update:modelValue', false);
}

function handleOpenSettings() {
  settingsDialog.value = true;
  closeDrawer();
}

function handleOpenSync() {
  loadDatabasesForSync();
  syncDialog.value = true;
  closeDrawer();
}

function handleOpenData() {
  emit('open-data');
  closeDrawer();
}

function handleOpenHelp() {
  helpDialog.value = true;
  closeDrawer();
}

function handleOpenAbout() {
  aboutDialog.value = true;
  closeDrawer();
}

function handleOpenWhatsNew() {
  emit('open-whats-new');
  closeDrawer();
}

const toggleTheme = () => {
  const newTheme = theme.global.current.value.dark ? 'light' : 'dark';
  theme.global.name.value = newTheme;
  dataService.saveTheme(newTheme);
};
</script>

<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    temporary
    :width="288"
    class="nav-drawer"
  >
    <v-list>
      <v-list-item :title="t('app.title')" :subtitle="t('app.preferences')"></v-list-item>
      <v-divider></v-divider>

      <v-list-item @click="toggleTheme">
        <template v-slot:prepend>
          <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </template>
        <v-list-item-title class="drawer-item-title">
          {{ theme.global.current.value.dark ? t('app.lightMode') : t('app.darkMode') }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item @click="handleOpenSettings" data-testid="nav-settings-btn">
        <template v-slot:prepend>
          <v-icon>mdi-cog</v-icon>
        </template>
        <v-list-item-title class="drawer-item-title">{{ t('app.settings') }}</v-list-item-title>
      </v-list-item>

      <v-list-item @click="handleOpenSync" data-testid="nav-sync-btn">
        <template v-slot:prepend>
          <v-icon>mdi-sync</v-icon>
        </template>
        <v-list-item-title class="drawer-item-title">{{ t('sync.title') }}</v-list-item-title>
      </v-list-item>

      <v-list-item v-if="!appState.isLocked" @click="handleOpenData" data-testid="nav-data-btn">
        <template v-slot:prepend>
          <v-icon>mdi-database</v-icon>
        </template>
        <v-list-item-title class="drawer-item-title">{{ t('app.dataManagement') }}</v-list-item-title>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item @click="handleOpenHelp" data-testid="nav-help-btn">
        <template v-slot:prepend>
          <v-icon>mdi-help-circle-outline</v-icon>
        </template>
        <v-list-item-title class="drawer-item-title">{{ t('app.help') }}</v-list-item-title>
      </v-list-item>

      <v-list-item @click="handleOpenAbout" data-testid="nav-about-btn">
        <template v-slot:prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        <v-list-item-title class="drawer-item-title">{{ t('app.about') }}</v-list-item-title>
      </v-list-item>

      <v-list-item @click="handleOpenWhatsNew" data-testid="nav-whats-new-btn">
        <template v-slot:prepend>
          <v-icon color="primary">mdi-sparkles</v-icon>
        </template>
        <v-list-item-title class="drawer-item-title">{{ t('whatsNew.title') }}</v-list-item-title>
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
        <v-list-item-title class="drawer-item-title">
          {{ isCheckingUpdates ? t('updates.checking') : t('updates.check') }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- Settings Dialog -->
  <SettingsDialog v-model="settingsDialog" />

  <!-- Sync Dialog -->
  <SyncDialog v-model="syncDialog" :databases="databases" @vault-imported="emit('vault-imported', $event)" />

  <!-- Help Dialog -->
  <HelpDialog v-model="helpDialog" />

  <!-- About Dialog -->
  <AboutDialog
    v-model="aboutDialog"
    :is-checking-updates="isCheckingUpdates"
    @open-whats-new="
      emit('open-whats-new');
      emit('update:modelValue', false);
    "
    @check-updates="handleCheckUpdates"
  />

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
      <v-btn variant="text" @click="updateSnackbar = false">
        {{ t('about.close') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
.drawer-item-title {
  white-space: normal;
  line-height: 1.3;
}
</style>
