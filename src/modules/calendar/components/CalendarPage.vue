<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import EntryTypeDialog from './EntryTypeDialog.vue'
import CalendarEntryDialog from './CalendarEntryDialog.vue'
import ConfirmDialog from '../../common/components/ConfirmDialog.vue'
import FilterDialog from './FilterDialog.vue'
import { createDetailedCalendarEvent } from '../utils/calendarUtils'
import { renderMarkdownLinks } from '../../common/utils/stringUtils'

const props = defineProps({
  initialEntries: {
    type: Array,
    required: true
  }
});
const emit = defineEmits(['update:entries']);

const { t, locale } = useI18n()
const entries = ref(props.initialEntries)
const typeDialog = ref(false)
const entryDialog = ref(false)
const exportDialog = ref(false)
const filterDialog = ref(false)
const currentEntry = ref({})
const editingIndex = ref(-1)
const expandedIndex = ref(-1)
const lastAddedEntry = ref(null)
const filterTypes = ref([])

// Emit updates back to the parent
watch(entries, (newVal) => {
  emit('update:entries', newVal)
}, { deep: true })

onMounted(() => {
  // Scroll to today separator after render
  nextTick(() => {
    const todayEl = document.getElementById('separator-today')
    if (todayEl) {
      todayEl.scrollIntoView({ behavior: 'auto', block: 'center' })
    }
  })
})

const sortedEntries = computed(() => {
  // Sort by date descending (newest first)
  let filtered = [...entries.value]

  if (filterTypes.value.length > 0) {
    filtered = filtered.filter(entry => filterTypes.value.includes(entry.type))
  }

  return filtered.map((item, index) => ({ ...item, originalIndex: index }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

const groupedEntries = computed(() => {
  const today = new Date().toISOString().split('T')[0]

  const combined = [...sortedEntries.value]

  if (combined.length > 0) {
    const minDate = new Date(combined[combined.length - 1].date)
    const maxDate = new Date(combined[0].date)

    const now = new Date()
    if (now > maxDate) maxDate.setTime(now.getTime())

    let current = new Date(minDate.getFullYear(), Math.floor(minDate.getMonth() / 3) * 3, 1)

    while (current <= maxDate) {
      const qDate = new Date(current)
      const qStr = qDate.toISOString().split('T')[0]
      const q = Math.floor((qDate.getMonth() + 3) / 3)
      const y = qDate.getFullYear()

      combined.push({
        date: qStr,
        title: t('calendar.quarter', { q, year: y }),
        type: 'quarter',
        isVirtual: true
      })
      current.setMonth(current.getMonth() + 3)
    }
  }

  combined.sort((a, b) => new Date(b.date) - new Date(a.date))

  const finalResult = []
  let todayInsertedLoop = false

  for (const entry of combined) {
    if (!todayInsertedLoop && entry.date < today) {
      finalResult.push({ type: 'separator-today', date: today })
      todayInsertedLoop = true
    }
    if (entry.isVirtual) {
      finalResult.push({ type: 'quarter', data: entry })
    } else {
      finalResult.push({ type: 'entry', data: entry })
    }
  }

  if (!todayInsertedLoop) {
    finalResult.push({ type: 'separator-today', date: today })
  }

  return finalResult
})

const formatDate = (dateStr, forceShort = false) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const currentQuarter = Math.floor(today.getMonth() / 3)
  const dateQuarter = Math.floor(date.getMonth() / 3)
  const isRecent = date.getFullYear() === today.getFullYear() && dateQuarter === currentQuarter
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
  if (isRecent && !forceShort) {
    options.weekday = 'short'
  }
  return date.toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US', options)
}

const getEntryIcon = (type) => {
  switch (type) {
    case 'doctor': return 'mdi-doctor'
    case 'vaccination': return 'mdi-needle'
    case 'illness': return 'mdi-emoticon-sick'
    case 'note': return 'mdi-note-text'
    case 'quarter': return 'mdi-calendar-range'
    default: return 'mdi-calendar'
  }
}

const getEntryColor = (type) => {
  switch (type) {
    case 'doctor': return 'primary'
    case 'vaccination': return 'teal'
    case 'illness': return 'orange'
    case 'note': return 'blue-grey'
    case 'quarter': return 'grey'
    default: return 'grey'
  }
}

const getEntrySubtitle = (entry) => {
  const dateStr = formatDate(entry.date)
  if (entry.type === 'illness' && entry.endDate) {
    const start = new Date(entry.date)
    const end = new Date(entry.endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return `${dateStr} - ${formatDate(entry.endDate, true)} (${diffDays} ${t('app.showDays')})`
  }
  return dateStr
}

const openTypeDialog = () => {
  typeDialog.value = true
}

const onTypeSelected = (type) => {
  currentEntry.value = {
    type,
    date: new Date().toISOString().split('T')[0],
    title: '',
    doctor: '', doctorType: '', location: '',
    agent: '', method: '', bodyPart: '',
    pathogen: '', symptoms: '', endDate: '',
    notes: '',
    treatments: ''
  }
  editingIndex.value = -1
  entryDialog.value = true
}

const addEntry = (entry) => {
  entries.value.push(entry)
  const today = new Date().toISOString().split('T')[0]
  if (entry.date >= today) {
    lastAddedEntry.value = entry
    exportDialog.value = true
  }
}

const openEditDialog = (entry) => {
  currentEntry.value = { ...entry }
  if (Array.isArray(currentEntry.value.treatments)) {
    currentEntry.value.treatments = currentEntry.value.treatments.join(', ')
  } else if (!currentEntry.value.treatments) {
    currentEntry.value.treatments = ''
  }
  editingIndex.value = entry.originalIndex
  entryDialog.value = true
}

const saveEntry = (entry) => {
  if (editingIndex.value > -1) {
    entries.value[editingIndex.value] = entry
    editingIndex.value = -1
  } else {
    addEntry(entry)
  }
}

const deleteEntry = (index) => {
  entries.value.splice(index, 1)
  expandedIndex.value = -1
}

const toggleExpand = (index) => {
  expandedIndex.value = expandedIndex.value === index ? -1 : index
}

const exportToCalendar = (entry) => {
  createDetailedCalendarEvent(entry)
}

const confirmExport = () => {
  if (lastAddedEntry.value) {
    exportToCalendar(lastAddedEntry.value)
    lastAddedEntry.value = null
  }
}

const clearFilter = () => {
  filterTypes.value = []
}

const filterText = computed(() => {
  if (filterTypes.value.length === 0) return ''
  const typeNames = filterTypes.value.map(type => t(`calendar.types.${type}`)).join(', ')
  return t('calendar.filterBy', { types: typeNames })
})

const existingTreatments = computed(() => {
  const treatments = new Set()
  const regex = /#([^#]+)#/g
  entries.value.forEach(entry => {
    if (typeof entry.treatments === 'string') {
      let match
      while ((match = regex.exec(entry.treatments)) !== null) {
        treatments.add(match[1])
      }
    } else if (Array.isArray(entry.treatments)) {
      entry.treatments.forEach(t => treatments.add(t))
    }
  })
  return Array.from(treatments).sort()
})

const parseTreatmentText = (text) => {
  if (!text) return []
  const segments = []
  const regex = /#([^#]+)#/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.substring(lastIndex, match.index) })
    }
    segments.push({ type: 'tag', content: match[1] })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.substring(lastIndex) })
  }
  return segments
}

