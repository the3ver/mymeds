<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean,
  entry: {
    type: Object,
    default: () => ({
      date: '',
      title: '',
      type: 'doctor', // doctor, vaccination, illness, note
      // Doctor fields
      doctor: '',
      doctorType: '',
      location: '',
      treatments: [],
      // Vaccination fields
      agent: '',
      method: '',
      bodyPart: '',
      // Illness fields
      pathogen: '',
      symptoms: '',
      endDate: '',
      // Note fields
      notes: ''
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

const localEntry = ref({ ...props.entry })

// Watch for dialog opening to reset/set values
watch(() => props.modelValue, (val) => {
  if (val) {
    localEntry.value = { ...props.entry }
    // If date is empty, set to today
    if (!localEntry.value.date) {
      localEntry.value.date = new Date().toISOString().substr(0, 10)
    }
    // Ensure treatments is an array
    if (!localEntry.value.treatments) {
      localEntry.value.treatments = []
    }
  }
})

const doctorTypes = computed(() => [
  { title: t('calendar.doctorTypes.general'), value: 'general' },
  { title: t('calendar.doctorTypes.specialist'), value: 'specialist' },
  { title: t('calendar.doctorTypes.dentist'), value: 'dentist' },
  { title: t('calendar.doctorTypes.eye'), value: 'eye' },
  { title: t('calendar.doctorTypes.skin'), value: 'skin' },
  { title: t('calendar.doctorTypes.women'), value: 'women' },
  { title: t('calendar.doctorTypes.men'), value: 'men' },
  { title: t('calendar.doctorTypes.heart'), value: 'heart' },
  { title: t('calendar.doctorTypes.ortho'), value: 'ortho' },
  { title: t('calendar.doctorTypes.neuro'), value: 'neuro' },
  { title: t('calendar.doctorTypes.psych'), value: 'psych' },
  { title: t('calendar.doctorTypes.nephro'), value: 'nephro' },
  { title: t('calendar.doctorTypes.other'), value: 'other' }
])

const vaccinationMethods = computed(() => [
  { title: t('calendar.methods.subcutaneous'), value: 'subcutaneous' },
  { title: t('calendar.methods.intramuscular'), value: 'intramuscular' },
  { title: t('calendar.methods.oral'), value: 'oral' },
  { title: t('calendar.methods.rectal'), value: 'rectal' },
  { title: t('calendar.methods.other'), value: 'other' }
])

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
      <v-card-text>
        <!-- Common Fields -->
        <v-text-field
          v-model="localEntry.date"
          :label="t('calendar.fields.date')"
          type="date"
          variant="underlined"
          required
        ></v-text-field>
        
        <v-text-field
          v-model="localEntry.title"
          :label="t('calendar.fields.title')"
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

          <v-combobox
            v-model="localEntry.treatments"
            :items="suggestions"
            :label="t('calendar.fields.treatments')"
            multiple
            chips
            closable-chips
            variant="underlined"
            hide-selected
            :hint="t('calendar.fields.treatmentsHint')"
            persistent-hint
          ></v-combobox>
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
        ></v-textarea>

      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="close">{{ t('dialog.cancel') }}</v-btn>
        <v-btn color="primary" text @click="save">{{ confirmText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>