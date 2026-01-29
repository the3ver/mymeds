<script setup>
import { useI18n } from 'vue-i18n'
import MedCard from './MedCard.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])
const { t } = useI18n()
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
    {{ t('app.noMeds') }}
  </div>
</template>

<style scoped>
</style>