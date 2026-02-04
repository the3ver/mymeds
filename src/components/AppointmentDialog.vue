<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean,
  appointment: {
    type: Object,
    default: () => ({
      date: '',
      title: '',
      doctor: '',
      type: '',
      location: '',
      notes: ''
    })
  },
  title: {
    type: String,
    default: 'Appointment'
  },
  confirmText: {
    type: String,
    default: 'Save'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])
const { t } = useI18n()

const localAppointment = ref({ ...props.appointment })

// Watch for dialog opening to reset/set values
watch(() => props.modelValue, (val) => {
  if (val) {
    localAppointment.value = { ...props.appointment }
    // If date is empty, set to today
    if (!localAppointment.value.date) {
      localAppointment.value.date = new Date().toISOString().split('T')[0]
    }
  }
})

const doctorTypes = computed(() => [
  { title: t('appointments.types.general'), value: 'general' },
  { title: t('appointments.types.specialist'), value: 'specialist' },
  { title: t('appointments.types.dentist'), value: 'dentist' },
  { title: t('appointments.types.eye'), value: 'eye' },
  { title: t('appointments.types.skin'), value: 'skin' },
  { title: t('appointments.types.women'), value: 'women' },
  { title: t('appointments.types.men'), value: 'men' },
  { title: t('appointments.types.heart'), value: 'heart' },
  { title: t('appointments.types.ortho'), value: 'ortho' },
  { title: t('appointments.types.neuro'), value: 'neuro' },
  { title: t('appointments.types.psych'), value: 'psych' },
  { title: t('appointments.types.nephro'), value: 'nephro' },
  { title: t('appointments.types.other'), value: 'other' }
])

const close = () => {
  emit('update:modelValue', false)
}

const save = () => {
  if (localAppointment.value.date && localAppointment.value.title) {
    emit('confirm', localAppointment.value)
    close()
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" max-width="500px">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="localAppointment.date"
          :label="t('appointments.date')"
          type="date"
          variant="underlined"
          required
        ></v-text-field>
        
        <v-text-field
          v-model="localAppointment.title"
          :label="t('appointments.titleLabel')"
          variant="underlined"
          required
          autofocus
        ></v-text-field>
        
        <v-text-field
          v-model="localAppointment.doctor"
          :label="t('appointments.doctor')"
          variant="underlined"
        ></v-text-field>
        
        <v-select
          v-model="localAppointment.type"
          :items="doctorTypes"
          :label="t('appointments.type')"
          variant="underlined"
          item-title="title"
          item-value="value"
        ></v-select>
        
        <v-text-field
          v-model="localAppointment.location"
          :label="t('appointments.location')"
          variant="underlined"
        ></v-text-field>
        
        <v-textarea
          v-model="localAppointment.notes"
          :label="t('appointments.notes')"
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