<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import AppointmentDialog from './AppointmentDialog.vue'

const { t, locale } = useI18n()
const appointments = ref([])
const dialog = ref(false)
const editDialog = ref(false)
const currentEditAppointment = ref({})
const editingIndex = ref(-1)
const expandedIndex = ref(-1)

// Load appointments from localStorage
onMounted(() => {
  const savedAppointments = localStorage.getItem('myMedsAppointments')
  if (savedAppointments) {
    appointments.value = JSON.parse(savedAppointments)
  }
})

// Save appointments to localStorage
watch(appointments, (newVal) => {
  localStorage.setItem('myMedsAppointments', JSON.stringify(newVal))
}, { deep: true })

const sortedAppointments = computed(() => {
  // Sort by date descending (newest first)
  return [...appointments.value].map((item, index) => ({ ...item, originalIndex: index }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

const groupedAppointments = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const future = []
  const past = []
  
  sortedAppointments.value.forEach(app => {
    if (app.date >= today) {
      future.push(app)
    } else {
      past.push(app)
    }
  })
  
  const result = []
  let separatorInserted = false
  
  for (const app of sortedAppointments.value) {
    if (!separatorInserted && app.date < today) {
      result.push({ type: 'separator', date: today })
      separatorInserted = true
    }
    result.push({ type: 'appointment', data: app })
  }
  
  if (!separatorInserted) {
    result.push({ type: 'separator', date: today })
  }
  
  return result
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const options = { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' }
  return date.toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US', options)
}

const getDoctorTypeLabel = (type) => {
  if (!type) return ''
  return t(`appointments.types.${type}`)
}

const openDialog = () => {
  dialog.value = true
}

const addAppointment = (app) => {
  appointments.value.push(app)
}

const openEditDialog = (app) => {
  currentEditAppointment.value = { ...app }
  editingIndex.value = app.originalIndex
  editDialog.value = true
}

const saveEdit = (app) => {
  if (editingIndex.value > -1) {
    appointments.value[editingIndex.value] = app
    editingIndex.value = -1
  }
}

const deleteAppointment = (index) => {
  appointments.value.splice(index, 1)
  expandedIndex.value = -1
}

const toggleExpand = (index) => {
  if (expandedIndex.value === index) {
    expandedIndex.value = -1
  } else {
    expandedIndex.value = index
    // Scroll to top
    nextTick(() => {
      const el = document.getElementById(`appointment-${index}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }
}
</script>

<template>
  <v-container>
    <div v-if="appointments.length > 0">
      <template v-for="(item, i) in groupedAppointments" :key="i">
        <!-- Separator -->
        <v-card 
          v-if="item.type === 'separator'" 
          class="mb-4 bg-primary-lighten-5 text-center py-1" 
          variant="tonal" 
          density="compact"
        >
          <span class="text-caption font-weight-bold">
            {{ t('appointments.today') }}, {{ formatDate(item.date) }}
          </span>
        </v-card>

        <!-- Appointment Card -->
        <v-card
          v-else
          :id="`appointment-${item.data.originalIndex}`"
          class="mb-4"
          variant="elevated"
          @click="toggleExpand(item.data.originalIndex)"
        >
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="secondary" class="mr-2">
                <span class="text-h6 text-white">
                  <v-icon color="white">mdi-calendar-check</v-icon>
                </span>
              </v-avatar>
            </template>
            
            <v-card-title class="text-wrap" style="line-height: 1.2;">
              <div class="text-h6 font-weight-bold mb-1">{{ item.data.title }}</div>
              <div class="text-body-2 text-grey">{{ formatDate(item.data.date) }}</div>
            </v-card-title>
          </v-card-item>

          <v-expand-transition>
            <div v-if="expandedIndex === item.data.originalIndex">
              <v-divider></v-divider>
              <v-card-text class="text-body-1">
                <div v-if="item.data.doctor" class="mb-2">
                  <span class="text-grey">{{ t('appointments.doctor') }}:</span>
                  <div class="font-weight-medium">{{ item.data.doctor }}</div>
                </div>
                
                <div v-if="item.data.type" class="mb-2">
                  <span class="text-grey">{{ t('appointments.type') }}:</span>
                  <div class="font-weight-medium">{{ getDoctorTypeLabel(item.data.type) }}</div>
                </div>
                
                <div v-if="item.data.location" class="mb-2">
                  <span class="text-grey">{{ t('appointments.location') }}:</span>
                  <div class="font-weight-medium">{{ item.data.location }}</div>
                </div>
                
                <div v-if="item.data.notes" class="mb-4">
                  <span class="text-grey">{{ t('appointments.notes') }}:</span>
                  <div class="text-body-2 mt-1" style="white-space: pre-wrap;">{{ item.data.notes }}</div>
                </div>

                <div class="d-flex justify-end gap-2 mt-4">
                  <v-btn
                    variant="text"
                    color="primary"
                    prepend-icon="mdi-pencil"
                    @click.stop="openEditDialog(item.data)"
                  >
                    {{ t('dialog.edit') }}
                  </v-btn>
                  <v-btn
                    variant="text"
                    color="error"
                    prepend-icon="mdi-delete"
                    @click.stop="deleteAppointment(item.data.originalIndex)"
                  >
                    {{ t('dialog.delete') }}
                  </v-btn>
                </div>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </template>
    </div>
    <div v-else class="text-center mt-10 text-grey">
      {{ t('appointments.noAppointments') }}
    </div>

    <!-- Add Button Card -->
    <v-card
      class="mb-4 border-dashed"
      variant="outlined"
      color="grey"
      @click="openDialog"
      style="border-style: dashed !important; border-width: 2px;"
    >
      <v-card-text class="d-flex align-center justify-center py-4">
        <v-icon start size="large">mdi-plus</v-icon>
        <span class="text-h6">{{ t('appointments.add') }}</span>
      </v-card-text>
    </v-card>

    <!-- Add Dialog -->
    <AppointmentDialog
      v-model="dialog"
      :title="t('appointments.add')"
      :confirm-text="t('dialog.add')"
      @confirm="addAppointment"
    />

    <!-- Edit Dialog -->
    <AppointmentDialog
      v-model="editDialog"
      :appointment="currentEditAppointment"
      :title="t('appointments.edit')"
      :confirm-text="t('dialog.save')"
      @confirm="saveEdit"
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