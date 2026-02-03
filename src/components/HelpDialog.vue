<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

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
            <v-expansion-panel>
              <v-expansion-panel-title class="font-weight-bold">{{ t('help.sections.basics.title') }}</v-expansion-panel-title>
              <v-expansion-panel-text>{{ t('help.sections.basics.content') }}</v-expansion-panel-text>
            </v-expansion-panel>
            
            <v-expansion-panel>
              <v-expansion-panel-title class="font-weight-bold">{{ t('help.sections.adding.title') }}</v-expansion-panel-title>
              <v-expansion-panel-text>{{ t('help.sections.adding.content') }}</v-expansion-panel-text>
            </v-expansion-panel>
            
            <v-expansion-panel>
              <v-expansion-panel-title class="font-weight-bold">{{ t('help.sections.dose.title') }}</v-expansion-panel-title>
              <v-expansion-panel-text>{{ t('help.sections.dose.content') }}</v-expansion-panel-text>
            </v-expansion-panel>
            
            <v-expansion-panel>
              <v-expansion-panel-title class="font-weight-bold">{{ t('help.sections.tracking.title') }}</v-expansion-panel-title>
              <v-expansion-panel-text>{{ t('help.sections.tracking.content') }}</v-expansion-panel-text>
            </v-expansion-panel>
            
            <v-expansion-panel>
              <v-expansion-panel-title class="font-weight-bold">{{ t('help.sections.warnings.title') }}</v-expansion-panel-title>
              <v-expansion-panel-text>{{ t('help.sections.warnings.content') }}</v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-title class="font-weight-bold">{{ t('help.sections.calendar.title') }}</v-expansion-panel-title>
              <v-expansion-panel-text>{{ t('help.sections.calendar.content') }}</v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>