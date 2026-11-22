<script setup>
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import * as dataService from '../utils/dataService';
import * as biometricService from '../utils/biometricSessionService';
import { unlock } from '../../../app-state';

const CreateDatabaseDialog = defineAsyncComponent(() => import('./CreateDatabaseDialog.vue'));
const DatabaseUnlockDialog = defineAsyncComponent(() => import('./DatabaseUnlockDialog.vue'));
const ConfirmDialog = defineAsyncComponent(() => import('./ConfirmDialog.vue'));
const RenameDatabaseDialog = defineAsyncComponent(() => import('./RenameDatabaseDialog.vue'));
const SyncDialog = defineAsyncComponent(() => import('./SyncDialog.vue'));

const { t, locale } = useI18n();
const databases = ref([]);
const activeBiometricVaults = ref(new Set());
const vaultDisplayMode = ref('simple');
const createDialog = ref(false);
const unlockDialog = ref(false);
const confirmDeleteDialog = ref(false);
const renameDialog = ref(false);
const syncDialog = ref(false);
const syncDbId = ref(null);
const selectedDb = ref(null);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

onMounted(async () => {
  await loadDatabases();
  await loadBiometrics();
  await loadVaultDisplayMode();
  window.addEventListener('storage-vault-display-mode-changed', loadVaultDisplayMode);
});

onUnmounted(() => {
  window.removeEventListener('storage-vault-display-mode-changed', loadVaultDisplayMode);
});

async function loadVaultDisplayMode() {
  const settings = await dataService.getSettings();
  vaultDisplayMode.value = settings.vaultDisplayMode || 'simple';
}

async function toggleVaultDisplayMode() {
  const nextMode = vaultDisplayMode.value === 'simple' ? 'comfortable' : 'simple';
  vaultDisplayMode.value = nextMode;
  await dataService.saveVaultDisplayMode(nextMode);
  window.dispatchEvent(new Event('storage-vault-display-mode-changed'));
}

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

async function onDatabaseCreated(createdPayload) {
  await loadDatabases();
  createDialog.value = false;

  // Auto-unlock newly created vault so the user does not have to re-enter the password
  if (createdPayload?.id && createdPayload?.password) {
    try {
      const result = await dataService.unlockDatabase(createdPayload.id, createdPayload.password);
      if (result.success) {
        unlock(createdPayload.id, createdPayload.password, result.data, result.deductions, createdPayload.name);
      }
    } catch (err) {
      console.warn('[DatabaseListPage] Auto-unlock after creation skipped:', err);
    }
  }
}

function onDatabaseUnlocked(result, password) {
  unlock(selectedDb.value.id, password, result.data, result.deductions, selectedDb.value.name);
  unlockDialog.value = false;
}
</script>

