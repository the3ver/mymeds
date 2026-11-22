<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  modelValue: Boolean,
  title: String,
  message: String,
  confirmText: String,
  cancelText: String,
  confirmColor: {
    type: String,
    default: 'error'
  },
  cancelColor: {
    type: String,
    default: undefined
  },
  confirmInputLabel: String,
  confirmInputValue: String
});

const emit = defineEmits(['update:modelValue', 'confirm']);
const { t } = useI18n();

const inputValue = ref('');

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      inputValue.value = '';
    }
  }
);

const close = () => {
  emit('update:modelValue', false);
};

const confirm = () => {
  if (props.confirmInputValue && inputValue.value !== props.confirmInputValue) {
    return;
  }
  emit('confirm');
  close();
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="(val) => !val && close()"
    max-width="380px"
    :persistent="!!confirmInputValue"
  >
    <v-card class="pa-2" rounded="xl">
      <v-card-title class="text-h6 font-weight-bold text-wrap pt-4 px-5">{{ title }}</v-card-title>
      <v-card-text class="px-5 pt-2 pb-3 text-body-2">
        <p class="mb-3">{{ message }}</p>

        <v-text-field
          v-if="confirmInputValue"
          v-model="inputValue"
          :label="confirmInputLabel"
          :placeholder="confirmInputValue"
          variant="outlined"
          color="error"
          autofocus
          hide-details
        ></v-text-field>
      </v-card-text>
      <v-card-actions class="px-5 pb-4 pt-1">
        <v-spacer></v-spacer>
        <v-btn :color="cancelColor" variant="text" rounded="pill" @click="close">
          {{ cancelText || t('dialog.cancel') }}
        </v-btn>
        <v-btn
          :color="confirmColor"
          variant="flat"
          rounded="pill"
          class="px-5"
          @click="confirm"
          :disabled="confirmInputValue && inputValue !== confirmInputValue"
        >
          {{ confirmText || t('dialog.confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
