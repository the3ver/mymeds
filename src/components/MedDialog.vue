<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  med: {
    type: Object,
    default: () => ({ name: '', count: '', dose: '', color: '' })
  },
  title: {
    type: String,
    default: 'Medication'
  },
  confirmText: {
    type: String,
    default: 'Save'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const localMed = ref({ ...props.med })

// A palette of 10 fitting colors
const colors = [
  'red', 'pink', 'purple', 'indigo', 'blue',
  'cyan', 'teal', 'green', 'orange', 'blue-grey'
]

// Watch for dialog opening to reset/set values
watch(() => props.modelValue, (val) => {
  if (val) {
    localMed.value = { ...props.med }
    // Set default color if none exists
    if (!localMed.value.color) {
      localMed.value.color = colors[0]
    }
  }
})

const close = () => {
  emit('update:modelValue', false)
}

const save = () => {
  if (localMed.value.name && localMed.value.count && localMed.value.dose) {
    emit('confirm', localMed.value)
    close()
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" max-width="500px">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="localMed.name"
          label="Name"
          variant="underlined"
          autofocus
        ></v-text-field>
        <v-text-field
          v-model="localMed.count"
          label="Pill Count"
          variant="underlined"
          type="number"
        ></v-text-field>
        <v-text-field
          v-model="localMed.dose"
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
            @click="localMed.color = color"
          >
            <v-icon v-if="localMed.color === color" color="white">mdi-check</v-icon>
            <span v-else></span>
          </v-btn>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="close">Cancel</v-btn>
        <v-btn color="primary" text @click="save">{{ confirmText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>