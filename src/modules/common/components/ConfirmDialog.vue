<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  message: String,
  confirmText: String,
  cancelText: String,
  confirmInputLabel: String,
  confirmInputValue: String
})

const emit = defineEmits(['update:modelValue', 'confirm'])
const { t } = useI18n()

const inputValue = ref('')

watch(() => props.modelValue, (val) => {
  if (val) {
    inputValue.value = ''
  }
})

const close = () => {
  emit('update:modelValue', false)
}

const confirm = () => {
  if (props.confirmInputValue && inputValue.value !== props.confirmInputValue) {
    return
  }
  emit('confirm')
  close()
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="400px" persistent>
    <v-card>
      <v-card-title class="text-h5">{{ title }}</v-card-title>
      <v-card-text>
        <p class="mb-4">{{ message }}</p>

        <v-text-field
          v-if="confirmInputValue"
          v-model="inputValue"
          :label="confirmInputLabel"
          :placeholder="confirmInputValue"
          variant="outlined"
          color="error"
          autofocus
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="close">{{ cancelText || t('dialog.cancel') }}</v-btn>
        <v-btn
          color="error"
          variant="text"
          @click="confirm"
          :disabled="confirmInputValue && inputValue !== confirmInputValue"
        >
          {{ confirmText || t('dialog.confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>