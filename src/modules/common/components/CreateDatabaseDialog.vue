<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as dataService from '../utils/dataService';

defineProps({
  modelValue: Boolean
});
const emit = defineEmits(['update:modelValue', 'created']);

const { t } = useI18n();
const dbName = ref('');
const password = ref('');
const passwordConfirm = ref('');
const loading = ref(false);
const error = ref(null);
// Keep typed input from being lost by an outside tap
const isDirty = computed(() => loading.value || !!(dbName.value || password.value || passwordConfirm.value));

const close = () => emit('update:modelValue', false);

async function createDatabase() {
  if (password.value !== passwordConfirm.value) {
    error.value = 'Passwords do not match.';
    return;
  }
  if (!dbName.value || !password.value) {
    error.value = 'Name and password are required.';
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const newId = await dataService.createDatabaseWithPassword(dbName.value, password.value);
    const createdName = dbName.value;
    const createdPassword = password.value;
    dbName.value = '';
    password.value = '';
    passwordConfirm.value = '';
    emit('created', { id: newId, name: createdName, password: createdPassword });
  } catch (e) {
    console.error('Failed to create database:', e);
    error.value = 'Could not create database.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="(val) => !val && close()"
    class="m3-sheet-dialog"
    transition="dialog-bottom-transition"
    :persistent="isDirty"
  >
    <v-card :loading="loading" class="pa-2">
      <div class="m3-sheet-handle"></div>
      <v-card-title class="text-h6 font-weight-bold px-5 pt-2">{{ t('dialog.createDbTitle') }}</v-card-title>
      <v-card-text class="px-5">
        <v-alert v-if="error" type="error" variant="tonal" density="compact" rounded="lg" class="mb-4">
          {{ error }}
        </v-alert>

        <v-alert type="warning" variant="tonal" rounded="lg" class="mb-4 text-body-2" icon="mdi-key-alert">
          {{ t('dialog.createDbWarning') }}
        </v-alert>

        <v-text-field v-model="dbName" :label="t('dialog.dbNameLabel')" variant="outlined" autofocus></v-text-field>
        <v-text-field
          v-model="password"
          :label="t('dialog.passwordLabel')"
          type="password"
          variant="outlined"
          class="mt-2"
        ></v-text-field>
        <v-text-field
          v-model="passwordConfirm"
          :label="t('dialog.passwordConfirmLabel')"
          type="password"
          variant="outlined"
          class="mt-2"
        ></v-text-field>
      </v-card-text>
      <v-card-actions class="px-5 pb-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" rounded="pill" @click="close" :disabled="loading">{{ t('dialog.cancel') }}</v-btn>
        <v-btn color="primary" variant="flat" rounded="pill" class="px-6" @click="createDatabase" :loading="loading">
          {{ t('dialog.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
