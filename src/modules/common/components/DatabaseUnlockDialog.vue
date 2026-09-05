<script setup>
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as dataService from '../utils/dataService';
import * as biometricService from '../utils/biometricSessionService';

const props = defineProps({
  modelValue: Boolean,
  database: Object,
});
const emit = defineEmits(['update:modelValue', 'unlocked', 'biometric-updated']);

const { t } = useI18n();
const password = ref('');
const loading = ref(false);
const error = ref(null);

const hasBiometric = ref(false);
const isBiometricSupported = ref(false);
const rememberBiometrics = ref(false);
const showPasswordInput = ref(false);

const close = () => {
  password.value = '';
  error.value = null;
  rememberBiometrics.value = false;
  emit('update:modelValue', false);
};

async function initDialog() {
  password.value = '';
  error.value = null;
  rememberBiometrics.value = false;

  if (props.database?.id) {
    try {
      hasBiometric.value = await biometricService.hasBiometricSession(props.database.id);
    } catch (e) {
      hasBiometric.value = false;
    }
  } else {
    hasBiometric.value = false;
  }

  showPasswordInput.value = !hasBiometric.value;

  try {
    isBiometricSupported.value = await biometricService.isPrfSupported();
  } catch (e) {
    isBiometricSupported.value = false;
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      initDialog();
    }
  }
);

watch(
  () => props.database,
  () => {
    if (props.modelValue) {
      initDialog();
    }
  }
);

onMounted(() => {
  if (props.modelValue) {
    initDialog();
  }
});

async function unlockWithBiometrics() {
  if (!props.database?.id) return;
  loading.value = true;
  error.value = null;

  try {
    const result = await biometricService.unlockWithBiometrics(props.database.id);
    if (result.success) {
      emit('unlocked', result, result.password);
      close();
    } else if (result.error === 'cancelled') {
      showPasswordInput.value = true;
      error.value = t('biometrics.cancelled');
    } else if (result.error === 'invalid_password') {
      hasBiometric.value = false;
      showPasswordInput.value = true;
      error.value = t('dialog.incorrectPassword');
      emit('biometric-updated', { vaultId: props.database.id, enabled: false });
    } else {
      showPasswordInput.value = true;
      error.value = result.details || t('biometrics.error', { message: result.error || 'unknown' });
    }
  } catch (e) {
    console.error('Biometric unlock unexpected error:', e);
    showPasswordInput.value = true;
    error.value = t('biometrics.error', { message: e.message || 'unknown' });
  } finally {
    loading.value = false;
  }
}

async function unlockWithPassword() {
  if (!password.value) {
    error.value = t('dialog.passwordRequired');
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const result = await dataService.unlockDatabase(props.database.id, password.value);
    if (result.success) {
      if (rememberBiometrics.value) {
        try {
          await biometricService.enrollBiometrics(props.database.id, password.value);
          emit('biometric-updated', { vaultId: props.database.id, enabled: true });
        } catch (enrollErr) {
          console.warn('[DatabaseUnlockDialog] Biometric enrollment error:', enrollErr);
        }
      }
      emit('unlocked', result, password.value);
      close();
    } else {
      error.value = t('dialog.incorrectPassword');
    }
  } catch (e) {
    console.error('Failed to unlock database:', e);
    error.value = t('dialog.incorrectPassword');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" max-width="480px" persistent>
    <v-card :loading="loading">
      <v-card-title class="text-h6 pt-4 px-6">
        {{ t('dialog.unlockTitle', { name: database?.name || '' }) }}
      </v-card-title>
      <v-card-text class="pt-2 px-6">
        <v-alert v-if="error" type="error" density="compact" class="mb-4" variant="tonal">
          {{ error }}
        </v-alert>

        <!-- Biometric Unlock Mode -->
        <div v-if="hasBiometric && !showPasswordInput" class="text-center py-4">
          <v-avatar color="primary" size="72" class="mb-3 elevation-1">
            <v-icon icon="mdi-fingerprint" size="44" color="white"></v-icon>
          </v-avatar>
          <div class="text-subtitle-1 font-weight-bold mb-1">
            {{ t('biometrics.title') }}
          </div>
          <div class="text-body-2 text-medium-emphasis mb-6">
            {{ t('biometrics.unlockPrompt') }}
          </div>

          <v-btn
            color="primary"
            size="large"
            block
            prepend-icon="mdi-fingerprint"
            :loading="loading"
            class="mb-3"
            @click="unlockWithBiometrics"
          >
            {{ t('biometrics.unlockWith') }}
          </v-btn>

          <v-btn
            variant="text"
            size="small"
            :disabled="loading"
            @click="showPasswordInput = true"
          >
            {{ t('biometrics.usePasswordInstead') }}
          </v-btn>
        </div>

        <!-- Password Mode -->
        <div v-else>
          <div v-if="hasBiometric" class="d-flex justify-end mb-2">
            <v-btn
              variant="text"
              density="comfortable"
              size="small"
              color="primary"
              prepend-icon="mdi-fingerprint"
              @click="showPasswordInput = false"
            >
              {{ t('biometrics.unlockWith') }}
            </v-btn>
          </div>

          <v-text-field
            v-model="password"
            :label="t('dialog.passwordLabel')"
            type="password"
            variant="outlined"
            autofocus
            @keyup.enter="unlockWithPassword"
          ></v-text-field>

          <v-checkbox
            v-if="!hasBiometric && isBiometricSupported"
            v-model="rememberBiometrics"
            :label="t('biometrics.rememberOnDevice')"
            density="compact"
            hide-details
            color="primary"
            class="mt-1"
          ></v-checkbox>
        </div>
      </v-card-text>
      <v-card-actions class="px-6 pb-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" :disabled="loading" @click="close">
          {{ t('dialog.cancel') }}
        </v-btn>
        <v-btn
          v-if="showPasswordInput || !hasBiometric"
          color="primary"
          :loading="loading"
          @click="unlockWithPassword"
        >
          {{ t('dialog.unlock') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
