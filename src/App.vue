<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { state as appState, lock } from './app-state';
import * as dataService from './modules/common/utils/dataService';
import { onServiceWorkerUpdate, applyUpdateAndReload } from './modules/common/utils/updateService';
import { autoRequestPersistence } from './modules/common/utils/storagePersistenceService';
import { getLatestChangelog } from './modules/common/utils/changelog';
import * as reminderService from './modules/common/utils/reminderService';
import { snackbarState, triggerSnackbarAction, dismissSnackbar } from './modules/common/utils/snackbarService';
import DatabaseListPage from './modules/common/components/DatabaseListPage.vue';
import WelcomeDialog from './modules/common/components/WelcomeDialog.vue';
import WhatsNewDialog from './modules/common/components/WhatsNewDialog.vue';
import MainPage from './MainPage.vue';

const SettingsDialog = defineAsyncComponent(() => import('./modules/common/components/SettingsDialog.vue'));
const SyncDialog = defineAsyncComponent(() => import('./modules/common/components/SyncDialog.vue'));
const HelpDialog = defineAsyncComponent(() => import('./modules/common/components/HelpDialog.vue'));

const theme = useTheme();
const { t } = useI18n();
const dataDialog = ref(false);
const welcomeDialog = ref(false);
const whatsNewDialog = ref(false);
const settingsDialog = ref(false);
const syncDialog = ref(false);
const helpDialog = ref(false);
const databasesForSync = ref([]);
const updateAvailableSnackbar = ref(false);
const pendingRegistration = ref(null);
const isExistingUser = ref(false);
const mainPageRef = ref(null);
const activeTab = ref('meds');
const dbListKey = ref(0);

const appBarTitle = computed(() => {
  if (appState.isLocked) return t('app.title');
  if (activeTab.value === 'calendar') return t('calendar.titlePage');
  if (activeTab.value === 'more') return t('app.nav.more');
  return appState.activeDatabaseName || t('app.title');
});

const appBarSubtitle = computed(() => {
  if (appState.isLocked) return t('app.vaultsSubtitle');
  if (activeTab.value !== 'meds' && appState.activeDatabaseName) {
    return appState.activeDatabaseName;
  }
  return '';
});

function handleVaultImported() {
  dbListKey.value++;
}

async function openLockedSync() {
  try {
    databasesForSync.value = await dataService.getDatabaseList();
  } catch {
    databasesForSync.value = [];
  }
  syncDialog.value = true;
}

function toggleTheme() {
  const newTheme = theme.global.current.value.dark ? 'light' : 'dark';
  theme.global.name.value = newTheme;
  dataService.saveTheme(newTheme);
}

