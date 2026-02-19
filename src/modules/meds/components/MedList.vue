<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import MedCard from './MedCard.vue'
import CalendarDialog from '../../../components/CalendarDialog.vue'
import { parseDose, calculateDaysRemaining, getStatusColor } from '../utils/medUtils'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  deductions: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['edit', 'delete'])
const { t, locale } = useI18n()

const sortMode = ref('added')
const yellowLimit = ref(21)
const redLimit = ref(7)
const calendarDialog = ref(false)

const updateSettings = () => {
  const savedSort = localStorage.getItem('myMedsSortMode')
  if (savedSort) sortMode.value = savedSort

  const savedYellow = localStorage.getItem('myMedsYellowLimit')
  if (savedYellow) yellowLimit.value = parseInt(savedYellow)

  const savedRed = localStorage.getItem('myMedsRedLimit')
  if (savedRed) redLimit.value = parseInt(savedRed)
}

onMounted(() => {
  updateSettings()
  window.addEventListener('storage-sort-mode-changed', updateSettings)
  window.addEventListener('storage-limits-changed', updateSettings)
})

onUnmounted(() => {
  window.removeEventListener('storage-sort-mode-changed', updateSettings)
  window.removeEventListener('storage-limits-changed', updateSettings)
})

const sortedItems = computed(() => {
  // Create a copy to sort, but we need to keep track of original indices for editing/deleting
  const itemsWithIndex = props.items.map((item, index) => ({ ...item, originalIndex: index }))

  if (sortMode.value === 'name') {
    return itemsWithIndex.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortMode.value === 'days') {
    return itemsWithIndex.sort((a, b) => {
      const doseA = parseDose(a.dose)
      const doseB = parseDose(b.dose)

      // Handle cases with 0 dose (infinite days) -> put at end
      if (doseA <= 0 && doseB <= 0) return 0
      if (doseA <= 0) return 1
      if (doseB <= 0) return -1

      const daysA = a.count / doseA
      const daysB = b.count / doseB
      return daysA - daysB
    })
  }

  // Default: 'added' (no sort, just original order)
  return itemsWithIndex
})

const overviewData = computed(() => {
  if (props.items.length === 0) return null

  let minDays = Infinity
  let hasValidMeds = false

  for (const item of props.items) {
    const days = calculateDaysRemaining(item)
    if (days !== null) {
      hasValidMeds = true
      if (days < minDays) {
        minDays = days
      }
    }
  }

  if (!hasValidMeds || minDays === Infinity) return null

  const date = new Date()
  date.setDate(date.getDate() + minDays)

  // Format date with weekday
  const options = { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' }
  const formattedDate = date.toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US', options)

  const status = getStatusColor(minDays, yellowLimit.value, redLimit.value)

  return {
    date: formattedDate,
    days: minDays,
    status: status,
    isCritical: status !== null,
    rawDate: date
  }
})

const calendarDate = computed(() => {
  if (!overviewData.value) return null

  // Calculate date for yellow limit warning
  // If we are already below yellow limit, use tomorrow
  // Otherwise use the date when we hit the yellow limit

  // Actually, the requirement says: "Termin sollte zum Datum eingestellt werden das der gelben Warnstufe entspeicht"
  // This means: Date when meds run out MINUS yellow limit days?
  // Or simply the date when meds run out?
  // Usually a reminder is set BEFORE it runs out.
  // Let's set it to (Empty Date - Yellow Limit Days)
  // But if that date is in the past, set it to tomorrow.

  const emptyDate = new Date(overviewData.value.rawDate)
  const reminderDate = new Date(emptyDate)
  reminderDate.setDate(reminderDate.getDate() - yellowLimit.value)

  const now = new Date()
  if (reminderDate < now) {
    // If reminder would be in the past, set it to tomorrow 9:00 AM
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    return tomorrow
  }

  return reminderDate
})

const calendarDateFormatted = computed(() => {
  if (!calendarDate.value) return ''
  const options = { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' }
  return calendarDate.value.toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US', options)
})
</script>

<template>
  <div v-if="items.length > 0">
    <v-card
      v-if="overviewData"
      class="mb-4"
      :color="overviewData.status || 'success'"
      variant="tonal"
      density="compact"
    >
      <v-card-text class="d-flex align-center justify-space-between py-1 pr-1">
        <div class="text-center font-weight-bold flex-grow-1 text-body-1">
          {{ overviewData.isCritical ? t('app.overviewTextCritical', { date: overviewData.date, days: overviewData.days }) : t('app.overviewText', { date: overviewData.date }) }}
        </div>
        <v-btn
          icon="mdi-calendar-plus"
          variant="text"
          density="compact"
          @click="calendarDialog = true"
        ></v-btn>
      </v-card-text>
    </v-card>

    <MedCard
      v-for="item in sortedItems"
      :key="item.originalIndex"
      :item="item"
      :deduction="deductions[item.name]"
      @edit="emit('edit', item.originalIndex)"
      @delete="emit('delete', item.originalIndex)"
    />

    <CalendarDialog
      v-if="overviewData"
      v-model="calendarDialog"
      :date="calendarDateFormatted"
      :raw-date="calendarDate"
    />
  </div>
  <div v-else class="text-center mt-10 text-grey">
    {{ t('app.noMeds') }}
  </div>
</template>

<style scoped>
</style>