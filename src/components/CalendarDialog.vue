<script setup>
import { useI18n } from 'vue-i18n'
import { createCalendarEvent } from '../utils/calendarUtils'

const props = defineProps({
  modelValue: Boolean,
  date: String,
  rawDate: Date
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const close = () => {
  emit('update:modelValue', false)
}

const createEvent = () => {
  const title = t('app.calendarTitle')
  const appUrl = 'https://the3ver.github.io/mymeds/'
  const description = `${t('app.calendarDesc')}\n${appUrl}`
  
  createCalendarEvent(title, description, props.rawDate, appUrl)
  close()
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="400px" persistent>
    <v-card>
      <v-card-title class="text-h5">{{ t('calendar.title') }}</v-card-title>
      <v-card-text>
        <p>{{ t('calendar.message', { date: date }) }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="close">{{ t('calendar.close') }}</v-btn>
        <v-btn color="primary" variant="elevated" @click="createEvent">{{ t('dialog.create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>