<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import LinkDialog from './LinkDialog.vue'
import { useDoctorTypes, useVaccinationMethods } from '../utils/calendarOptions.js'
import { appendLink } from '../../common/utils/stringUtils.js'

const props = defineProps({
  modelValue: Boolean,
  entry: {
    type: Object,
    default: () => ({
      date: '',
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
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])
const { t } = useI18n()

const doctorTypes = useDoctorTypes()
const vaccinationMethods = useVaccinationMethods()

const referralStatusOptions = computed(() => [
  { title: t('calendar.referral.status.needed'), value: 'needed' },
  { title: t('calendar.referral.status.present'), value: 'present' },
  { title: t('calendar.referral.status.submitted'), value: 'submitted' }
])

function normalizeEntry(entry) {
  const norm = { ...entry }
  if (!norm.date) {
    norm.date = new Date().toISOString().split('T')[0]
  }
  // Ensure treatments is a string (migration from array if needed)
  if (Array.isArray(norm.treatments)) {
    norm.treatments = norm.treatments.join(', ')
  } else if (!norm.treatments) {
    norm.treatments = ''
  }
  if (norm.type === 'doctor') {
    if (norm.needsReferral === undefined) {
      norm.needsReferral = true
    }
    if (!norm.referralStatus) {
      norm.referralStatus = 'needed'
    }
  }
  return norm
}

const localEntry = ref(normalizeEntry(props.entry))
const treatmentsInput = ref(null) // Reference to textarea
const showLinkDialog = ref(false)

// Watch for dialog opening to reset/set values
watch(() => props.modelValue, (val) => {
  if (val) {
    localEntry.value = normalizeEntry(props.entry)
  }
})

const addSuggestion = (suggestion) => {
  const tag = `#${suggestion}#`
  const currentText = localEntry.value.treatments || ''

  // Append tag. If text is not empty and doesn't end with space, add space.
  if (currentText && !currentText.endsWith(' ')) {
    localEntry.value.treatments = currentText + ' ' + tag + ' '
  } else {
    localEntry.value.treatments = currentText + tag + ' '
  }

  // Focus back to textarea
  // Note: Vuetify refs might need .value.$el.querySelector('textarea') or similar
  // but simple focus might work if user clicks chip
}

const addLink = (link) => {
  localEntry.value.notes = appendLink(localEntry.value.notes, link)
}

const close = () => {
  emit('update:modelValue', false)
}

const save = () => {
  if (localEntry.value.date && localEntry.value.title) {
    emit('confirm', localEntry.value)
    close()
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" max-width="500px">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text class="text-body-1">
        <!-- Common Fields -->
        <v-text-field
          v-model="localEntry.date"
          :label="t('calendar.fields.date') + ' *'"
          type="date"
          variant="underlined"
          required
        ></v-text-field>

        <v-text-field
          v-model="localEntry.title"
          :label="t('calendar.fields.title') + ' *'"
          variant="underlined"
          required
          autofocus
        ></v-text-field>

        <!-- Doctor Appointment Fields -->
        <template v-if="localEntry.type === 'doctor'">
          <v-text-field
            v-model="localEntry.doctor"
            :label="t('calendar.fields.doctor')"
            variant="underlined"
          ></v-text-field>

          <v-select
            v-model="localEntry.doctorType"
            :items="doctorTypes"
            :label="t('calendar.fields.type')"
            variant="underlined"
            item-title="title"
            item-value="value"
          ></v-select>

          <v-text-field
            v-model="localEntry.location"
            :label="t('calendar.fields.location')"
            variant="underlined"
          ></v-text-field>

          <!-- Referral Section -->
          <v-switch
            v-model="localEntry.needsReferral"
            :label="t('calendar.referral.needsReferral')"
            color="primary"
            density="compact"
            class="mt-2"
            hide-details
          ></v-switch>

          <v-select
            v-if="localEntry.needsReferral"
            v-model="localEntry.referralStatus"
            :items="referralStatusOptions"
            :label="t('calendar.referral.statusLabel')"
            variant="underlined"
            item-title="title"
            item-value="value"
            class="mt-1"
          ></v-select>

          <!-- Treatments Textarea -->
          <v-textarea
            ref="treatmentsInput"
            v-model="localEntry.treatments"
            :label="t('calendar.fields.treatments')"
            variant="underlined"
            rows="2"
            auto-grow
            :hint="t('calendar.fields.treatmentsHint')"
            persistent-hint
          ></v-textarea>

          <!-- Suggestions -->
          <div v-if="suggestions.length > 0" class="mb-4">
            <div class="text-caption text-grey mb-1">Suggestions:</div>
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="suggestion in suggestions"
                :key="suggestion"
                size="small"
                variant="outlined"
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
            variant="underlined"
          ></v-text-field>

          <v-select
            v-model="localEntry.method"
            :items="vaccinationMethods"
            :label="t('calendar.fields.method')"
            variant="underlined"
            item-title="title"
            item-value="value"
          ></v-select>

          <v-text-field
            v-model="localEntry.bodyPart"
            :label="t('calendar.fields.bodyPart')"
            variant="underlined"
          ></v-text-field>
        </template>

        <!-- Illness Fields -->
        <template v-if="localEntry.type === 'illness'">
          <v-text-field
            v-model="localEntry.pathogen"
            :label="t('calendar.fields.pathogen')"
            variant="underlined"
          ></v-text-field>

          <v-textarea
            v-model="localEntry.symptoms"
            :label="t('calendar.fields.symptoms')"
            variant="underlined"
            rows="2"
            auto-grow
          ></v-textarea>

          <v-text-field
            v-model="localEntry.endDate"
            :label="t('calendar.fields.endDate')"
            type="date"
            variant="underlined"
          ></v-text-field>
        </template>

        <!-- Note Fields -->
        <template v-if="localEntry.type === 'note'">
           <v-text-field
            v-model="localEntry.endDate"
            :label="t('calendar.fields.endDate')"
            type="date"
            variant="underlined"
          ></v-text-field>
        </template>

        <!-- Common Notes Field (for all types) -->
        <v-textarea
          v-model="localEntry.notes"
          :label="t('calendar.fields.notes')"
          variant="underlined"
          rows="3"
          auto-grow
        >
          <template v-slot:append-inner>
            <v-btn icon variant="text" size="small" @click="showLinkDialog = true">
              <v-icon>mdi-link-plus</v-icon>
            </v-btn>
          </template>
        </v-textarea>

      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="close">{{ t('dialog.cancel') }}</v-btn>
        <v-btn color="primary" text @click="save">{{ confirmText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Link Dialog -->
  <LinkDialog v-model="showLinkDialog" @add="addLink" />
</template>

<style scoped>
.gap-1 {
  gap: 4px;
}
</style>