<script setup>
import { state as appState } from './app-state';
import DatabaseListPage from './modules/common/components/DatabaseListPage.vue';
import MainPage from './MainPage.vue';
</script>

<template>
  <v-app>
    <!-- Temporary Debug View -->
    <div v-if="appState.pendingIntent" style="position: fixed; top: 0; left: 0; right: 0; background: #ffcc00; color: black; padding: 4px; text-align: center; z-index: 9999; font-family: monospace; font-size: 12px;">
      DEBUG: Pending Intent = {{ appState.pendingIntent }}
    </div>

    <DatabaseListPage v-if="appState.isLocked" />
    <MainPage v-else />
  </v-app>
</template>

<style scoped>
</style>
