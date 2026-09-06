<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as dataService from '../utils/dataService';
import * as biometricService from '../utils/biometricSessionService';
import { unlock } from '../../../app-state';
import CreateDatabaseDialog from './CreateDatabaseDialog.vue';
import DatabaseUnlockDialog from './DatabaseUnlockDialog.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import RenameDatabaseDialog from './RenameDatabaseDialog.vue';
import SyncDialog from './SyncDialog.vue';

const { t, locale } = useI18n();
const databases = ref([]);
const activeBiometricVaults = ref(new Set());
const createDialog = ref(false);
const unlockDialog = ref(false);
const confirmDeleteDialog = ref(false);
const renameDialog = ref(false);
const syncDialog = ref(false);
const syncDbId = ref(null);
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
  await loadBiometrics();
});

async function loadDatabases() {
  databases.value = await dataService.getDatabaseList();
}

async function loadBiometrics() {
  activeBiometricVaults.value = await biometricService.getActiveBiometricVaultIds();
}

async function handleRevokeBiometrics(db) {
  await biometricService.revokeBiometrics(db.id);
  await loadBiometrics();
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

function handleSyncClick(db) {
  syncDbId.value = db.id;
  syncDialog.value = true;
}

function onSyncDialogClosed(val) {
  if (!val) {
    syncDbId.value = null;
  }
}

function onVaultImported() {
  loadDatabases();
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
          class="d-flex flex-column fill-height db-card"
          :color="getRandomColor(db.id)"
          variant="tonal"
        >
          <v-card-title class="text-h5 font-weight-bold cursor-pointer d-flex align-center justify-space-between pb-1" @click="handleDbClick(db)">
            <span class="text-truncate mr-2">{{ db.name }}</span>
            <v-chip
              v-if="activeBiometricVaults.has(db.id)"
              size="small"
              color="primary"
              variant="flat"
              prepend-icon="mdi-fingerprint"
              class="flex-shrink-0 font-weight-medium"
              :title="t('biometrics.activeOnThisDevice')"
            >
              {{ t('biometrics.title') }}
            </v-chip>
          </v-card-title>

          <v-card-text class="flex-grow-1 cursor-pointer pt-2 pb-2 db-card-text" @click="handleDbClick(db)">
            <!-- Prominent horizontal stats row for medication & calendar counts -->
            <div class="db-stats-row d-flex flex-wrap align-center ga-3 mb-3">
              <div class="db-stat-pill flex-grow-1 d-flex align-center px-3 py-2 rounded-lg">
                <v-icon size="28" color="primary" class="mr-3 flex-shrink-0">mdi-pill</v-icon>
                <div class="d-flex flex-column">
                  <span class="text-h6 font-weight-bold line-height-1">{{ db.medsCount }}</span>
                  <span class="text-body-2 font-weight-medium opacity-90 text-truncate">{{ t('app.db.meds') }}</span>
                </div>
              </div>

              <div class="db-stat-pill flex-grow-1 d-flex align-center px-3 py-2 rounded-lg">
                <v-icon size="28" color="secondary" class="mr-3 flex-shrink-0">mdi-calendar-check</v-icon>
                <div class="d-flex flex-column">
                  <span class="text-h6 font-weight-bold line-height-1">{{ db.calendarCount }}</span>
                  <span class="text-body-2 font-weight-medium opacity-90 text-truncate">{{ t('app.db.entries') }}</span>
                </div>
              </div>
            </div>

            <!-- Horizontal dates row utilizing the available horizontal space -->
            <div class="db-dates-row d-flex flex-wrap justify-space-between align-center ga-2 pt-2 border-t text-body-1">
              <div class="d-flex align-center py-1">
                <v-icon size="22" class="mr-2 opacity-80 flex-shrink-0">mdi-calendar-plus</v-icon>
                <span class="db-date-label">
                  <span class="opacity-80 mr-1">{{ t('app.db.created') }}:</span>
                  <strong class="font-weight-bold">{{ formatDate(db.createdAt) }}</strong>
                </span>
              </div>
              <div class="d-flex align-center py-1">
                <v-icon size="22" class="mr-2 opacity-80 flex-shrink-0">mdi-calendar-edit</v-icon>
                <span class="db-date-label">
                  <span class="opacity-80 mr-1">{{ t('app.db.modified') }}:</span>
                  <strong class="font-weight-bold">{{ formatDate(db.modifiedAt) }}</strong>
                </span>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="px-3 pb-2 pt-0">
            <v-btn
              icon="mdi-swap-vertical"
              variant="text"
              size="default"
              :title="t('sync.transferToDevice')"
              @click.stop="handleSyncClick(db)"
            ></v-btn>
            <v-btn
              v-if="activeBiometricVaults.has(db.id)"
              icon="mdi-fingerprint-off"
              variant="text"
              size="default"
              color="warning"
              :title="t('biometrics.disabled')"
              @click.stop="handleRevokeBiometrics(db)"
            ></v-btn>
            <v-spacer></v-spacer>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="default"
              @click.stop="handleRenameClick(db)"
            ></v-btn>
            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              size="default"
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
    @biometric-updated="loadBiometrics"
  />

  <RenameDatabaseDialog
    v-model="renameDialog"
    :current-name="selectedDb?.name"
    @save="handleSaveName"
  />

  <SyncDialog
    v-model="syncDialog"
    :initial-vault-id="syncDbId"
    :databases="databases"
    @vault-imported="onVaultImported"
    @update:model-value="onSyncDialogClosed"
  />

  <ConfirmDialog
    v-model="confirmDeleteDialog"
    :title="t('app.deleteDatabaseTitle')"
    :message="t('app.deleteDatabaseConfirm', { name: selectedDb?.name })"
    :confirm-text="t('app.deleteConfirmValue')"
    :confirm-input-value="t('app.deleteConfirmValue')"
    :confirm-input-label="t('app.deleteConfirmLabel')"
    @confirm="confirmDelete"
  />
</template>

<style>
/* Global style to prevent pull-to-refresh on this page */
html, body {
  overscroll-behavior-y: contain;
}
.cursor-pointer {
  cursor: pointer;
}

.db-card-text {
  font-size: 1.05rem;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), 1) !important;
  opacity: 1 !important;
}

.db-stat-pill {
  background: rgba(var(--v-theme-surface), 0.78);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(var(--v-border-color), 0.2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-width: 125px;
}

.line-height-1 {
  line-height: 1.15;
}

.db-date-label {
  font-size: 1rem;
}

.border-t {
  border-top: 1px solid rgba(var(--v-border-color), 0.2);
}
</style>
