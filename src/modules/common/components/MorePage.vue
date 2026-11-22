<script setup>
import { ref, defineAsyncComponent } from 'vue';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import * as dataService from '../utils/dataService';
import { checkForAppUpdates, applyUpdateAndReload } from '../utils/updateService';
import { showSnackbar } from '../utils/snackbarService';
import AboutDialog from './AboutDialog.vue';
import packageJson from '../../../../package.json';

const SettingsDialog = defineAsyncComponent(() => import('./SettingsDialog.vue'));
const SyncDialog = defineAsyncComponent(() => import('./SyncDialog.vue'));
const HelpDialog = defineAsyncComponent(() => import('./HelpDialog.vue'));

const emit = defineEmits(['open-data', 'open-whats-new', 'open-bmp-scan', 'open-bmp-export', 'vault-imported']);

const theme = useTheme();
const { t } = useI18n();

const settingsDialog = ref(false);
const syncDialog = ref(false);
const helpDialog = ref(false);
const aboutDialog = ref(false);
const databases = ref([]);
const isCheckingUpdates = ref(false);
const appVersion = packageJson.version;

async function loadDatabasesForSync() {
  try {
    databases.value = await dataService.getDatabaseList();
  } catch {
    databases.value = [];
  }
}

function toggleTheme(isDark) {
  const newTheme = isDark ? 'dark' : 'light';
  theme.global.name.value = newTheme;
  dataService.saveTheme(newTheme);
}

async function openSync() {
  await loadDatabasesForSync();
  syncDialog.value = true;
}

async function handleCheckUpdates() {
  if (isCheckingUpdates.value) return;
  isCheckingUpdates.value = true;

  const [res] = await Promise.all([checkForAppUpdates(), new Promise((resolve) => setTimeout(resolve, 400))]);
  isCheckingUpdates.value = false;

  if (res.status === 'update_ready') {
    showSnackbar({
      text: t('updates.updateReady'),
      color: 'primary',
      timeout: -1,
      actionText: t('updates.reloadNow'),
      onAction: () => applyUpdateAndReload(res.registration)
    });
  } else if (res.status === 'update_found') {
    showSnackbar({ text: t('updates.updateFound'), color: 'info' });
  } else if (res.status === 'offline') {
    showSnackbar({ text: t('updates.offline'), color: 'warning' });
  } else if (res.status === 'error') {
    showSnackbar({ text: t('updates.error'), color: 'error' });
  } else {
    showSnackbar({ text: t('updates.upToDate', { version: appVersion }), color: 'success' });
  }
}
</script>

