<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as dataService from '../utils/dataService';
import { unlock } from '../../../app-state';
import CreateDatabaseDialog from './CreateDatabaseDialog.vue';
import DatabaseUnlockDialog from './DatabaseUnlockDialog.vue';

const { t } = useI18n();
const databases = ref([]);
const createDialog = ref(false);
const unlockDialog = ref(false);
const selectedDb = ref(null);
const passwordForUnlock = ref('');

onMounted(async () => {
  await loadDatabases();
});

async function loadDatabases() {
  databases.value = await dataService.getDatabaseList();
}

function handleDbClick(db) {
  selectedDb.value = db;
  unlockDialog.value = true;
}

function handleCreateNew() {
  createDialog.value = true;
}

function onDatabaseCreated() {
  loadDatabases();
  createDialog.value = false;
}

function onDatabaseUnlocked(data, password) {
  unlock(selectedDb.value.id, password, data);
  unlockDialog.value = false;
}
</script>

<template>
  <v-app-bar color="primary" density="compact">
    <v-app-bar-title>{{ t('app.title') }} - Databases</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-container>
      <v-list lines="two">
        <v-list-subheader>Your Databases</v-list-subheader>
        <v-list-item
          v-for="db in databases"
          :key="db.id"
          :title="db.name"
          :subtitle="`Last modified: ${new Date(db.modifiedAt).toLocaleString()}`"
          @click="handleDbClick(db)"
        >
          <template v-slot:prepend>
            <v-avatar :color="db.encryptionStrategy === 'password' ? 'primary' : 'secondary'">
              <v-icon>{{ db.encryptionStrategy === 'password' ? 'mdi-lock' : 'mdi-fingerprint' }}</v-icon>
            </v-avatar>
          </template>
        </v-list-item>
      </v-list>

      <div v-if="databases.length === 0" class="text-center text-grey mt-8">
        <p>No databases found.</p>
        <p>Create your first encrypted database to get started.</p>
      </div>
    </v-container>
  </v-main>

  <v-fab
    icon="mdi-plus"
    location="bottom end"
    size="large"
    color="primary"
    app
    appear
    class="mb-4"
    @click="handleCreateNew"
  ></v-fab>

  <CreateDatabaseDialog
    v-model="createDialog"
    @created="onDatabaseCreated"
  />

  <DatabaseUnlockDialog
    v-model="unlockDialog"
    :database="selectedDb"
    @unlocked="(data, password) => onDatabaseUnlocked(data, password)"
  />
</template>
