<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import LinkDialog from './LinkDialog.vue';
import { useDoctorTypes, useVaccinationMethods } from '../utils/calendarOptions.js';
import { appendLink } from '../../common/utils/stringUtils.js';
import { getLocalDateString } from '../utils/calendarUtils.js';

const props = defineProps({
  modelValue: Boolean,
  entry: {
    type: Object,
    default: () => ({
      date: '',
      time: '',
      title: '',
      type: 'doctor',
      doctor: '',
      doctorType: '',
      location: '',
      treatments: '', // Changed to String for mixed content
      agent: '',
      method: '',
      bodyPart: '',
      pathogen: '',
      symptoms: '',
      endDate: '',
      notes: '',
      needsReferral: true,
      referralStatus: 'needed'
    })
  },
  suggestions: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Entry'
  },
  confirmText: {
    type: String,
    default: 'Save'
  },
  isEdit: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);
const { t } = useI18n();

const doctorTypes = useDoctorTypes();
const vaccinationMethods = useVaccinationMethods();

const referralStatusOptions = computed(() => [
  { title: t('calendar.referral.status.needed'), value: 'needed' },
  { title: t('calendar.referral.status.present'), value: 'present' },
  { title: t('calendar.referral.status.submitted'), value: 'submitted' }
]);

function normalizeEntry(entry) {
  const norm = { ...entry };
  if (!norm.date) {
    norm.date = getLocalDateString();
  }
  if (!norm.time) {
    norm.time = '';
  }
  // Ensure treatments is a string (migration from array if needed)
  if (Array.isArray(norm.treatments)) {
    norm.treatments = norm.treatments.join(', ');
  } else if (!norm.treatments) {
    norm.treatments = '';
  }
  if (norm.type === 'doctor') {
    if (norm.needsReferral === undefined) {
      norm.needsReferral = !props.isEdit;
    }
    if (!norm.referralStatus) {
      norm.referralStatus = 'needed';
    }
  }
  return norm;
}

const localEntry = ref(normalizeEntry(props.entry));
const treatmentsInput = ref(null); // Reference to textarea
const showLinkDialog = ref(false);

// Watch for dialog opening to reset/set values
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      localEntry.value = normalizeEntry(props.entry);
    }
  }
);

const addSuggestion = (suggestion) => {
  const tag = `#${suggestion}#`;
  const currentText = localEntry.value.treatments || '';

  // Append tag. If text is not empty and doesn't end with space, add space.
  if (currentText && !currentText.endsWith(' ')) {
    localEntry.value.treatments = currentText + ' ' + tag + ' ';
  } else {
    localEntry.value.treatments = currentText + tag + ' ';
  }

  // Focus back to textarea
  // Note: Vuetify refs might need .value.$el.querySelector('textarea') or similar
  // but simple focus might work if user clicks chip
};

const addLink = (link) => {
  localEntry.value.notes = appendLink(localEntry.value.notes, link);
};

const close = () => {
  emit('update:modelValue', false);
};