function isNewerVersion(current, previous) {
  if (!previous) return true;
  const c = String(current || '')
    .replace(/^v/, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  const p = String(previous || '')
    .replace(/^v/, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(c.length, p.length); i++) {
    const cNum = c[i] || 0;
    const pNum = p[i] || 0;
    if (cNum > pNum) return true;
    if (cNum < pNum) return false;
  }
  return false;
}

onMounted(async () => {
  const latestChangelogVersion = getLatestChangelog().version;
  const [settings, dbs] = await Promise.all([dataService.getSettings(), dataService.getDatabaseList()]);
  isExistingUser.value = Array.isArray(dbs) && dbs.length > 0;

  if (!settings?.disclaimerAccepted) {
    welcomeDialog.value = true;
    if (!settings?.lastSeenChangelogVersion) {
      dataService.saveLastSeenChangelogVersion(latestChangelogVersion);
    }
  } else {
    const lastSeen = settings?.lastSeenChangelogVersion;
    if (!lastSeen || isNewerVersion(latestChangelogVersion, lastSeen)) {
      whatsNewDialog.value = true;
    }
  }

  onServiceWorkerUpdate((reg) => {
    pendingRegistration.value = reg;
    updateAvailableSnackbar.value = true;
  });

  if (reminderService.isReminderSupported()) {
    dataService
      .getReminderSettings()
      .then(async (reminders) => {
        if (reminders?.enabled) {
          await reminderService.registerPeriodicSync();
          const { hasChanges, updatedLastNotified } = reminderService.evaluateDueReminders(reminders);
          if (hasChanges) {
            await dataService.saveReminderSettings({
              ...reminders,
              lastNotified: updatedLastNotified
            });
            await reminderService.sendTestNotification(
              t('reminders.notificationTitle'),
              t('reminders.notificationBody')
            );
          }
        }
      })
      .catch((err) => console.warn('[App] Reminders init error:', err));
  }

  autoRequestPersistence().catch((err) => console.warn('[App] Storage persistence error:', err));
});

function reloadApp() {
  applyUpdateAndReload(pendingRegistration.value);
}

async function handleLock() {
  if (!appState.isLocked) {
    await dataService.saveAndLockDatabase(
      appState.activeDatabaseId,
      appState.activeDatabasePassword,
      appState.decryptedData
    );
    activeTab.value = 'meds';
    lock();
  }
}
</script>

<template>
  <v-app>
    <v-app-bar color="background" elevation="0" class="m3-top-bar px-1">
      <div class="d-flex flex-column justify-center pl-3 min-width-0 flex-grow-1">
        <div class="text-h6 font-weight-bold text-truncate line-height-tight" data-testid="app-bar-title">
          {{ appBarTitle }}
        </div>
        <div v-if="appBarSubtitle" class="text-caption text-medium-emphasis text-truncate line-height-tight">
          {{ appBarSubtitle }}
        </div>
      </div>

      <template v-slot:append>
        <!-- Locked Vaults Top Bar Actions -->
        <template v-if="appState.isLocked">
          <v-btn
            icon="mdi-cellphone-link"
            variant="text"
            :aria-label="t('sync.title')"
            :title="t('sync.title')"
            @click="openLockedSync"
            data-testid="locked-sync-btn"
          ></v-btn>
          <v-btn
            :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
            variant="text"
            :aria-label="theme.global.current.value.dark ? t('app.lightMode') : t('app.darkMode')"
            :title="theme.global.current.value.dark ? t('app.lightMode') : t('app.darkMode')"
            @click="toggleTheme"
            data-testid="locked-theme-btn"
          ></v-btn>
          <v-btn
            icon="mdi-book-open-page-variant-outline"
            variant="text"
            :aria-label="t('app.help')"
            :title="t('app.help')"
            @click="helpDialog = true"
            data-testid="locked-help-btn"
          ></v-btn>
          <v-btn
            icon="mdi-cog-outline"
            variant="text"
            :aria-label="t('app.settings')"
            :title="t('app.settings')"
            @click="settingsDialog = true"
            data-testid="locked-settings-btn"
          ></v-btn>
        </template>

        <!-- Unlocked Vault Lock Action -->
        <v-btn
          v-else
          variant="tonal"
          color="secondary"
          rounded="pill"
          prepend-icon="mdi-lock"
          size="small"
          class="mr-2 font-weight-medium"
          :aria-label="t('a11y.lockVault')"
          @click="handleLock"
          data-testid="lock-vault-btn"
        >
          {{ t('app.lock') }}
        </v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <DatabaseListPage v-if="appState.isLocked" :key="dbListKey" />
      <MainPage
        v-else
        ref="mainPageRef"
        :key="appState.decryptedData.version"
        :data-dialog-open="dataDialog"
        @update:data-dialog-open="dataDialog = $event"
        @update:active-tab="activeTab = $event"
        @open-whats-new="whatsNewDialog = true"
        @vault-imported="handleVaultImported"
      />
    </v-main>

    <WelcomeDialog v-model="welcomeDialog" :is-existing-user="isExistingUser" />
    <WhatsNewDialog v-model="whatsNewDialog" />
    <SettingsDialog v-if="settingsDialog" v-model="settingsDialog" />
    <SyncDialog
      v-if="syncDialog"
      v-model="syncDialog"
      :databases="databasesForSync"
      @vault-imported="handleVaultImported"
    />
    <HelpDialog v-if="helpDialog" v-model="helpDialog" />

    <!-- Global M3 Undo / Feedback Snackbar -->
    <v-snackbar
      v-model="snackbarState.open"
      :color="snackbarState.color"
      :timeout="snackbarState.timeout"
      location="bottom center"
      rounded="xl"
      class="mb-16"
      data-testid="global-snackbar"
    >
      {{ snackbarState.text }}
      <template v-slot:actions>
        <v-btn
          v-if="snackbarState.actionText"
          variant="text"
          :color="snackbarState.color ? 'white' : 'primary'"
          class="font-weight-bold"
          @click="triggerSnackbarAction"
          data-testid="global-snackbar-action"
        >
          {{ snackbarState.actionText }}
        </v-btn>
        <v-btn icon="mdi-close" size="small" variant="text" :aria-label="t('about.close')" @click="dismissSnackbar" />
      </template>
    </v-snackbar>

    <!-- Background Update Available Banner/Snackbar (lifted above FAB & Bottom Nav) -->
    <v-snackbar
      :model-value="updateAvailableSnackbar && !welcomeDialog"
      @update:model-value="updateAvailableSnackbar = $event"
      color="primary"
      :timeout="-1"
      location="bottom center"
      rounded="xl"
      class="mb-16"
    >
      {{ t('updates.updateReady') }}
      <template v-slot:actions>
        <v-btn
          variant="elevated"
          color="white"
          class="text-primary font-weight-bold"
          @click="reloadApp"
          data-testid="app-update-reload-btn"
        >
          {{ t('updates.reloadNow') }}
        </v-btn>
        <v-btn variant="text" @click="updateAvailableSnackbar = false">
          {{ t('about.close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<style scoped>
.m3-top-bar {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.35);
}
.min-width-0 {
  min-width: 0;
}
.line-height-tight {
  line-height: 1.2;
}
</style>
