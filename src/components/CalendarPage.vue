<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import EntryTypeDialog from './EntryTypeDialog.vue'
import CalendarEntryDialog from './CalendarEntryDialog.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { createDetailedCalendarEvent } from '../utils/calendarUtils'

const { t, locale } = useI18n()
const entries = ref([])
const typeDialog = ref(false)
const entryDialog = ref(false)
const exportDialog = ref(false)
const currentEntry = ref({})
const editingIndex = ref(-1)
const expandedIndex = ref(-1)
const lastAddedEntry = ref(null)

// Load entries from localStorage
onMounted(() => {
  const savedEntries = localStorage.getItem('myMedsCalendarEntries')
  if (savedEntries) {
    entries.value = JSON.parse(savedEntries)
  }

  // Scroll to today separator after render
  nextTick(() => {
    const todayEl = document.getElementById('separator-today')
    if (todayEl) {
      todayEl.scrollIntoView({ behavior: 'auto', block: 'center' })
    }
  })
})

// Save entries to localStorage
watch(entries, (newVal) => {
  localStorage.setItem('myMedsCalendarEntries', JSON.stringify(newVal))
}, { deep: true })

const sortedEntries = computed(() => {
  // Sort by date descending (newest first)
  return [...entries.value].map((item, index) => ({ ...item, originalIndex: index }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

const groupedEntries = computed(() => {
  const today = new Date().toISOString().split('T')[0]

  // Better approach:
  // 1. Take real entries.
  // 2. Generate quarter entries for the range covered by real entries (plus maybe current quarter).
  // 3. Merge and sort.
  
  const combined = [...sortedEntries.value]
  
  if (combined.length > 0) {
    const minDate = new Date(combined[combined.length - 1].date)
    const maxDate = new Date(combined[0].date)
    
    // Extend maxDate to today to ensure current quarter is included
    const now = new Date()
    if (now > maxDate) maxDate.setTime(now.getTime())
      
    let current = new Date(minDate.getFullYear(), Math.floor(minDate.getMonth() / 3) * 3, 1)
    
    while (current <= maxDate) {
      const qDate = new Date(current)
      const qStr = qDate.toISOString().split('T')[0]
      
      // Check if we already have a quarter entry for this date (unlikely for user entries, but possible)
      // We add a virtual entry
      const q = Math.floor((qDate.getMonth() + 3) / 3)
      const y = qDate.getFullYear()
      
      combined.push({
        date: qStr,
        title: t('calendar.quarter', { q, year: y }),
        type: 'quarter',
        isVirtual: true
      })
      
      // Next quarter
      current.setMonth(current.getMonth() + 3)
    }
  }
  
  // Re-sort combined list
  combined.sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date)
    if (dateDiff !== 0) return dateDiff
    return 0
  })
  
  // Now build the final list with Today separator
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

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const options = { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' }
  return date.toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US', options)
}

const getEntryTypeLabel = (type) => {
  return t(`calendar.types.${type}`)
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
    // Calculate difference in days (inclusive)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    
    return `${dateStr} - ${formatDate(entry.endDate)} (${diffDays} ${t('app.showDays')})`
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
    treatments: '' // Initialize treatments as string
  }
  editingIndex.value = -1
  entryDialog.value = true
}

const addEntry = (entry) => {
  entries.value.push(entry)

  // Check if entry is in the future
  const today = new Date().toISOString().split('T')[0]
  if (entry.date >= today) {
    lastAddedEntry.value = entry
    exportDialog.value = true
  }
}

const openEditDialog = (entry) => {
  currentEntry.value = { ...entry }
  // Ensure treatments is string for older entries
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
  if (expandedIndex.value === index) {
    expandedIndex.value = -1
  } else {
    expandedIndex.value = index
    nextTick(() => {
      const el = document.getElementById(`entry-${index}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }
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

// Collect all unique treatments from existing entries for suggestions
const existingTreatments = computed(() => {
  const treatments = new Set()
  const regex = /#([^#]+)#/g

  entries.value.forEach(entry => {
    // Check if treatments is a string (new format)
    if (typeof entry.treatments === 'string') {
      let match
      while ((match = regex.exec(entry.treatments)) !== null) {
        treatments.add(match[1]) // Add the captured group (without #)
      }
    }
    // Fallback for old array format (if any exist)
    else if (Array.isArray(entry.treatments)) {
      entry.treatments.forEach(t => treatments.add(t))
    }
  })
  return Array.from(treatments).sort()
})

// Helper to parse treatment text into segments (text and tags)
const parseTreatmentText = (text) => {
  if (!text) return []
  const segments = []
  const regex = /#([^#]+)#/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before tag
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.substring(lastIndex, match.index) })
    }
    // Add tag
    segments.push({ type: 'tag', content: match[1] })
    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.substring(lastIndex) })
  }

  return segments
}
</script>

<template>
  <v-container>
    <div v-if="entries.length > 0">
      <template v-for="(item, i) in groupedEntries" :key="i">
        <!-- Today Separator -->
        <div v-if="item.type === 'separator-today'" id="separator-today">
          <v-card
            class="mb-4 bg-primary-lighten-5 text-center py-1"
            variant="tonal"
            density="compact"
          >
            <span class="text-body-1 font-weight-bold">
              {{ t('calendar.today') }}, {{ formatDate(item.date) }}
            </span>
          </v-card>

          <!-- Add Button Card (moved here) -->
          <v-card
            class="mb-4 border-dashed"
            variant="outlined"
            color="grey"
            @click="openTypeDialog"
            style="border-style: dashed !important; border-width: 2px;"
          >
            <v-card-text class="d-flex align-center justify-center py-4">
              <v-icon start size="large">mdi-plus</v-icon>
              <span class="text-h6">{{ t('calendar.add') }}</span>
            </v-card-text>
          </v-card>
        </div>

        <!-- Quarter Marker -->
        <div 
          v-else-if="item.type === 'quarter'" 
          class="d-flex align-center justify-center mb-4 text-grey"
        >
          <v-divider class="flex-grow-1"></v-divider>
          <span class="mx-4 text-body-1 font-weight-bold">{{ item.data.title }}</span>
          <v-divider class="flex-grow-1"></v-divider>
        </div>

        <!-- Entry Card -->
        <v-card
          v-else
          :id="`entry-${item.data.originalIndex}`"
          class="mb-4"
          variant="elevated"
          @click="toggleExpand(item.data.originalIndex)"
        >
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar :color="getEntryColor(item.data.type)" class="mr-2">
                <span class="text-h6 text-white">
                  <v-icon color="white">{{ getEntryIcon(item.data.type) }}</v-icon>
                </span>
              </v-avatar>
            </template>
            
            <v-card-title class="text-wrap" style="line-height: 1.2;">
              <div class="text-h6 font-weight-bold mb-1">{{ item.data.title }}</div>
              <div class="text-body-2 text-grey">{{ getEntrySubtitle(item.data) }}</div>
            </v-card-title>
          </v-card-item>

          <v-expand-transition>
            <div v-if="expandedIndex === item.data.originalIndex">
              <v-divider></v-divider>
              <v-card-text class="text-body-1">
                <!-- Doctor Details -->
                <template v-if="item.data.type === 'doctor'">
                  <div v-if="item.data.doctor" class="mb-2">
                    <span class="text-grey">{{ t('calendar.fields.doctor') }}:</span>
                    <div class="font-weight-medium">{{ item.data.doctor }}</div>
                  </div>
                  <div v-if="item.data.doctorType" class="mb-2">
                    <span class="text-grey">{{ t('calendar.fields.type') }}:</span>
                    <div class="font-weight-medium">{{ t(`calendar.doctorTypes.${item.data.doctorType}`) }}</div>
                  </div>
                  <div v-if="item.data.location" class="mb-2">
                    <span class="text-grey">{{ t('calendar.fields.location') }}:</span>
                    <div class="font-weight-medium">{{ item.data.location }}</div>
                  </div>
                  
                  <!-- Treatments (Mixed Content) -->
                  <div v-if="item.data.treatments" class="mb-2">
                    <span class="text-grey">{{ t('calendar.fields.treatments') }}:</span>
                    <div class="mt-1">
                      <template v-for="(segment, idx) in parseTreatmentText(item.data.treatments)" :key="idx">
                        <span v-if="segment.type === 'text'">{{ segment.content }}</span>
                        <v-chip
                          v-else
                          size="small"
                          color="primary"
                          variant="tonal"
                          class="mx-1"
                        >
                          {{ segment.content }}
                        </v-chip>
                      </template>
                    </div>
                  </div>
                </template>

                <!-- Vaccination Details -->
                <template v-if="item.data.type === 'vaccination'">
                  <div v-if="item.data.agent" class="mb-2">
                    <span class="text-grey">{{ t('calendar.fields.agent') }}:</span>
                    <div class="font-weight-medium">{{ item.data.agent }}</div>
                  </div>
                  <div v-if="item.data.method" class="mb-2">
                    <span class="text-grey">{{ t('calendar.fields.method') }}:</span>
                    <div class="font-weight-medium">{{ t(`calendar.methods.${item.data.method}`) }}</div>
                  </div>
                  <div v-if="item.data.bodyPart" class="mb-2">
                    <span class="text-grey">{{ t('calendar.fields.bodyPart') }}:</span>
                    <div class="font-weight-medium">{{ item.data.bodyPart }}</div>
                  </div>
                </template>

                <!-- Illness Details -->
                <template v-if="item.data.type === 'illness'">
                  <div v-if="item.data.pathogen" class="mb-2">
                    <span class="text-grey">{{ t('calendar.fields.pathogen') }}:</span>
                    <div class="font-weight-medium">{{ item.data.pathogen }}</div>
                  </div>
                  <div v-if="item.data.symptoms" class="mb-2">
                    <span class="text-grey">{{ t('calendar.fields.symptoms') }}:</span>
                    <div class="font-weight-medium">{{ item.data.symptoms }}</div>
                  </div>
                  <div v-if="item.data.endDate" class="mb-2">
                    <span class="text-grey">{{ t('calendar.fields.endDate') }}:</span>
                    <div class="font-weight-medium">{{ formatDate(item.data.endDate) }}</div>
                  </div>
                </template>

                <!-- Note Details -->
                <template v-if="item.data.type === 'note'">
                   <div v-if="item.data.endDate" class="mb-2">
                    <span class="text-grey">{{ t('calendar.fields.endDate') }}:</span>
                    <div class="font-weight-medium">{{ formatDate(item.data.endDate) }}</div>
                  </div>
                </template>

                <!-- Common Notes -->
                <div v-if="item.data.notes" class="mb-4">
                  <span class="text-grey">{{ t('calendar.fields.notes') }}:</span>
                  <div class="text-body-2 mt-1" style="white-space: pre-wrap;">{{ item.data.notes }}</div>
                </div>

                <div class="d-flex justify-end gap-2 mt-4">
                  <v-btn
                    icon="mdi-calendar-export"
                    variant="text"
                    color="primary"
                    :aria-label="t('calendar.export')"
                    @click.stop="exportToCalendar(item.data)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    color="primary"
                    :aria-label="t('dialog.edit')"
                    @click.stop="openEditDialog(item.data)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    color="error"
                    :aria-label="t('dialog.delete')"
                    @click.stop="deleteEntry(item.data.originalIndex)"
                  ></v-btn>
                </div>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </template>
    </div>
    <div v-else class="text-center mt-10 text-grey">
      {{ t('calendar.noEntries') }}

      <!-- Add Button Card (when no entries) -->
      <v-card
        class="mt-4 border-dashed"
        variant="outlined"
        color="grey"
        @click="openTypeDialog"
        style="border-style: dashed !important; border-width: 2px;"
      >
        <v-card-text class="d-flex align-center justify-center py-4">
          <v-icon start size="large">mdi-plus</v-icon>
          <span class="text-h6">{{ t('calendar.add') }}</span>
        </v-card-text>
      </v-card>
    </div>

    <!-- Type Selection Dialog -->
    <EntryTypeDialog
      v-model="typeDialog"
      @select="onTypeSelected"
    />

    <!-- Entry Edit Dialog -->
    <CalendarEntryDialog
      v-model="entryDialog"
      :entry="currentEntry"
      :suggestions="existingTreatments"
      :title="editingIndex > -1 ? t('calendar.edit') : t('calendar.add')"
      :confirm-text="t('dialog.save')"
      @confirm="saveEntry"
    />

    <!-- Export Confirmation Dialog -->
    <ConfirmDialog
      v-model="exportDialog"
      :title="t('calendar.export')"
      :message="t('calendar.exportConfirm')"
      :confirm-text="t('dialog.yes')"
      :cancel-text="t('dialog.no')"
      @confirm="confirmExport"
    />
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