<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DoseInput from './DoseInput.vue'

const props = defineProps({
  modelValue: Boolean,
  med: {
    type: Object,
    default: () => ({ name: '', ingredient: '', count: '', packageSize: '', dose: '', color: '' })
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
const { t } = useI18n()

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

const setPackageSize = (size) => {
  localMed.value.packageSize = size
}

const addPackageSize = (size) => {
  const currentCount = parseFloat(localMed.value.count) || 0
  localMed.value.count = currentCount + size
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" max-width="500px">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="localMed.name"
          :label="t('med.name')"
          variant="underlined"
          autofocus
        ></v-text-field>
        <v-text-field
          v-model="localMed.ingredient"
          :label="t('med.ingredient')"
          variant="underlined"
        ></v-text-field>

        <v-text-field
          v-model="localMed.packageSize"
          :label="t('med.packageSize')"
          variant="underlined"
          type="number"
        ></v-text-field>

        <div class="d-flex gap-2 mb-4">
          <v-btn size="small" variant="tonal" @click="setPackageSize(20)">20</v-btn>
          <v-btn size="small" variant="tonal" @click="setPackageSize(50)">50</v-btn>
          <v-btn size="small" variant="tonal" @click="setPackageSize(100)">100</v-btn>
          <v-btn size="small" variant="tonal" @click="setPackageSize(200)">200</v-btn>
        </div>

        <v-text-field
          v-model="localMed.count"
          :label="t('med.count')"
          variant="underlined"
          type="number"
        ></v-text-field>

        <div class="d-flex gap-2 mb-4">
          <v-btn size="small" variant="tonal" @click="addPackageSize(20)">+20</v-btn>
          <v-btn size="small" variant="tonal" @click="addPackageSize(50)">+50</v-btn>
          <v-btn size="small" variant="tonal" @click="addPackageSize(100)">+100</v-btn>
          <v-btn size="small" variant="tonal" @click="addPackageSize(200)">+200</v-btn>
        </div>

        <DoseInput v-model="localMed.dose" :label="t('med.dose')" />

        <div class="text-subtitle-2 mb-2 mt-4">{{ t('med.color') }}</div>
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
        <v-btn color="primary" text @click="close">{{ t('dialog.cancel') }}</v-btn>
        <v-btn color="primary" text @click="save">{{ confirmText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>