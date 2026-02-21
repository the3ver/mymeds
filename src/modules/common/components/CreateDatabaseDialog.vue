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
      <v-card-title>Create New Database</v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" density="compact" class="mb-4">{{ error }}</v-alert>
        <v-text-field
          v-model="dbName"
          label="Database Name"
          variant="outlined"
          autofocus
        ></v-text-field>
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          variant="outlined"
          class="mt-2"
        ></v-text-field>
        <v-text-field
          v-model="passwordConfirm"
          label="Confirm Password"
          type="password"
          variant="outlined"
          class="mt-2"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close" :disabled="loading">Cancel</v-btn>
        <v-btn color="primary" @click="createDatabase" :loading="loading">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
