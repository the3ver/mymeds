<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const sectionKeys = [
  'security',
  'basics',
  'adding',
  'dose',
  'display',
  'tracking',
  'warnings',
  'calendar',
  'exportImport'
]

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" fullscreen transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar color="primary">
        <v-btn icon="mdi-close" @click="close"></v-btn>
        <v-toolbar-title>{{ t('help.title') }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-container>
          <p class="text-body-1 mb-6">{{ t('help.intro') }}</p>

          <v-expansion-panels variant="accordion">
            <v-expansion-panel v-for="key in sectionKeys" :key="key">
              <v-expansion-panel-title class="font-weight-bold">
                {{ t(`help.sections.${key}.title`) }}
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 help-content">
                {{ t(`help.sections.${key}.content`) }}
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.help-content {
  white-space: pre-line;
  line-height: 1.6;
}
</style>