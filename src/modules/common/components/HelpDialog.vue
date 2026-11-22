<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const searchQuery = ref('');

const sections = [
  { key: 'security', icon: 'mdi-shield-lock-outline' },
  { key: 'basics', icon: 'mdi-cellphone-check' },
  { key: 'adding', icon: 'mdi-pill' },
  { key: 'dose', icon: 'mdi-clock-outline' },
  { key: 'display', icon: 'mdi-view-list-outline' },
  { key: 'tracking', icon: 'mdi-check-decagram-outline' },
  { key: 'warnings', icon: 'mdi-alert-circle-outline' },
  { key: 'calendar', icon: 'mdi-calendar-clock' },
  { key: 'exportImport', icon: 'mdi-database-export-outline' }
];

const filteredSections = computed(() => {
  // Vuetify's clearable sets the model to null
  const q = (searchQuery.value ?? '').trim().toLowerCase();
  if (!q) return sections;
  return sections.filter(({ key }) => {
    const title = t(`help.sections.${key}.title`).toLowerCase();
    const content = t(`help.sections.${key}.content`).toLowerCase();
    return title.includes(q) || content.includes(q);
  });
});

const close = () => {
  searchQuery.value = '';
  emit('update:modelValue', false);
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="(val) => !val && close()"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card color="background" rounded="0" class="d-flex flex-column fill-height">
      <v-toolbar color="surface" elevation="0" class="m3-fullscreen-toolbar flex-grow-0">
        <v-btn icon="mdi-close" :aria-label="t('about.close')" @click="close"></v-btn>
        <v-toolbar-title class="font-weight-bold">{{ t('help.title') }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-0 flex-grow-1 overflow-y-auto">
        <v-container class="help-container pb-10">
          <p class="text-body-2 text-medium-emphasis mb-4">{{ t('help.intro') }}</p>

          <v-text-field
            v-model="searchQuery"
            :placeholder="t('help.searchPlaceholder')"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            rounded="xl"
            density="comfortable"
            clearable
            hide-details
            class="mb-4 help-search-field"
            data-testid="help-search-input"
          ></v-text-field>

          <v-expansion-panels v-if="filteredSections.length > 0" variant="accordion" class="m3-help-panels">
            <v-expansion-panel
              v-for="section in filteredSections"
              :key="section.key"
              rounded="xl"
              elevation="0"
              class="mb-2 m3-help-panel"
            >
              <v-expansion-panel-title class="font-weight-medium py-3">
                <v-avatar color="primary" variant="tonal" size="34" rounded="lg" class="mr-3 flex-shrink-0">
                  <v-icon size="19">{{ section.icon }}</v-icon>
                </v-avatar>
                <span>{{ t(`help.sections.${section.key}.title`) }}</span>
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 help-content">
                {{ t(`help.sections.${section.key}.content`) }}
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <div v-else class="text-center py-8 text-medium-emphasis text-body-2">
            {{ t('help.noResults') }}
          </div>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.help-container {
  max-width: 680px;
}
.m3-help-panel {
  border: 1px solid rgba(var(--v-border-color), 0.5);
  overflow: hidden;
}
.help-content {
  white-space: pre-line;
  line-height: 1.65;
}
.help-search-field :deep(.v-field__clearable) {
  margin-inline-end: 6px;
}
</style>
