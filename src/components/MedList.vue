<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import MedCard from './MedCard.vue'
import { parseDose } from '../utils/medUtils'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])
const { t } = useI18n()

const sortMode = ref('added')

const updateSortMode = () => {
  const savedSort = localStorage.getItem('myMedsSortMode')
  if (savedSort) {
    sortMode.value = savedSort
  }
}

onMounted(() => {
  updateSortMode()
  window.addEventListener('storage-sort-mode-changed', updateSortMode)
})

onUnmounted(() => {
  window.removeEventListener('storage-sort-mode-changed', updateSortMode)
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
</script>

<template>
  <div v-if="items.length > 0">
    <MedCard
      v-for="item in sortedItems"
      :key="item.originalIndex"
      :item="item"
      @edit="emit('edit', item.originalIndex)"
      @delete="emit('delete', item.originalIndex)"
    />
  </div>
  <div v-else class="text-center mt-10 text-grey">
    {{ t('app.noMeds') }}
  </div>
</template>

<style scoped>
</style>