<script setup>
import { ref, onMounted, watch } from 'vue'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { checkAndUpdateDailyDose, calculateDaysRemaining } from './modules/meds/utils/medUtils'
import * as dataService from './modules/common/utils/dataService'
import MedDialog from './modules/meds/components/MedDialog.vue'
import NavDrawer from './modules/common/components/NavDrawer.vue'
import MedList from './modules/meds/components/MedList.vue'
import WelcomeDialog from './modules/common/components/WelcomeDialog.vue'
import UpdateDialog from './modules/common/components/UpdateDialog.vue'
import CalendarPage from './modules/calendar/components/CalendarPage.vue'
import packageJson from '../package.json'

const theme = useTheme()
const { t } = useI18n()
const drawer = ref(false)
const dialog = ref(false)
const editDialog = ref(false)
const welcomeDialog = ref(false)
const updateDialog = ref(false)
const items = ref([])
const editingIndex = ref(-1)
const currentEditMed = ref({})
const snackbar = ref(false)
const snackbarText = ref('')
const activeTab = ref('meds') // 'meds' or 'calendar'
const deductions = ref({}) // Stores deductions for display
const calendarPageRef = ref(null)

// Load items from dataService on mount
onMounted(async () => {
  let savedItems = await dataService.getMeds()
  const lastUpdate = await dataService.getLastDoseUpdate()

  if (savedItems.length > 0) {
    // Check for daily updates
    const result = checkAndUpdateDailyDose(savedItems, lastUpdate)

    if (result.updated) {
      await dataService.setLastDoseUpdate(result.newDate)
      // Store deductions to show in UI
      if (result.deductions) {
        deductions.value = result.deductions
      }
    }
    items.value = result.updatedItems
  } else {
    // Initialize last update date if no items exist yet
    await dataService.setLastDoseUpdate(new Date().toDateString())
  }

  // Load theme preference
  const settings = await dataService.getSettings()
  theme.global.name.value = settings.theme

  // Check for warnings
  checkWarnings(items.value)

  // Check for first run after installation
  await checkFirstRun()

  // Check for updates
  await checkUpdate()
})

async function checkWarnings(meds) {
  const settings = await dataService.getSettings()
  const warningLimit = Math.max(settings.yellowLimit, settings.redLimit)

  let criticalMeds = []
  let minDays = Infinity

  for (const med of meds) {
    const days = calculateDaysRemaining(med)
    if (days !== null && days <= warningLimit) {
      if (days < minDays) {
        minDays = days
        criticalMeds = [med.name]
      } else if (days === minDays) {
        criticalMeds.push(med.name)
      }
    }
  }

  if (criticalMeds.length > 0) {
    const names = criticalMeds.join(', ')
    snackbarText.value = t('app.notification', { name: names, days: minDays })
    snackbar.value = true
  }
}

async function checkFirstRun() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone ||
                       document.referrer.includes('android-app://');

  if (isStandalone) {
    const hasRunBefore = await dataService.getFirstRunCompleted()
    if (!hasRunBefore) {
      welcomeDialog.value = true
      await dataService.setFirstRunCompleted()
    }
  }
}

async function checkUpdate() {
  const lastVersion = await dataService.getLastVersion()
  const currentVersion = packageJson.version

  if (lastVersion && lastVersion !== currentVersion) {
    updateDialog.value = true
  }

  await dataService.saveLastVersion(currentVersion)
}

// Watch for changes in items and save to dataService
watch(items, (newItems) => {
  dataService.saveMeds(newItems)
}, { deep: true })

const openDialog = () => {
  dialog.value = true
}

const addItem = (med) => {
  items.value.unshift(med)
}

const deleteItem = (index) => {
  items.value.splice(index, 1)
}

const openEditDialog = (index) => {
  editingIndex.value = index
  currentEditMed.value = { ...items.value[index] }
  editDialog.value = true
}

const saveEdit = (med) => {
  if (editingIndex.value > -1) {
    items.value[editingIndex.value] = med
    editingIndex.value = -1
  }
}

const refreshPage = () => {
  window.location.reload()
}

const openCalendarFilter = () => {
  if (calendarPageRef.value) {
    calendarPageRef.value.openFilterDialog()
  }
}
</script>

<template>
  <NavDrawer v-model="drawer" />

  <v-app-bar
    :color="theme.global.current.value.dark ? 'surface' : 'primary'"
    density="compact"
    scroll-behavior="hide"
    scroll-threshold="20"
  >
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </template>
    <v-app-bar-title>
      {{ t('app.title') }}
      <span v-if="activeTab === 'meds'" class="text-subtitle-1 ml-2 opacity-70">- {{ t('app.nav.meds') }}</span>
      <span v-else-if="activeTab === 'calendar'" class="text-subtitle-1 ml-2 opacity-70">- {{ t('app.nav.calendar') }}</span>
    </v-app-bar-title>
    <template v-slot:append>
      <v-btn
        v-if="activeTab === 'calendar'"
        icon="mdi-filter-variant"
        @click="openCalendarFilter"
      ></v-btn>
      <v-btn icon="mdi-refresh" @click="refreshPage"></v-btn>
    </template>
  </v-app-bar>

  <v-main>
    <v-container v-if="activeTab === 'meds'">
      <MedList
        :items="items"
        :deductions="deductions"
        @edit="openEditDialog"
        @delete="deleteItem"
      />

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
          <span class="text-h6">{{ t('app.addMed') }}</span>
        </v-card-text>
      </v-card>
    </v-container>

    <CalendarPage
      v-if="activeTab === 'calendar'"
      ref="calendarPageRef"
    />
  </v-main>

  <v-bottom-navigation v-model="activeTab" color="primary" grow>
    <v-btn value="meds">
      <v-icon>mdi-format-list-bulleted</v-icon>
      <span>{{ t('app.nav.meds') }}</span>
    </v-btn>

    <v-btn value="calendar">
      <v-icon>mdi-calendar-clock</v-icon>
      <span>{{ t('app.nav.calendar') }}</span>
    </v-btn>
  </v-bottom-navigation>

  <!-- Add Dialog -->
  <MedDialog
    v-model="dialog"
    :title="t('dialog.addTitle')"
    :confirm-text="t('dialog.add')"
    @confirm="addItem"
  />

  <!-- Edit Dialog -->
  <MedDialog
    v-model="editDialog"
    :med="currentEditMed"
    :title="t('dialog.editTitle')"
    :confirm-text="t('dialog.save')"
    @confirm="saveEdit"
  />

  <!-- Welcome Dialog -->
  <WelcomeDialog v-model="welcomeDialog" />

  <!-- Update Dialog -->
  <UpdateDialog v-model="updateDialog" />

  <!-- Notification Snackbar -->
  <v-snackbar
    v-model="snackbar"
    color="warning"
    timeout="5000"
  >
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn
        color="white"
        variant="text"
        @click="snackbar = false"
      >
        {{ t('about.close') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style>
/* Global style to prevent pull-to-refresh */
html, body {
  overscroll-behavior-y: contain;
}
</style>

<style scoped>
.border-dashed {
  border-style: dashed !important;
}
.opacity-70 {
  opacity: 0.7;
}
</style>