<template>
  <v-container class="more-page pb-16 pt-2">
    <!-- Group 1: Appearance & Settings -->
    <div class="text-overline text-primary font-weight-bold px-2 mb-1">
      {{ t('app.more.sectionAppearance') }}
    </div>
    <v-card class="m3-section-card mb-5">
      <v-list bg-color="transparent" class="py-0">
        <v-list-item
          class="py-3"
          @click="toggleTheme(!theme.global.current.value.dark)"
          data-testid="more-theme-toggle"
        >
          <template v-slot:prepend>
            <v-avatar color="primary" variant="tonal" size="40" rounded="lg" class="mr-3">
              <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">{{ t('app.darkMode') }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ theme.global.current.value.dark ? t('app.more.darkModeOn') : t('app.more.darkModeOff') }}
          </v-list-item-subtitle>
          <template v-slot:append>
            <v-switch
              :model-value="theme.global.current.value.dark"
              color="primary"
              hide-details
              density="compact"
              @click.stop
              @update:model-value="toggleTheme"
            ></v-switch>
          </template>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item class="py-3" @click="settingsDialog = true" data-testid="more-settings-btn">
          <template v-slot:prepend>
            <v-avatar color="primary" variant="tonal" size="40" rounded="lg" class="mr-3">
              <v-icon>mdi-cog</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">{{ t('app.settings') }}</v-list-item-title>
          <v-list-item-subtitle>{{ t('app.more.settingsSubtitle') }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-icon color="medium-emphasis">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Group 2: Data, Backup & Sync -->
    <div class="text-overline text-primary font-weight-bold px-2 mb-1">
      {{ t('app.more.sectionData') }}
    </div>
    <v-card class="m3-section-card mb-5">
      <v-list bg-color="transparent" class="py-0">
        <v-list-item class="py-3" @click="openSync" data-testid="more-sync-btn">
          <template v-slot:prepend>
            <v-avatar color="primary" variant="tonal" size="40" rounded="lg" class="mr-3">
              <v-icon>mdi-cellphone-link</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">{{ t('sync.title') }}</v-list-item-title>
          <v-list-item-subtitle>{{ t('app.more.syncSubtitle') }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-icon color="medium-emphasis">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item class="py-3" @click="emit('open-data')" data-testid="more-data-btn">
          <template v-slot:prepend>
            <v-avatar color="primary" variant="tonal" size="40" rounded="lg" class="mr-3">
              <v-icon>mdi-database</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">{{ t('app.dataManagement') }}</v-list-item-title>
          <v-list-item-subtitle>{{ t('app.more.dataSubtitle') }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-icon color="medium-emphasis">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item class="py-3" @click="emit('open-bmp-scan')" data-testid="more-bmp-scan-btn">
          <template v-slot:prepend>
            <v-avatar color="secondary" variant="tonal" size="40" rounded="lg" class="mr-3">
              <v-icon>mdi-qrcode-scan</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">{{ t('app.scanBmp') }}</v-list-item-title>
          <v-list-item-subtitle>{{ t('app.more.bmpSubtitle') }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-icon color="medium-emphasis">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item class="py-3" @click="emit('open-bmp-export')" data-testid="more-bmp-export-btn">
          <template v-slot:prepend>
            <v-avatar color="secondary" variant="tonal" size="40" rounded="lg" class="mr-3">
              <v-icon>mdi-barcode-scan</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">{{ t('app.showBmp') }}</v-list-item-title>
          <template v-slot:append>
            <v-icon color="medium-emphasis">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Group 3: Manual, Updates & About -->
    <div class="text-overline text-primary font-weight-bold px-2 mb-1">
      {{ t('app.more.sectionApp') }}
    </div>
    <v-card class="m3-section-card mb-6">
      <v-list bg-color="transparent" class="py-0">
        <v-list-item class="py-3" @click="helpDialog = true" data-testid="more-help-btn">
          <template v-slot:prepend>
            <v-avatar color="primary" variant="tonal" size="40" rounded="lg" class="mr-3">
              <v-icon>mdi-book-open-page-variant-outline</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">{{ t('app.help') }}</v-list-item-title>
          <v-list-item-subtitle>{{ t('app.more.helpSubtitle') }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-icon color="medium-emphasis">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item class="py-3" @click="emit('open-whats-new')" data-testid="more-whats-new-btn">
          <template v-slot:prepend>
            <v-avatar color="primary" variant="tonal" size="40" rounded="lg" class="mr-3">
              <v-icon>mdi-sparkles</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">{{ t('whatsNew.title') }}</v-list-item-title>
          <v-list-item-subtitle>{{ t('app.more.whatsNewSubtitle') }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-icon color="medium-emphasis">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item
          class="py-3"
          :disabled="isCheckingUpdates"
          @click="handleCheckUpdates"
          data-testid="more-check-updates-btn"
        >
          <template v-slot:prepend>
            <v-avatar color="primary" variant="tonal" size="40" rounded="lg" class="mr-3">
              <v-progress-circular v-if="isCheckingUpdates" indeterminate size="20" width="2" color="primary" />
              <v-icon v-else>mdi-update</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">
            {{ isCheckingUpdates ? t('updates.checking') : t('updates.check') }}
          </v-list-item-title>
          <v-list-item-subtitle>v{{ appVersion }}</v-list-item-subtitle>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item class="py-3" @click="aboutDialog = true" data-testid="more-about-btn">
          <template v-slot:prepend>
            <v-avatar color="secondary" variant="tonal" size="40" rounded="lg" class="mr-3">
              <v-icon>mdi-information</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">{{ t('app.about') }}</v-list-item-title>
          <v-list-item-subtitle>{{ t('app.more.aboutSubtitle') }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-icon color="medium-emphasis">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <SettingsDialog v-if="settingsDialog" v-model="settingsDialog" />
    <SyncDialog
      v-if="syncDialog"
      v-model="syncDialog"
      :databases="databases"
      @vault-imported="emit('vault-imported', $event)"
    />
    <HelpDialog v-if="helpDialog" v-model="helpDialog" />
    <AboutDialog
      v-model="aboutDialog"
      :is-checking-updates="isCheckingUpdates"
      @open-whats-new="emit('open-whats-new')"
      @check-updates="handleCheckUpdates"
    />
  </v-container>
</template>

<style scoped>
.more-page {
  max-width: 680px;
}
.more-page :deep(.v-list-item-subtitle) {
  line-height: 1.45;
  padding-bottom: 2px;
}
</style>
