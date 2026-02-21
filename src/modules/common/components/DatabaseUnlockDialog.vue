<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as dataService from '../utils/dataService';

const props = defineProps({
  modelValue: Boolean,
  database: Object,
});
const emit = defineEmits(['update:modelValue', 'unlocked']);

const { t } = useI18n();
const password = ref('');
const loading = ref(false);
const error = ref(null);

const close = () => {
  password.value = '';
  error.value = null;
  emit('update:modelValue', false);
}

async function unlock() {
  if (!password.value) {
    error.value = "Password is required.";
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const result = await dataService.unlockDatabase(props.database.id, password.value);
    if (result.success) {
      emit('unlocked', result.data, password.value);
      close();
    } else {
      error.value = "Incorrect password.";
    }
  } catch (e) {
    console.error("Failed to unlock database:", e);
    error.value = "Failed to unlock database.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" max-width="500px" persistent>
    <v-card :loading="loading">
      <v-card-title>Unlock '{{ database?.name }}'</v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" density="compact" class="mb-4">{{ error }}</v-alert>
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          variant="outlined"
          autofocus
          @keyup.enter="unlock"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close" :disabled="loading">Cancel</v-btn>
        <v-btn color="primary" @click="unlock" :loading="loading">Unlock</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
