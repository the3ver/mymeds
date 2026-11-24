<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Daily Dose'
  }
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const morning = ref('');
const noon = ref('');
const evening = ref('');
const night = ref('');

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      morning.value = '';
      noon.value = '';
      evening.value = '';
      night.value = '';
      return;
    }

    if (val.includes('-')) {
      const parts = val.split('-').map((p) => p.trim());
      morning.value = parts[0] || '0';
      noon.value = parts[1] || '0';
      evening.value = parts[2] || '0';
      night.value = parts[3] || '';
    } else {
      morning.value = val;
      noon.value = '0';
      evening.value = '0';
      night.value = '';
    }
  },
  { immediate: true }
);

const updateModel = () => {
  const m = morning.value || '0';
  const n = noon.value || '0';
  const e = evening.value || '0';
  const ni = night.value;

  let result = `${m}-${n}-${e}`;
  if (ni && ni !== '0' && ni !== '') {
    result += `-${ni}`;
  }

  emit('update:modelValue', result);
};

const validateInput = (val) => {
  return /^[0-9/.,]*$/.test(val);
};

const onInput = (field, val) => {
  if (!validateInput(val)) return;

  if (field === 'morning') morning.value = val;
  if (field === 'noon') noon.value = val;
  if (field === 'evening') evening.value = val;
  if (field === 'night') night.value = val;

  updateModel();
};
</script>

<template>
  <div class="dose-input-container">
    <div class="text-subtitle-2 font-weight-bold mb-2">{{ label }}</div>
    <div class="dose-grid">
      <div class="dose-slot">
        <v-text-field
          v-model="morning"
          variant="outlined"
          density="comfortable"
          placeholder="0"
          :aria-label="t('med.doseMorning')"
          hide-details
          class="centered-input"
          @update:model-value="(v) => onInput('morning', v)"
        ></v-text-field>
        <div class="text-caption text-medium-emphasis text-center dose-slot-label">{{ t('med.slotMorning') }}</div>
      </div>

      <div class="dose-slot">
        <v-text-field
          v-model="noon"
          variant="outlined"
          density="comfortable"
          placeholder="0"
          :aria-label="t('med.doseNoon')"
          hide-details
          class="centered-input"
          @update:model-value="(v) => onInput('noon', v)"
        ></v-text-field>
        <div class="text-caption text-medium-emphasis text-center dose-slot-label">{{ t('med.slotNoon') }}</div>
      </div>

      <div class="dose-slot">
        <v-text-field
          v-model="evening"
          variant="outlined"
          density="comfortable"
          placeholder="0"
          :aria-label="t('med.doseEvening')"
          hide-details
          class="centered-input"
          @update:model-value="(v) => onInput('evening', v)"
        ></v-text-field>
        <div class="text-caption text-medium-emphasis text-center dose-slot-label">{{ t('med.slotEvening') }}</div>
      </div>

      <div class="dose-slot">
        <v-text-field
          v-model="night"
          variant="outlined"
          density="comfortable"
          placeholder="0"
          :aria-label="t('med.doseNight')"
          hide-details
          class="centered-input"
          @update:model-value="(v) => onInput('night', v)"
        ></v-text-field>
        <div class="text-caption text-medium-emphasis text-center dose-slot-label">{{ t('med.slotNight') }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dose-input-container {
  margin-bottom: 16px;
}
.dose-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.dose-slot {
  min-width: 0;
}
.dose-slot-label {
  font-size: 0.8125rem !important;
  line-height: 1.25;
  margin-top: 4px;
}
:deep(.centered-input input) {
  text-align: center;
  font-weight: 600;
}
</style>
