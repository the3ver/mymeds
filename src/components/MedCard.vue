<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { parseDose } from '../utils/medUtils'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])
const { t } = useI18n()

const isExpanded = ref(false)

const dailyDoseTotal = computed(() => {
  return parseDose(props.item.dose)
})

const displayPlan = computed(() => {
  const dose = props.item.dose || ''
  // Handle legacy or empty data
  if (!dose) return '0-0-0'
  
  // If it's a pattern
  if (dose.includes('-')) {
    const parts = dose.split('-')
    // Ensure at least 3 parts (M-N-E)
    while (parts.length < 3) {
      parts.push('0')
    }
    
    // Check if 4th part (Night) exists and is not 0
    if (parts.length >= 4) {
      const nightDose = parts[3]
      if (nightDose && nightDose !== '0' && nightDose !== '') {
        return parts.slice(0, 4).join('-')
      }
    }
    
    // Return only first 3 parts
    return parts.slice(0, 3).join('-')
  }
  
  // If it's a single number, assume it's the morning dose
  return `${dose}-0-0`
})

const daysRemaining = computed(() => {
  const dose = dailyDoseTotal.value
  if (!dose || dose <= 0) return null
  return Math.floor(props.item.count / dose)
})

const emptyDate = computed(() => {
  const days = daysRemaining.value
  if (days === null) return null
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString()
})
</script>

<template>
  <v-card
    class="mb-4"
    variant="elevated"
    @click="isExpanded = !isExpanded"
    :ripple="true"
  >
    <v-card-item>
      <template v-slot:prepend>
        <v-avatar :color="item.color" class="mr-2">
          <span class="text-h6 text-white">{{ item.name.charAt(0).toUpperCase() }}</span>
        </v-avatar>
      </template>
      
      <v-card-title class="text-wrap" style="line-height: 1.2;">
        <div class="text-h6 font-weight-bold mb-1">{{ item.name }}</div>
        <div class="d-flex flex-wrap align-center gap-2 text-body-2 text-grey">
          <span v-if="item.ingredient">({{ item.ingredient }})</span>
          <span class="text-high-emphasis font-weight-bold ml-1">{{ displayPlan }}</span>
        </div>
      </v-card-title>
      
      <template v-slot:append>
        <div class="d-flex align-center pl-2">
          <v-chip color="primary" variant="tonal" class="mr-2 text-body-1 font-weight-bold">
            {{ item.count }}
          </v-chip>
        </div>
      </template>
    </v-card-item>

    <v-expand-transition>
      <div v-if="isExpanded">
        <v-divider></v-divider>
        <v-card-text>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-grey">{{ t('med.dose') }}:</span>
            <span class="font-weight-medium">{{ dailyDoseTotal }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-grey">{{ t('med.daysRemaining') }}:</span>
            <span class="font-weight-medium">{{ daysRemaining !== null ? daysRemaining : t('med.na') }}</span>
          </div>
          <div class="d-flex justify-space-between mb-4">
            <span class="text-grey">{{ t('med.emptyDate') }}:</span>
            <span class="font-weight-medium">{{ emptyDate !== null ? emptyDate : t('med.na') }}</span>
          </div>
          
          <div class="d-flex justify-end gap-2">
            <v-btn
              variant="text"
              color="primary"
              prepend-icon="mdi-pencil"
              @click.stop="emit('edit')"
            >
              {{ t('dialog.edit') }}
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              prepend-icon="mdi-delete"
              @click.stop="emit('delete')"
            >
              {{ t('dialog.delete') }}
            </v-btn>
          </div>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<style scoped>
.text-wrap {
  white-space: normal !important;
}
.gap-2 {
  gap: 8px;
}
</style>