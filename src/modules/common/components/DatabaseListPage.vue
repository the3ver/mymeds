<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as dataService from '../utils/dataService';
import { unlock } from '../../../app-state';
import CreateDatabaseDialog from './CreateDatabaseDialog.vue';
import DatabaseUnlockDialog from './DatabaseUnlockDialog.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import RenameDatabaseDialog from './RenameDatabaseDialog.vue';

const { t, locale } = useI18n();
const databases = ref([]);
const createDialog = ref(false);
const unlockDialog = ref(false);
const confirmDeleteDialog = ref(false);
const renameDialog = ref(false);
const selectedDb = ref(null);

const colors = ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'];
const getRandomColor = (id) => {
  let hash = 0;
  const strId = String(id);
  for (let i = 0; i < strId.length; i++) {
    hash = strId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(locale.value, {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
};

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

function handleRenameClick(db) {
  selectedDb.value = db;
  renameDialog.value = true;
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

async function handleSaveName(newName) {
  if (selectedDb.value) {
    await dataService.renameDatabase(selectedDb.value.id, newName);
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

function onDatabaseUnlocked(result, password) {
  unlock(selectedDb.value.id, password, result.data, result.deductions);
  unlockDialog.value = false;
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col
        v-for="db in databases"
        :key="db.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          class="d-flex flex-column fill-height"
          :color="getRandomColor(db.id)"
          variant="tonal"
        >
          <v-card-title class="text-h5 font-weight-bold" @click="handleDbClick(db)">
            {{ db.name }}
          </v-card-title>

          <v-card-text class="flex-grow-1" @click="handleDbClick(db)">
            <div class="d-flex align-center mb-2">
              <v-icon start>mdi-calendar-plus</v-icon>
              <span>{{ t('app.db.created') }}: {{ formatDate(db.createdAt) }}</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon start>mdi-calendar-edit</v-icon>
              <span>{{ t('app.db.modified') }}: {{ formatDate(db.modifiedAt) }}</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon start>mdi-pill</v-icon>
              <span>{{ db.medsCount }} {{ t('app.db.meds') }}</span>
            </div>
            <div class="d-flex align-center">
              <v-icon start>mdi-calendar-check</v-icon>
              <span>{{ db.calendarCount }} {{ t('app.db.entries') }}</span>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              @click.stop="handleRenameClick(db)"
            ></v-btn>
            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              @click.stop="handleDeleteClick(db)"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="databases.length === 0" class="text-center text-grey mt-16">
      <p class="text-h6">{{ t('app.noDatabases') }}</p>
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

  <RenameDatabaseDialog
    v-model="renameDialog"
    :current-name="selectedDb?.name"
    @save="handleSaveName"
  />

  <ConfirmDialog
    v-model="confirmDeleteDialog"
    :title="t('app.deleteDatabaseTitle')"
    :message="t('app.deleteDatabaseConfirm', { name: selectedDb?.name })"
    :confirm-text="t('dialog.delete')"
    :confirm-input-value="t('dialog.delete')"
    :confirm-input-label="t('dialog.deleteConfirmLabel')"
    @confirm="confirmDelete"
  />
</template>

<style>
/* Global style to prevent pull-to-refresh on this page */
html, body {
  overscroll-behavior-y: contain;
}
</style>
