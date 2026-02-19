<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Daily Dose'
  }
})

const emit = defineEmits(['update:modelValue'])

// Internal state for the 4 slots: Morning, Noon, Evening, Night
const morning = ref('')
const noon = ref('')
const evening = ref('')
const night = ref('')

// Parse the initial modelValue into the 4 slots
watch(() => props.modelValue, (val) => {
  if (!val) {
    morning.value = ''
    noon.value = ''
    evening.value = ''
    night.value = ''
    return
  }

  // Check if it matches the pattern X-X-X or X-X-X-X
  if (val.includes('-')) {
    const parts = val.split('-').map(p => p.trim())
    morning.value = parts[0] || '0'
    noon.value = parts[1] || '0'
    evening.value = parts[2] || '0'
    night.value = parts[3] || ''
  } else {
    // If it's just a single number, put it in morning or treat as custom?
    // For backward compatibility, if it's a single number, we might just leave it
    // But this component enforces the pattern.
    // Let's assume if it's not a pattern, we try to parse it as morning dose or reset.
    // Actually, let's try to be smart: if it's a single number, maybe user just entered "1".
    // We can set morning=1 and others 0.
    morning.value = val
    noon.value = '0'
    evening.value = '0'
    night.value = ''
  }
}, { immediate: true })

// Reconstruct the string whenever any input changes
const updateModel = () => {
  const m = morning.value || '0'
  const n = noon.value || '0'
  const e = evening.value || '0'
  const ni = night.value

  let result = `${m}-${n}-${e}`
  if (ni && ni !== '0' && ni !== '') {
    result += `-${ni}`
  }

  emit('update:modelValue', result)
}

// Helper to validate input (allow numbers, fractions, decimals)
const validateInput = (val) => {
  // Allow empty, numbers, /, , .
  return /^[0-9/.,]*$/.test(val)
}

const onInput = (field, val) => {
  if (!validateInput(val)) return

  if (field === 'morning') morning.value = val
  if (field === 'noon') noon.value = val
  if (field === 'evening') evening.value = val
  if (field === 'night') night.value = val

  updateModel()
}
</script>

<template>
  <div class="dose-input-container">
    <div class="text-caption text-grey mb-1">{{ label }}</div>
    <div class="d-flex align-center gap-2">
      <v-text-field
        v-model="morning"
        variant="underlined"
        density="compact"
        placeholder="0"
        hide-details
        class="centered-input"
        @update:model-value="v => onInput('morning', v)"
      ></v-text-field>
      <span class="separator">-</span>
      <v-text-field
        v-model="noon"
        variant="underlined"
        density="compact"
        placeholder="0"
        hide-details
        class="centered-input"
        @update:model-value="v => onInput('noon', v)"
      ></v-text-field>
      <span class="separator">-</span>
      <v-text-field
        v-model="evening"
        variant="underlined"
        density="compact"
        placeholder="0"
        hide-details
        class="centered-input"
        @update:model-value="v => onInput('evening', v)"
      ></v-text-field>
      <span class="separator text-grey">-</span>
      <v-text-field
        v-model="night"
        variant="underlined"
        density="compact"
        placeholder="N"
        hide-details
        class="centered-input"
        @update:model-value="v => onInput('night', v)"
      ></v-text-field>
    </div>
  </div>
</template>

<style scoped>
.dose-input-container {
  margin-bottom: 16px;
}
.gap-2 {
  gap: 8px;
}
.separator {
  font-weight: bold;
  padding-bottom: 8px; /* Align with text baseline */
}
:deep(.centered-input input) {
  text-align: center;
}
</style>