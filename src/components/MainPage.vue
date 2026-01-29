<script setup>
import { ref, onMounted, watch } from 'vue'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { checkAndUpdateDailyDose } from '../utils/medUtils'
import MedDialog from './MedDialog.vue'
import NavDrawer from './NavDrawer.vue'
import MedList from './MedList.vue'
import WelcomeDialog from './WelcomeDialog.vue'

const theme = useTheme()
const { t } = useI18n()
const drawer = ref(false)
const dialog = ref(false)
const editDialog = ref(false)
const welcomeDialog = ref(false)
const items = ref([])
const editingIndex = ref(-1)
const currentEditMed = ref({})

// Load items from localStorage on mount
onMounted(() => {
  const savedItemsJson = localStorage.getItem('myMedsItems')
  if (savedItemsJson) {
    let savedItems = JSON.parse(savedItemsJson)
    const lastUpdate = localStorage.getItem('lastDoseUpdate')
    
    // Check for daily updates
    const result = checkAndUpdateDailyDose(savedItems, lastUpdate)
    
    if (result.updated) {
      localStorage.setItem('lastDoseUpdate', result.newDate)
    }
    
    items.value = result.updatedItems
  } else {
    // Initialize last update date if no items exist yet
    localStorage.setItem('lastDoseUpdate', new Date().toDateString())
  }

  // Load theme preference
  const savedTheme = localStorage.getItem('myMedsTheme')
  if (savedTheme) {
    theme.global.name.value = savedTheme
  }

  // Check for first run after installation
  checkFirstRun()
})

const checkFirstRun = () => {
  // Check if running in standalone mode (installed PWA)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone || 
                       document.referrer.includes('android-app://');

  if (isStandalone) {
    const hasRunBefore = localStorage.getItem('pwa_first_run_completed')
    if (!hasRunBefore) {
      welcomeDialog.value = true
      localStorage.setItem('pwa_first_run_completed', 'true')
    }
  }
}

// Watch for changes in items and save to localStorage
watch(items, (newItems) => {
  localStorage.setItem('myMedsItems', JSON.stringify(newItems))
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
</script>

<template>
  <NavDrawer v-model="drawer" />

  <v-app-bar color="primary" density="compact">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </template>
    <v-app-bar-title>{{ t('app.title') }}</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-container>
      <MedList
        :items="items"
        @edit="openEditDialog"
        @delete="deleteItem"
      />
    </v-container>
  </v-main>

  <v-btn
    icon="mdi-plus"
    color="secondary"
    position="fixed"
    location="bottom right"
    class="mb-4 mr-4"
    style="bottom: 16px; right: 16px; z-index: 1000;"
    @click="openDialog"
  ></v-btn>

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
</template>

<style scoped>
</style>