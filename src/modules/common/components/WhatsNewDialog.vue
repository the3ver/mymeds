<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getAllChangelogs, getLatestChangelog } from '../utils/changelog';
import * as dataService from '../utils/dataService';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  autoSaveVersion: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

const { t, locale } = useI18n();

const showHistory = ref(false);
const allEntries = getAllChangelogs();
const latestEntry = computed(() => getLatestChangelog());
const previousEntries = computed(() => allEntries.slice(1));

const currentLang = computed(() => (locale.value?.startsWith('de') ? 'de' : 'en'));

async function handleClose() {
  if (props.autoSaveVersion && latestEntry.value?.version) {
    try {
      await dataService.saveLastSeenChangelogVersion(latestEntry.value.version);
    } catch (e) {
      console.warn('[WhatsNewDialog] Failed to save last seen version:', e);
    }
  }
  emit('update:modelValue', false);
  emit('close');
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="val => { if (!val) handleClose(); }"
    max-width="520px"
    scrollable
  >
    <v-card class="whats-new-card rounded-lg">
      <v-card-title class="d-flex align-center pt-4 pb-2 px-5">
        <v-icon color="primary" class="mr-2" size="28">mdi-sparkles</v-icon>
        <span class="text-h6 font-weight-bold">{{ t('whatsNew.title') }}</span>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="px-5 py-4" style="max-height: 480px;">
        <div v-if="latestEntry" class="mb-4">
          <div class="d-flex align-center justify-space-between mb-2">
            <v-chip color="primary" variant="flat" size="small" class="font-weight-bold">
              {{ t('whatsNew.versionBadge', { version: latestEntry.version }) }}
            </v-chip>
            <span class="text-caption text-medium-emphasis">
              {{ t('whatsNew.releasedOn', { date: latestEntry.date }) }}
            </span>
          </div>

          <h3 class="text-subtitle-1 font-weight-bold mb-3">
            {{ latestEntry.title[currentLang] || latestEntry.title.de }}
          </h3>

          <v-list density="compact" class="bg-transparent pa-0">
            <v-list-item
              v-for="(item, idx) in (latestEntry.highlights[currentLang] || latestEntry.highlights.de)"
              :key="idx"
              class="px-0 py-1"
            >
              <template v-slot:prepend>
                <v-icon color="primary" size="20" class="mr-3">mdi-check-circle-outline</v-icon>
              </template>
              <v-list-item-title class="text-body-2 text-wrap line-height-normal">
                {{ item }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>

        <!-- Previous Versions Toggle -->
        <div v-if="previousEntries.length > 0" class="mt-4 pt-2 border-t">
          <v-btn
            variant="text"
            size="small"
            color="secondary"
            class="px-0 mb-2"
            :append-icon="showHistory ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            @click="showHistory = !showHistory"
          >
            {{ showHistory ? t('whatsNew.hidePrevious') : t('whatsNew.showPrevious') }}
          </v-btn>

          <v-expand-transition>
            <div v-show="showHistory" class="previous-versions-list mt-2">
              <v-card
                v-for="entry in previousEntries"
                :key="entry.version"
                variant="outlined"
                class="mb-3 pa-3 rounded"
              >
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-caption text-primary">
                    v{{ entry.version }}
                  </span>
                  <span class="text-caption text-medium-emphasis">
                    {{ entry.date }}
                  </span>
                </div>
                <div class="text-caption font-weight-medium mb-2">
                  {{ entry.title[currentLang] || entry.title.de }}
                </div>
                <ul class="text-caption pl-4 mb-0 text-medium-emphasis">
                  <li
                    v-for="(item, idx) in (entry.highlights[currentLang] || entry.highlights.de)"
                    :key="idx"
                    class="mb-1"
                  >
                    {{ item }}
                  </li>
                </ul>
              </v-card>
            </div>
          </v-expand-transition>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="px-5 py-3">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="elevated"
          class="px-6"
          @click="handleClose"
          data-testid="whats-new-close-btn"
        >
          {{ t('whatsNew.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.whats-new-card {
  overflow: hidden;
}
.border-t {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.12));
}
.line-height-normal {
  line-height: 1.4;
  white-space: normal;
}
</style>
