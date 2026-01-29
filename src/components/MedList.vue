<script setup>
import MedCard from './MedCard.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div v-if="items.length > 0">
    <MedCard
      v-for="(item, index) in items"
      :key="index"
      :item="item"
      @edit="emit('edit', index)"
      @delete="emit('delete', index)"
    />
  </div>
  <div v-else class="text-center mt-10 text-grey">
    No meds added yet
  </div>
</template>

<style scoped>
</style>