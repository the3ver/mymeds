<script setup>
import { ref, onMounted } from 'vue';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { state as appState, lock } from './app-state';
import * as dataService from './modules/common/utils/dataService';
import { onServiceWorkerUpdate, applyUpdateAndReload } from './modules/common/utils/updateService';
import packageJson from '../package.json';
import * as reminderService from './modules/common/utils/reminderService';
import NavDrawer from './modules/common/components/NavDrawer.vue';
import DatabaseListPage from './modules/common/components/DatabaseListPage.vue';
import WelcomeDialog from './modules/common/components/WelcomeDialog.vue';
import WhatsNewDialog from './modules/common/components/WhatsNewDialog.vue';
import MainPage from './MainPage.vue';

const theme = useTheme();
const { t } = useI18n();
const drawer = ref(false);
const dataDialog = ref(false);
const welcomeDialog = ref(false);
const whatsNewDialog = ref(false);
const updateAvailableSnackbar = ref(false);
const pendingRegistration = ref(null);
const isExistingUser = ref(false);
const mainPageRef = ref(null);
const activeTab = ref('meds');
const dbListKey = ref(0);

function handleVaultImported() {
  dbListKey.value++;
}

function isNewerVersion(current, previous) {
  if (!previous) return true;
  const c = String(current || '').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const p = String(previous || '').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(c.length, p.length); i++) {
    const cNum = c[i] || 0;
    const pNum = p[i] || 0;
    if (cNum > pNum) return true;
    if (cNum < pNum) return false;
  }
  return false;
}

onMounted(async () => {
  const [settings, dbs] = await Promise.all([
    dataService.getSettings(),
    dataService.getDatabaseList()
  ]);
  isExistingUser.value = Array.isArray(dbs) && dbs.length > 0;

  if (!settings?.disclaimerAccepted) {
    welcomeDialog.value = true;
    if (!settings?.lastSeenChangelogVersion) {
      dataService.saveLastSeenChangelogVersion(packageJson.version);
    }
  } else {
    const lastSeen = settings?.lastSeenChangelogVersion;
    if (!lastSeen || isNewerVersion(packageJson.version, lastSeen)) {
      whatsNewDialog.value = true;
    }
  }

  onServiceWorkerUpdate(reg => {
    pendingRegistration.value = reg;
    updateAvailableSnackbar.value = true;
  });

  // Reminders check & periodic sync registration
  if (reminderService.isReminderSupported()) {
    dataService.getReminderSettings().then(async (reminders) => {
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
    }).catch(err => console.warn('[App] Reminders init error:', err));
  }
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
    lock();
  }
}

function openCalendarFilter() {
  if (mainPageRef.value) {
    mainPageRef.value.openCalendarFilter();
  }
}
</script>

<template>
  <v-app>
    <NavDrawer
      v-model="drawer"
      @open-data="dataDialog = true"
      @open-whats-new="whatsNewDialog = true"
      @vault-imported="handleVaultImported"
    />

    <v-app-bar :color="theme.global.current.value.dark ? 'surface' : 'primary'" density="compact">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" data-testid="nav-drawer-toggle"></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title>{{ t('app.title') }}</v-app-bar-title>
      <template v-slot:append>
        <v-btn
          v-if="!appState.isLocked && activeTab === 'calendar'"
          icon="mdi-filter-variant"
          @click="openCalendarFilter"
          data-testid="calendar-filter-btn"
        ></v-btn>
        <v-btn v-if="!appState.isLocked" icon="mdi-lock" @click="handleLock"></v-btn>
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
      />
    </v-main>

    <WelcomeDialog v-model="welcomeDialog" :is-existing-user="isExistingUser" />
    <WhatsNewDialog v-model="whatsNewDialog" />

    <!-- Background Update Available Banner/Snackbar -->
    <v-snackbar
      v-model="updateAvailableSnackbar"
      color="primary"
      :timeout="-1"
      location="bottom center"
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
        <v-btn
          variant="text"
          @click="updateAvailableSnackbar = false"
        >
          {{ t('about.close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

