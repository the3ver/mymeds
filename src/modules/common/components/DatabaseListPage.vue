<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as dataService from '../utils/dataService';
import { unlock } from '../../../app-state';
import CreateDatabaseDialog from './CreateDatabaseDialog.vue';
import DatabaseUnlockDialog from './DatabaseUnlockDialog.vue';
import ConfirmDialog from './ConfirmDialog.vue';

const { t } = useI18n();
const databases = ref([]);
const createDialog = ref(false);
const unlockDialog = ref(false);
const confirmDeleteDialog = ref(false);
const selectedDb = ref(null);

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

function handleDeleteClick(db) {
  selectedDb.value = db;
  confirmDeleteDialog.value = true;
}

async function confirmDelete() {
  if (selectedDb.value) {
    await dataService.deleteDatabase(selectedDb.value.id);
    loadDatabases();
  }
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
  <v-container>
    <v-list lines="two">
      <v-list-subheader>{{ t('app.databases') }}</v-list-subheader>
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
        <template v-slot:append>
          <v-btn
            icon="mdi-delete-outline"
            variant="text"
            color="grey"
            @click.stop="handleDeleteClick(db)"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>

    <div v-if="databases.length === 0" class="text-center text-grey mt-8">
      <p>{{ t('app.noDatabases') }}</p>
      <p>{{ t('app.createFirstDb') }}</p>
    </div>
  </v-container>

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
    @unlocked="onDatabaseUnlocked"
  />

  <ConfirmDialog
    v-model="confirmDeleteDialog"
    :title="t('app.deleteDatabaseTitle')"
    :message="t('app.deleteDatabaseConfirm', { name: selectedDb?.name })"
    :confirm-text="t('dialog.delete')"
    @confirm="confirmDelete"
  />
</template>
