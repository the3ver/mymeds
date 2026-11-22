<script setup>
import { useI18n } from 'vue-i18n';
import packageJson from '../../../../package.json';

defineProps({
  modelValue: Boolean,
  isCheckingUpdates: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'open-whats-new', 'check-updates']);
const { t } = useI18n();
const appVersion = packageJson.version;

function close() {
  emit('update:modelValue', false);
}

function handleWhatsNew() {
  emit('open-whats-new');
  close();
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="(val) => !val && close()" max-width="500px">
    <v-card>
      <v-card-title>{{ t('about.title') }}</v-card-title>
      <v-card-text>
        <p class="mb-4">{{ t('about.description') }}</p>
        <p class="mb-4 text-body-2 text-grey-darken-1">{{ t('about.explanation') }}</p>

        <v-list density="compact">
          <v-list-item
            prepend-icon="mdi-tag-text-outline"
            :title="t('about.version')"
            :subtitle="appVersion"
            data-testid="about-version-item"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-text-box-outline"
            append-icon="mdi-open-in-new"
            :title="t('about.changelog')"
            href="https://github.com/the3ver/mymeds/releases"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="about-changelog-item"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-github"
            append-icon="mdi-open-in-new"
            :title="t('about.github')"
            href="https://github.com/the3ver/mymeds"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="about-github-item"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-license"
            append-icon="mdi-open-in-new"
            :title="t('about.license')"
            href="https://github.com/the3ver/mymeds/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="about-license-item"
          ></v-list-item>
        </v-list>

        <div class="d-flex flex-column mt-4">
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-sparkles"
            @click="handleWhatsNew"
            class="mb-2 text-none"
            data-testid="about-whats-new-btn"
          >
            {{ t('whatsNew.title') }}
          </v-btn>
          <v-btn
            variant="outlined"
            prepend-icon="mdi-update"
            :loading="isCheckingUpdates"
            @click="emit('check-updates')"
            class="text-none"
            data-testid="about-check-updates-btn"
          >
            {{ t('updates.check') }}
          </v-btn>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="close">{{ t('about.close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