const save = () => {
  if (localEntry.value.date && localEntry.value.title) {
    emit('confirm', localEntry.value);
    close();
  }
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
        <v-btn icon="mdi-close" :aria-label="t('dialog.cancel')" @click="close"></v-btn>
        <v-toolbar-title class="font-weight-bold text-subtitle-1">{{ title }}</v-toolbar-title>
        <template v-slot:append>
          <v-btn color="primary" variant="flat" rounded="pill" class="mr-2 px-5 font-weight-bold" @click="save">
            {{ confirmText }}
          </v-btn>
        </template>
      </v-toolbar>

      <v-card-text class="pa-0 flex-grow-1 overflow-y-auto">
        <v-container class="cal-form-container pb-12">
          <!-- Common Fields -->
          <div class="d-flex ga-3 mb-2">
            <v-text-field
              v-model="localEntry.date"
              :label="t('calendar.fields.date') + ' *'"
              type="date"
              variant="outlined"
              class="flex-grow-1"
              required
            ></v-text-field>
            <v-text-field
              v-model="localEntry.time"
              :label="t('calendar.fields.time')"
              type="time"
              variant="outlined"
              class="time-field"
              data-testid="entry-time"
            ></v-text-field>
          </div>

          <v-text-field
            v-model="localEntry.title"
            :label="t('calendar.fields.title') + ' *'"
            variant="outlined"
            class="mb-2"
            required
            autofocus
          ></v-text-field>

          <!-- Doctor Appointment Fields -->
          <template v-if="localEntry.type === 'doctor'">
            <v-text-field
              v-model="localEntry.doctor"
              :label="t('calendar.fields.doctor')"
              variant="outlined"
              class="mb-2"
            ></v-text-field>

            <v-select
              v-model="localEntry.doctorType"
              :items="doctorTypes"
              :label="t('calendar.fields.type')"
              variant="outlined"
              item-title="title"
              item-value="value"
              class="mb-2"
            ></v-select>

            <v-text-field
              v-model="localEntry.location"
              :label="t('calendar.fields.location')"
              variant="outlined"
              class="mb-3"
            ></v-text-field>

            <!-- Referral Section Card -->
            <v-card class="m3-card pa-4 mb-4">
              <v-switch
                v-model="localEntry.needsReferral"
                :label="t('calendar.referral.needsReferral')"
                color="primary"
                density="comfortable"
                hide-details
              ></v-switch>

              <v-select
                v-if="localEntry.needsReferral"
                v-model="localEntry.referralStatus"
                :items="referralStatusOptions"
                :label="t('calendar.referral.statusLabel')"
                variant="outlined"
                item-title="title"
                item-value="value"
                hide-details
                class="mt-3"
              ></v-select>
            </v-card>

            <!-- Treatments Textarea -->
            <v-textarea
              ref="treatmentsInput"
              v-model="localEntry.treatments"
              :label="t('calendar.fields.treatments')"
              variant="outlined"
              rows="2"
              auto-grow
              :hint="t('calendar.fields.treatmentsHint')"
              persistent-hint
              class="mb-3"
            ></v-textarea>

            <!-- Suggestions -->
            <div v-if="suggestions.length > 0" class="mb-4">
              <div class="d-flex flex-wrap ga-2">
                <v-chip
                  v-for="suggestion in suggestions"
                  :key="suggestion"
                  size="small"
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="addSuggestion(suggestion)"
                >
                  {{ suggestion }}
                </v-chip>
              </div>
            </div>
          </template>

          <!-- Vaccination Fields -->
          <template v-if="localEntry.type === 'vaccination'">
            <v-text-field
              v-model="localEntry.agent"
              :label="t('calendar.fields.agent')"
              variant="outlined"
              class="mb-2"
            ></v-text-field>

            <v-select
              v-model="localEntry.method"
              :items="vaccinationMethods"
              :label="t('calendar.fields.method')"
              variant="outlined"
              item-title="title"
              item-value="value"
              class="mb-2"
            ></v-select>

            <v-text-field
              v-model="localEntry.bodyPart"
              :label="t('calendar.fields.bodyPart')"
              variant="outlined"
              class="mb-2"
            ></v-text-field>
          </template>

          <!-- Illness Fields -->
          <template v-if="localEntry.type === 'illness'">
            <v-text-field
              v-model="localEntry.pathogen"
              :label="t('calendar.fields.pathogen')"
              variant="outlined"
              class="mb-2"
            ></v-text-field>

            <v-textarea
              v-model="localEntry.symptoms"
              :label="t('calendar.fields.symptoms')"
              variant="outlined"
              rows="2"
              auto-grow
              class="mb-2"
            ></v-textarea>

            <v-text-field
              v-model="localEntry.endDate"
              :label="t('calendar.fields.endDate')"
              type="date"
              variant="outlined"
              class="mb-2"
            ></v-text-field>
          </template>

          <!-- Note Fields -->
          <template v-if="localEntry.type === 'note'">
            <v-text-field
              v-model="localEntry.endDate"
              :label="t('calendar.fields.endDate')"
              type="date"
              variant="outlined"
              class="mb-2"
            ></v-text-field>
          </template>

          <!-- Common Notes Field (for all types) -->
          <v-textarea
            v-model="localEntry.notes"
            :label="t('calendar.fields.notes')"
            variant="outlined"
            rows="3"
            auto-grow
          >
            <template v-slot:append-inner>
              <v-btn
                icon="mdi-link-plus"
                variant="text"
                size="small"
                :aria-label="t('calendar.addLink.title')"
                :title="t('calendar.addLink.title')"
                @click="showLinkDialog = true"
              ></v-btn>
            </template>
          </v-textarea>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Link Dialog -->
  <LinkDialog v-model="showLinkDialog" @add="addLink" />
</template>

<style scoped>
.cal-form-container {
  max-width: 600px;
}
.time-field {
  max-width: 145px;
}
</style>
