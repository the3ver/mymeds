<script setup>
import { ref } from 'vue';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { state as appState, lock } from './app-state';
import * as dataService from './modules/common/utils/dataService';
import NavDrawer from './modules/common/components/NavDrawer.vue';
import DatabaseListPage from './modules/common/components/DatabaseListPage.vue';
import MainPage from './MainPage.vue';

const theme = useTheme();
const { t } = useI18n();
const drawer = ref(false);
const dataDialog = ref(false);
const mainPageRef = ref(null);
const activeTab = ref('meds');

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
    <NavDrawer v-model="drawer" @open-data="dataDialog = true" />

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
      <DatabaseListPage v-if="appState.isLocked" />
      <MainPage
        v-else
        ref="mainPageRef"
        :key="appState.decryptedData.version"
        :data-dialog-open="dataDialog"
        @update:data-dialog-open="dataDialog = $event"
        @update:active-tab="activeTab = $event"
      />
    </v-main>
  </v-app>
</template>
