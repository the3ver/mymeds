<script setup>
import { state as appState } from './app-state';
import DatabaseListPage from './modules/common/components/DatabaseListPage.vue';
import MainPage from './MainPage.vue';
</script>

<template>
  <v-app>
    <DatabaseListPage v-if="appState.isLocked" />
    <MainPage v-else />
  </v-app>
</template>

<style scoped>
</style>
