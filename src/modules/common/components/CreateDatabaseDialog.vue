<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as dataService from '../utils/dataService';

const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(['update:modelValue', 'created']);

const { t } = useI18n();
const dbName = ref('');
const password = ref('');
const passwordConfirm = ref('');
const loading = ref(false);
const error = ref(null);

const close = () => emit('update:modelValue', false);

async function createDatabase() {
  if (password.value !== passwordConfirm.value) {
    error.value = "Passwords do not match.";
    return;
  }
  if (!dbName.value || !password.value) {
    error.value = "Name and password are required.";
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    await dataService.createDatabaseWithPassword(dbName.value, password.value);
    emit('created');
  } catch (e) {
    console.error("Failed to create database:", e);
    error.value = "Could not create database.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" max-width="500px" persistent>
    <v-card :loading="loading">
      <v-card-title>{{ t('dialog.createDbTitle') }}</v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" density="compact" class="mb-4">{{ error }}</v-alert>

        <v-alert
          type="warning"
          variant="tonal"
          class="mb-4"
          icon="mdi-key-alert"
        >
          {{ t('dialog.createDbWarning') }}
        </v-alert>

        <v-text-field
          v-model="dbName"
          :label="t('dialog.dbNameLabel')"
          variant="outlined"
          autofocus
        ></v-text-field>
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
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close" :disabled="loading">{{ t('dialog.cancel') }}</v-btn>
        <v-btn color="primary" @click="createDatabase" :loading="loading">{{ t('dialog.create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
