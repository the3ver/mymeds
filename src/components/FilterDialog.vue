<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean,
  selectedFilters: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'update:selectedFilters'])
const { t } = useI18n()

const availableTypes = computed(() => [
  { title: t('calendar.types.doctor'), value: 'doctor' },
  { title: t('calendar.types.vaccination'), value: 'vaccination' },
  { title: t('calendar.types.illness'), value: 'illness' },
  { title: t('calendar.types.note'), value: 'note' }
])

const localFilters = computed({
  get: () => props.selectedFilters,
  set: (val) => emit('update:selectedFilters', val)
})

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" max-width="400px">
    <v-card>
      <v-card-title>{{ t('calendar.filter') }}</v-card-title>
      <v-card-text>
        <v-checkbox
          v-for="type in availableTypes"
          :key="type.value"
          v-model="localFilters"
          :label="type.title"
          :value="type.value"
          hide-details
          density="compact"
        ></v-checkbox>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="close">{{ t('dialog.confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>