const openFilterDialog = () => {
  filterDialog.value = true
}

defineExpose({
  openFilterDialog,
  openTypeDialog
})
</script>

<template>
  <v-container>
    <v-card v-if="filterTypes.length > 0" class="mb-4 bg-primary-lighten-5" variant="tonal" density="compact">
      <v-card-text class="d-flex align-center justify-space-between py-2">
        <span class="text-body-2 font-weight-bold text-truncate mr-2">{{ filterText }}</span>
        <v-btn icon="mdi-delete" variant="text" density="compact" size="small" :title="t('calendar.clearFilter')" @click="clearFilter"></v-btn>
      </v-card-text>
    </v-card>

    <div v-if="entries.length > 0">
      <template v-for="(item, i) in groupedEntries" :key="i">
        <div v-if="item.type === 'separator-today'" id="separator-today">
          <v-card class="mb-4 bg-primary-lighten-5 text-center py-1" variant="tonal" density="compact">
            <span class="text-body-1 font-weight-bold">{{ t('calendar.today') }}, {{ formatDate(item.date) }}</span>
          </v-card>
        </div>
        <div v-else-if="item.type === 'quarter'" class="d-flex align-center justify-center mb-4 text-grey">
          <v-divider class="flex-grow-1"></v-divider>
          <span class="mx-4 text-body-1 font-weight-bold">{{ item.data.title }}</span>
          <v-divider class="flex-grow-1"></v-divider>
        </div>
        <v-card v-else :id="`entry-${item.data.originalIndex}`" class="mb-4" variant="elevated" @click="toggleExpand(item.data.originalIndex)">
          <v-card-item class="py-3">
            <template v-slot:prepend>
              <v-avatar :color="getEntryColor(item.data.type)" size="36" class="mr-3">
                <v-icon color="white" size="20">{{ getEntryIcon(item.data.type) }}</v-icon>
              </v-avatar>
            </template>
            <v-card-title class="d-flex flex-wrap align-baseline" style="gap: 0.5rem; line-height: 1.2;">
              <div class="text-h6">{{ item.data.title }}</div>
              <div class="text-body-1 text-grey">{{ getEntrySubtitle(item.data) }}</div>
            </v-card-title>
          </v-card-item>
          <v-expand-transition>
            <div v-if="expandedIndex === item.data.originalIndex">
              <v-divider></v-divider>
              <v-card-text class="text-body-1">
                <template v-if="item.data.type === 'doctor'">
                  <div v-if="item.data.doctor" class="mb-2"><span class="text-grey">{{ t('calendar.fields.doctor') }}:</span><div class="font-weight-medium">{{ item.data.doctor }}</div></div>
                  <div v-if="item.data.doctorType" class="mb-2"><span class="text-grey">{{ t('calendar.fields.type') }}:</span><div class="font-weight-medium">{{ t(`calendar.doctorTypes.${item.data.doctorType}`) }}</div></div>
                  <div v-if="item.data.location" class="mb-2"><span class="text-grey">{{ t('calendar.fields.location') }}:</span><div class="font-weight-medium">{{ item.data.location }}</div></div>
                  <div v-if="item.data.treatments" class="mb-2"><span class="text-grey">{{ t('calendar.fields.treatments') }}:</span><div class="mt-1"><template v-for="(segment, idx) in parseTreatmentText(item.data.treatments)" :key="idx"><span v-if="segment.type === 'text'">{{ segment.content }}</span><v-chip v-else size="small" color="primary" variant="tonal" class="mx-1">{{ segment.content }}</v-chip></template></div></div>
                </template>
                <template v-if="item.data.type === 'vaccination'">
                  <div v-if="item.data.agent" class="mb-2"><span class="text-grey">{{ t('calendar.fields.agent') }}:</span><div class="font-weight-medium">{{ item.data.agent }}</div></div>
                  <div v-if="item.data.method" class="mb-2"><span class="text-grey">{{ t('calendar.fields.method') }}:</span><div class="font-weight-medium">{{ t(`calendar.methods.${item.data.method}`) }}</div></div>
                  <div v-if="item.data.bodyPart" class="mb-2"><span class="text-grey">{{ t('calendar.fields.bodyPart') }}:</span><div class="font-weight-medium">{{ item.data.bodyPart }}</div></div>
                </template>
                <template v-if="item.data.type === 'illness'">
                  <div v-if="item.data.pathogen" class="mb-2"><span class="text-grey">{{ t('calendar.fields.pathogen') }}:</span><div class="font-weight-medium">{{ item.data.pathogen }}</div></div>
                  <div v-if="item.data.symptoms" class="mb-2"><span class="text-grey">{{ t('calendar.fields.symptoms') }}:</span><div class="font-weight-medium">{{ item.data.symptoms }}</div></div>
                  <div v-if="item.data.endDate" class="mb-2"><span class="text-grey">{{ t('calendar.fields.endDate') }}:</span><div class="font-weight-medium">{{ formatDate(item.data.endDate, true) }}</div></div>
                </template>
                <template v-if="item.data.type === 'note'">
                   <div v-if="item.data.endDate" class="mb-2"><span class="text-grey">{{ t('calendar.fields.endDate') }}:</span><div class="font-weight-medium">{{ formatDate(item.data.endDate, true) }}</div></div>
                </template>
                <div v-if="item.data.notes" class="mb-4"><span class="text-grey">{{ t('calendar.fields.notes') }}:</span><div class="text-body-2 mt-1" v-html="renderMarkdownLinks(item.data.notes)"></div></div>
                <div class="d-flex justify-end gap-2 mt-4">
                  <v-btn icon="mdi-calendar-export" variant="text" color="primary" :aria-label="t('calendar.export')" @click.stop="exportToCalendar(item.data)"></v-btn>
                  <v-btn icon="mdi-pencil" variant="text" color="primary" :aria-label="t('dialog.edit')" @click.stop="openEditDialog(item.data)"></v-btn>
                  <v-btn icon="mdi-delete" variant="text" color="error" :aria-label="t('dialog.delete')" @click.stop="deleteEntry(item.data.originalIndex)"></v-btn>
                </div>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </template>
    </div>
    <div v-else class="text-center mt-10 text-grey">
      {{ t('calendar.noEntries') }}
    </div>

    <EntryTypeDialog v-model="typeDialog" @select="onTypeSelected" />
    <CalendarEntryDialog v-model="entryDialog" :entry="currentEntry" :suggestions="existingTreatments" :title="editingIndex > -1 ? t('calendar.edit') : t('calendar.add')" :confirm-text="t('dialog.save')" @confirm="saveEntry" />
    <ConfirmDialog v-model="exportDialog" :title="t('calendar.export')" :message="t('calendar.exportConfirm')" :confirm-text="t('dialog.yes')" :cancel-text="t('dialog.no')" @confirm="confirmExport" />
    <FilterDialog v-model="filterDialog" v-model:selected-filters="filterTypes" />
  </v-container>
</template>

<style scoped>
.border-dashed {
  border-style: dashed !important;
}
.gap-2 {
  gap: 8px;
}
.text-wrap {
  white-space: normal !important;
}
</style>
