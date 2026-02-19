<script setup>
import { useI18n } from 'vue-i18n'
import packageJson from '../../../../package.json'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const appVersion = packageJson.version

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="400px" persistent>
    <v-card>
      <v-card-title class="text-h5 text-center pt-4">{{ t('update.title') }}</v-card-title>
      <v-card-text class="text-center">
        <p class="mb-4">{{ t('update.message') }}</p>

        <div class="d-flex justify-center align-center mb-4">
          <span class="font-weight-bold mr-2">{{ t('update.version') }}</span>
          <span class="text-primary">{{ appVersion }}</span>
        </div>

        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-open-in-new"
          href="https://github.com/the3ver/mymeds/releases"
          target="_blank"
          class="mb-2"
        >
          {{ t('update.changelog') }}
        </v-btn>
      </v-card-text>
      <v-card-actions class="justify-center pb-4">
        <v-btn
          color="primary"
          variant="elevated"
          @click="close"
          class="px-8"
        >
          {{ t('update.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>