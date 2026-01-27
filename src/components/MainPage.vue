<script setup>
import { ref, onMounted, watch } from 'vue'
import { checkAndUpdateDailyDose } from '../utils/medUtils'

const dialog = ref(false)
const editDialog = ref(false)
const newItemName = ref('')
const newItemCount = ref('')
const newItemDose = ref('')
const newItemColor = ref('')
const items = ref([])
const editingIndex = ref(-1)
const editItemName = ref('')
const editItemCount = ref('')
const editItemDose = ref('')
const editItemColor = ref('')

// A palette of 10 fitting colors
const colors = [
  'red', 'pink', 'purple', 'indigo', 'blue',
  'cyan', 'teal', 'green', 'orange', 'blue-grey'
]

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
})

// Watch for changes in items and save to localStorage
watch(items, (newItems) => {
  localStorage.setItem('myMedsItems', JSON.stringify(newItems))
}, { deep: true })

const openDialog = () => {
  newItemName.value = ''
  newItemCount.value = ''
  newItemDose.value = ''
  newItemColor.value = colors[0] // Default to first color
  dialog.value = true
}

const addItem = () => {
  if (newItemName.value && newItemCount.value && newItemDose.value) {
    items.value.unshift({
      name: newItemName.value,
      count: newItemCount.value,
      dose: newItemDose.value,
      color: newItemColor.value
    })
    dialog.value = false
  }
}

const deleteItem = (index) => {
  items.value.splice(index, 1)
}

const openEditDialog = (index) => {
  editingIndex.value = index
  editItemName.value = items.value[index].name
  editItemCount.value = items.value[index].count
  editItemDose.value = items.value[index].dose
  editItemColor.value = items.value[index].color
  editDialog.value = true
}

const saveEdit = () => {
  if (editingIndex.value > -1 && editItemName.value && editItemCount.value && editItemDose.value) {
    items.value[editingIndex.value] = {
      name: editItemName.value,
      count: editItemCount.value,
      dose: editItemDose.value,
      color: editItemColor.value
    }
    editDialog.value = false
    editingIndex.value = -1
  }
}
</script>

<template>
  <v-app-bar color="primary" density="compact">
    <v-app-bar-title>MyMeds</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-container>
      <div v-if="items.length > 0">
        <v-card
          v-for="(item, index) in items"
          :key="index"
          class="mb-4"
          variant="elevated"
        >
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar :color="item.color" class="mr-2">
                <span class="text-h6 text-white">{{ item.name.charAt(0).toUpperCase() }}</span>
              </v-avatar>
            </template>
            <v-card-title>{{ item.name }}</v-card-title>
            <v-card-subtitle>Daily Dose: {{ item.dose }}</v-card-subtitle>
            <template v-slot:append>
              <div class="d-flex align-center">
                <v-chip size="small" color="primary" variant="tonal" class="mr-2">
                  {{ item.count }}
                </v-chip>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      variant="text"
                      density="comfortable"
                      v-bind="props"
                    ></v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="openEditDialog(index)">
                      <v-list-item-title>Edit</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="deleteItem(index)">
                      <v-list-item-title class="text-red">Delete</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>
          </v-card-item>
        </v-card>
      </div>
      <div v-else class="text-center mt-10 text-grey">
        No meds added yet
      </div>
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
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title>Add New Med</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newItemName"
          label="Name"
          variant="underlined"
          autofocus
        ></v-text-field>
        <v-text-field
          v-model="newItemCount"
          label="Pill Count"
          variant="underlined"
          type="number"
        ></v-text-field>
        <v-text-field
          v-model="newItemDose"
          label="Daily Dose"
          variant="underlined"
          hint="e.g. 1, 0.5, 1/2"
          persistent-hint
        ></v-text-field>
        <div class="text-subtitle-2 mb-2 mt-4">Color</div>
        <div class="d-flex flex-wrap gap-2">
          <v-btn
            v-for="color in colors"
            :key="color"
            :color="color"
            icon="mdi-check"
            size="x-small"
            variant="flat"
            class="ma-1"
            @click="newItemColor = color"
          >
            <v-icon v-if="newItemColor === color" color="white">mdi-check</v-icon>
            <span v-else></span>
          </v-btn>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="dialog = false">Cancel</v-btn>
        <v-btn color="primary" text @click="addItem">Add</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Dialog -->
  <v-dialog v-model="editDialog" max-width="500px">
    <v-card>
      <v-card-title>Edit Med</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="editItemName"
          label="Name"
          variant="underlined"
          autofocus
        ></v-text-field>
        <v-text-field
          v-model="editItemCount"
          label="Pill Count"
          variant="underlined"
          type="number"
        ></v-text-field>
        <v-text-field
          v-model="editItemDose"
          label="Daily Dose"
          variant="underlined"
          hint="e.g. 1, 0.5, 1/2"
          persistent-hint
        ></v-text-field>
        <div class="text-subtitle-2 mb-2 mt-4">Color</div>
        <div class="d-flex flex-wrap gap-2">
          <v-btn
            v-for="color in colors"
            :key="color"
            :color="color"
            icon="mdi-check"
            size="x-small"
            variant="flat"
            class="ma-1"
            @click="editItemColor = color"
          >
            <v-icon v-if="editItemColor === color" color="white">mdi-check</v-icon>
            <span v-else></span>
          </v-btn>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="editDialog = false">Cancel</v-btn>
        <v-btn color="primary" text @click="saveEdit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>