<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean,
  stats: Object
})

const emit = defineEmits(['update:modelValue', 'confirm'])
const { t } = useI18n()

const confirmInput = ref('')

watch(() => props.modelValue, (val) => {
  if (val) {
    confirmInput.value = ''
  }
})

const confirm = () => {
  if (confirmInput.value === t('app.importConfirmValue')) {
    emit('confirm')
    close()
  }
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" max-width="500px" persistent>
    <v-card>
      <v-card-title class="text-h5 text-error">
        <v-icon color="error" start>mdi-alert</v-icon>
        {{ t('app.importTitle') }}
      </v-card-title>
      <v-card-text>
        <p class="mb-4 font-weight-bold">{{ t('app.importMessage') }}</p>

        <v-card variant="tonal" color="info" class="mb-4" v-if="stats">
          <v-card-text style="white-space: pre-line">
            {{ t('app.importStats', stats) }}
          </v-card-text>
        </v-card>

        <v-text-field
          v-model="confirmInput"
          :label="t('app.importConfirmLabel')"
          :placeholder="t('app.importConfirmValue')"
          variant="outlined"
          color="error"
          autofocus
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="close">{{ t('dialog.cancel') }}</v-btn>
        <v-btn
          color="error"
          variant="elevated"
          @click="confirm"
          :disabled="confirmInput !== t('app.importConfirmValue')"
        >
          {{ t('dialog.confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>