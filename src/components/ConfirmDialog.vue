<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  message: String,
  confirmText: String,
  cancelText: String
})

const emit = defineEmits(['update:modelValue', 'confirm'])
const { t } = useI18n()

const close = () => {
  emit('update:modelValue', false)
}

const confirm = () => {
  emit('confirm')
  close()
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="400px" persistent>
    <v-card>
      <v-card-title class="text-h5">{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="close">{{ cancelText || t('dialog.cancel') }}</v-btn>
        <v-btn color="error" variant="text" @click="confirm">{{ confirmText || t('dialog.confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>