<template>
  <v-container class="db-list-container pb-24">
    <div v-if="databases.length > 0" class="d-flex align-center justify-space-between mb-3 px-1">
      <div class="text-overline font-weight-bold text-medium-emphasis">
        {{ t('app.databases') }} ({{ databases.length }})
      </div>
      <v-btn
        :prepend-icon="vaultDisplayMode === 'simple' ? 'mdi-view-agenda-outline' : 'mdi-view-compact-outline'"
        variant="tonal"
        color="secondary"
        rounded="pill"
        size="small"
        :title="t('app.toggleVaultDisplayMode')"
        :aria-label="t('app.toggleVaultDisplayMode')"
        @click="toggleVaultDisplayMode"
        data-testid="toggle-vault-display-btn"
      >
        {{ vaultDisplayMode === 'simple' ? t('app.vaultDisplayComfortable') : t('app.vaultDisplaySimple') }}
      </v-btn>
    </div>

    <v-row dense>
      <v-col v-for="db in databases" :key="db.id" cols="12" sm="6">
        <!-- Simple / Ruhige Ansicht -->
        <v-card
          v-if="vaultDisplayMode === 'simple'"
          class="m3-card db-card db-card-simple cursor-pointer mb-2"
          @click="handleDbClick(db)"
        >
          <div class="d-flex align-center justify-space-between pa-4 ga-3">
            <div class="d-flex align-center ga-3 min-width-0 flex-grow-1">
              <v-avatar color="primary" variant="tonal" size="44" rounded="lg" class="flex-shrink-0">
                <v-icon size="24">mdi-shield-lock-outline</v-icon>
              </v-avatar>
              <div class="min-width-0 flex-grow-1">
                <div class="text-subtitle-1 font-weight-bold text-truncate">{{ db.name }}</div>
                <div class="d-flex align-center flex-wrap text-body-2 text-medium-emphasis ga-2 mt-0.5">
                  <span>{{ db.medsCount }} {{ t('app.db.medsLabel', db.medsCount) }}</span>
                  <span aria-hidden="true">·</span>
                  <span>{{ db.calendarCount }} {{ t('app.db.entriesLabel', db.calendarCount) }}</span>
                </div>
              </div>
            </div>

            <div class="d-flex align-center flex-shrink-0">
              <v-icon
                v-if="activeBiometricVaults.has(db.id)"
                size="22"
                color="primary"
                class="mr-1"
                :title="t('biometrics.activeOnThisDevice')"
              >
                mdi-fingerprint
              </v-icon>
              <v-menu location="bottom end">
                <template v-slot:activator="{ props: menuProps }">
                  <v-btn
                    v-bind="menuProps"
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="default"
                    @click.stop
                    :title="t('app.vaultActions')"
                    :aria-label="t('app.vaultActions')"
                  ></v-btn>
                </template>
                <v-list density="comfortable" rounded="xl" min-width="200">
                  <v-list-item
                    prepend-icon="mdi-pencil"
                    :title="t('app.vaultRename')"
                    @click.stop="handleRenameClick(db)"
                  ></v-list-item>
                  <v-list-item
                    prepend-icon="mdi-cellphone-link"
                    :title="t('sync.transferToDevice')"
                    @click.stop="handleSyncClick(db)"
                  ></v-list-item>
                  <v-list-item
                    v-if="activeBiometricVaults.has(db.id)"
                    prepend-icon="mdi-fingerprint-off"
                    :title="t('biometrics.disabled')"
                    color="warning"
                    @click.stop="handleRevokeBiometrics(db)"
                  ></v-list-item>
                  <v-divider class="my-1"></v-divider>
                  <v-list-item
                    prepend-icon="mdi-delete-outline"
                    :title="t('app.vaultDelete')"
                    base-color="error"
                    @click.stop="handleDeleteClick(db)"
                  ></v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>
        </v-card>

        <!-- Comfortable / Detaillierte Ansicht -->
        <v-card v-else class="m3-card db-card d-flex flex-column fill-height mb-2" @click="handleDbClick(db)">
          <v-card-title class="d-flex align-center justify-space-between pt-4 pb-2 px-4">
            <div class="d-flex align-center ga-3 min-width-0">
              <v-avatar color="primary" variant="tonal" size="42" rounded="lg" class="flex-shrink-0">
                <v-icon size="22">mdi-shield-lock-outline</v-icon>
              </v-avatar>
              <span class="text-h6 font-weight-bold text-truncate">{{ db.name }}</span>
            </div>
            <v-chip
              v-if="activeBiometricVaults.has(db.id)"
              size="small"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-fingerprint"
              class="flex-shrink-0 font-weight-medium ml-2"
              :title="t('biometrics.activeOnThisDevice')"
            >
              {{ t('biometrics.title') }}
            </v-chip>
          </v-card-title>

          <v-card-text class="flex-grow-1 pt-1 pb-2 px-4">
            <div class="db-stats-row d-flex flex-wrap align-center ga-3 mb-3">
              <div class="db-stat-pill flex-grow-1 d-flex align-center px-3 py-2 rounded-xl">
                <v-icon size="24" color="primary" class="mr-3 flex-shrink-0">mdi-pill</v-icon>
                <div class="d-flex flex-column">
                  <span class="text-h6 font-weight-bold line-height-1">{{ db.medsCount }}</span>
                  <span class="text-caption font-weight-medium text-medium-emphasis">
                    {{ t('app.db.medsLabel', db.medsCount) }}
                  </span>
                </div>
              </div>

              <div class="db-stat-pill flex-grow-1 d-flex align-center px-3 py-2 rounded-xl">
                <v-icon size="24" color="secondary" class="mr-3 flex-shrink-0">mdi-calendar-check</v-icon>
                <div class="d-flex flex-column">
                  <span class="text-h6 font-weight-bold line-height-1">{{ db.calendarCount }}</span>
                  <span class="text-caption font-weight-medium text-medium-emphasis">
                    {{ t('app.db.entriesLabel', db.calendarCount) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="d-flex flex-wrap justify-space-between align-center ga-2 pt-2 border-t text-caption">
              <div class="d-flex align-center text-medium-emphasis">
                <v-icon size="16" class="mr-1">mdi-calendar-plus</v-icon>
                <span class="mr-1">{{ t('app.db.created') }}:</span>
                <strong class="text-high-emphasis">{{ formatDate(db.createdAt) }}</strong>
              </div>
              <div class="d-flex align-center text-medium-emphasis">
                <v-icon size="16" class="mr-1">mdi-calendar-edit</v-icon>
                <span class="mr-1">{{ t('app.db.modified') }}:</span>
                <strong class="text-high-emphasis">{{ formatDate(db.modifiedAt) }}</strong>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="px-3 pb-3 pt-0">
            <v-btn
              icon="mdi-cellphone-link"
              variant="text"
              size="default"
              :title="t('sync.transferToDevice')"
              :aria-label="t('sync.transferToDevice')"
              @click.stop="handleSyncClick(db)"
            ></v-btn>
            <v-btn
              v-if="activeBiometricVaults.has(db.id)"
              icon="mdi-fingerprint-off"
              variant="text"
              size="default"
              color="warning"
              :title="t('biometrics.disabled')"
              :aria-label="t('biometrics.disabled')"
              @click.stop="handleRevokeBiometrics(db)"
            ></v-btn>
            <v-spacer></v-spacer>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="default"
              :aria-label="t('app.vaultRename')"
              @click.stop="handleRenameClick(db)"
            ></v-btn>
            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              size="default"
              color="error"
              :aria-label="t('app.vaultDelete')"
              @click.stop="handleDeleteClick(db)"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-if="databases.length > 0" variant="tonal" color="secondary" rounded="xl" class="mt-4 pa-3">
      <div class="d-flex align-start ga-3 text-caption">
        <v-icon color="primary" size="20" class="flex-shrink-0 mt-0.5">mdi-lock-check-outline</v-icon>
        <span>{{ t('app.zeroKnowledgeHint') }}</span>
      </div>
    </v-card>

    <div v-if="databases.length === 0" class="text-center text-medium-emphasis mt-16 px-4">
      <v-avatar color="primary" variant="tonal" size="64" rounded="xl" class="mb-4">
        <v-icon size="34">mdi-shield-lock-outline</v-icon>
      </v-avatar>
      <p class="text-h6 font-weight-bold text-high-emphasis mb-1">{{ t('app.noDatabases') }}</p>
      <p class="text-body-2">{{ t('app.createFirstDb') }}</p>
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
  >
    <v-icon icon="mdi-plus" />
    <span class="d-sr-only">{{ t('dialog.createDbTitle') }}</span>
  </v-fab>

  <CreateDatabaseDialog v-model="createDialog" @created="onDatabaseCreated" />

  <DatabaseUnlockDialog
    v-model="unlockDialog"
    :database="selectedDb"
    @unlocked="onDatabaseUnlocked"
    @biometric-updated="loadBiometrics"
  />

  <RenameDatabaseDialog v-model="renameDialog" :current-name="selectedDb?.name" @save="handleSaveName" />

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

<style scoped>
.db-list-container {
  max-width: 720px;
}
.cursor-pointer {
  cursor: pointer;
}
.db-stat-pill {
  background-color: rgb(var(--v-theme-surface-light));
  min-width: 120px;
}
.line-height-1 {
  line-height: 1.15;
}
.border-t {
  border-top: 1px solid rgba(var(--v-border-color), 0.35);
}
.min-width-0 {
  min-width: 0;
}
</style>
