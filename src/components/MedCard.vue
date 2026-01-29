<script setup>
import { ref, computed } from 'vue'
import { parseDose } from '../utils/medUtils'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const isExpanded = ref(false)

const dailyDoseTotal = computed(() => {
  return parseDose(props.item.dose)
})

const displayPlan = computed(() => {
  const dose = props.item.dose || ''
  // Handle legacy or empty data
  if (!dose) return '0-0-0-0'
  
  // If it's a pattern
  if (dose.includes('-')) {
    const parts = dose.split('-')
    // Ensure 4 parts for display (M-N-E-N)
    while (parts.length < 4) {
      parts.push('0')
    }
    return parts.join('-')
  }
  
  // If it's a single number, assume it's the morning dose (as per DoseInput logic)
  return `${dose}-0-0-0`
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
      
      <v-card-title>
        {{ item.name }}
        <div v-if="item.ingredient" class="text-caption text-grey">
          ({{ item.ingredient }})
        </div>
      </v-card-title>
      
      <template v-slot:append>
        <div class="d-flex align-center">
          <div class="d-flex flex-column align-end mr-3">
             <span class="text-caption text-grey mb-1">Plan</span>
             <span class="text-body-2 font-weight-bold">{{ displayPlan }}</span>
          </div>
          
          <v-chip color="primary" variant="tonal" class="mr-2 text-body-1 font-weight-bold">
            {{ item.count }}
          </v-chip>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                density="comfortable"
                v-bind="props"
                @click.stop
              ></v-btn>
            </template>
            <v-list>
              <v-list-item @click="emit('edit')">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
              <v-list-item @click="emit('delete')">
                <v-list-item-title class="text-red">Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
    </v-card-item>

    <v-expand-transition>
      <div v-if="isExpanded">
        <v-divider></v-divider>
        <v-card-text>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-grey">Daily Dose:</span>
            <span class="font-weight-medium">{{ dailyDoseTotal }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-grey">Days remaining:</span>
            <span class="font-weight-medium">{{ daysRemaining !== null ? daysRemaining : 'N/A' }} days</span>
          </div>
          <div class="d-flex justify-space-between">
            <span class="text-grey">Estimated empty date:</span>
            <span class="font-weight-medium">{{ emptyDate !== null ? emptyDate : 'N/A' }}</span>
          </div>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<style scoped>
</style>