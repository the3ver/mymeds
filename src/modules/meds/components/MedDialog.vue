<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import DoseInput from './DoseInput.vue';
import PillAvatar from './PillAvatar.vue';

const props = defineProps({
  modelValue: Boolean,
  med: {
    type: Object,
    default: () => ({
      name: '',
      ingredient: '',
      count: '',
      packageSize: '',
      dose: '',
      color: '',
      shape: 'letter',
      pillSize: 'medium'
    })
  },
  title: {
    type: String,
    default: 'Medication'
  },
  confirmText: {
    type: String,
    default: 'Save'
  }
});

const emit = defineEmits(['update:modelValue', 'confirm']);
const { t } = useI18n();

const localMed = ref({ ...props.med });
const scheduleType = ref(props.med?.schedule?.type || 'daily');
const weeklyDays = ref(
  Array.isArray(props.med?.schedule?.days) && props.med.schedule.days.length > 0 ? [...props.med.schedule.days] : ['mo']
);
const intervalDays = ref(props.med?.schedule?.intervalDays || 2);
const appearanceExpanded = ref(false);

const availableWeekdays = [
  { id: 'mo', labelKey: 'med.dayMo' },
  { id: 'di', labelKey: 'med.dayDi' },
  { id: 'mi', labelKey: 'med.dayMi' },
  { id: 'do', labelKey: 'med.dayDo' },
  { id: 'fr', labelKey: 'med.dayFr' },
  { id: 'sa', labelKey: 'med.daySa' },
  { id: 'so', labelKey: 'med.daySo' }
];

function toggleDay(dayId) {
  if (weeklyDays.value.includes(dayId)) {
    if (weeklyDays.value.length > 1) {
      weeklyDays.value = weeklyDays.value.filter((d) => d !== dayId);
    }
  } else {
    weeklyDays.value.push(dayId);
  }
}

const colors = [
  'white',
  'deep-orange',
  'orange',
  'amber',
  'red',
  'pink',
  'purple',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'green',
  'blue-grey'
];

const availableShapes = [
  { id: 'letter', labelKey: 'med.shapes.letter' },
  { id: 'round', labelKey: 'med.shapes.round' },
  { id: 'round-score', labelKey: 'med.shapes.roundScore' },
  { id: 'round-cross', labelKey: 'med.shapes.roundCross' },
  { id: 'capsule', labelKey: 'med.shapes.capsule' },
  { id: 'oblong', labelKey: 'med.shapes.oblong' },
  { id: 'oblong-score', labelKey: 'med.shapes.oblongScore' },
  { id: 'oval', labelKey: 'med.shapes.oval' },
  { id: 'heart', labelKey: 'med.shapes.heart' },
  { id: 'diamond', labelKey: 'med.shapes.diamond' },
  { id: 'triangle', labelKey: 'med.shapes.triangle' },
  { id: 'hexagon', labelKey: 'med.shapes.hexagon' },
  { id: 'square', labelKey: 'med.shapes.square' },
  { id: 'drop', labelKey: 'med.shapes.drop' },
  { id: 'syringe', labelKey: 'med.shapes.syringe' },
  { id: 'inhaler', labelKey: 'med.shapes.inhaler' },
  { id: 'tube', labelKey: 'med.shapes.tube' },
  { id: 'patch', labelKey: 'med.shapes.patch' }
];

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      localMed.value = { ...props.med };
      appearanceExpanded.value = false;
      if (props.med?.schedule) {
        scheduleType.value = props.med.schedule.type || 'daily';
        weeklyDays.value =
          Array.isArray(props.med.schedule.days) && props.med.schedule.days.length > 0
            ? [...props.med.schedule.days]
            : ['mo'];
        intervalDays.value = props.med.schedule.intervalDays || 2;
      } else {
        scheduleType.value = 'daily';
        weeklyDays.value = ['mo'];
        intervalDays.value = 2;
      }
      if (!localMed.value.color) {
        localMed.value.color = colors[0];
      }
      if (!localMed.value.shape) {
        localMed.value.shape = 'letter';
      }
      if (!localMed.value.pillSize) {
        localMed.value.pillSize = 'medium';
      }
    }
  },
  { immediate: true }
);

const close = () => {
  emit('update:modelValue', false);
};

const save = () => {
  if (localMed.value.name && localMed.value.count && localMed.value.dose) {
    if (scheduleType.value === 'weekly') {
      localMed.value.schedule = {
        type: 'weekly',
        days: weeklyDays.value
      };
    } else if (scheduleType.value === 'interval') {
      localMed.value.schedule = {
        type: 'interval',
        intervalDays: Math.max(1, parseInt(intervalDays.value, 10) || 1)
      };
    } else {
      delete localMed.value.schedule;
    }
    emit('confirm', localMed.value);
    close();
  }
};

const setPackageSize = (size) => {
  localMed.value.packageSize = size;
};

const addPackageSize = (size) => {
  const currentCount = parseFloat(localMed.value.count) || 0;
  localMed.value.count = currentCount + size;
};

defineExpose({
  scheduleType,
  weeklyDays,
  intervalDays,
  save,
  close,
  localMed,
  colors,
  availableShapes
});
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="(val) => !val && close()"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card color="background" rounded="0" class="d-flex flex-column fill-height">
      <!-- Sticky M3 Full-Screen Top App Bar -->
      <v-toolbar color="surface" elevation="0" class="m3-fullscreen-toolbar flex-grow-0">
        <v-btn icon="mdi-close" :aria-label="t('dialog.cancel')" @click="close"></v-btn>
        <v-toolbar-title class="font-weight-bold text-subtitle-1">{{ title }}</v-toolbar-title>
        <template v-slot:append>
          <v-btn
            color="primary"
            variant="flat"
            rounded="pill"
            class="mr-2 px-5 font-weight-bold"
            @click="save"
            data-testid="med-dialog-save-btn"
          >
            {{ confirmText }}
          </v-btn>
        </template>
      </v-toolbar>

      <v-card-text class="pa-0 flex-grow-1 overflow-y-auto">
        <v-container class="med-form-container pb-12">
          <v-text-field
            v-model="localMed.name"
            :label="t('med.name') + ' *'"
            variant="outlined"
            class="mb-2"
            autofocus
          ></v-text-field>
          <v-text-field
            v-model="localMed.ingredient"
            :label="t('med.ingredient')"
            variant="outlined"
            class="mb-3"
          ></v-text-field>

          <v-row dense class="mb-1">
            <v-col cols="6">
              <v-text-field
                v-model="localMed.count"
                :label="t('med.count') + ' *'"
                variant="outlined"
                type="number"
                inputmode="numeric"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="localMed.packageSize"
                :label="t('med.packageSize')"
                variant="outlined"
                type="number"
                inputmode="numeric"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>

          <div class="d-flex ga-2 mb-3 mt-2">
            <v-btn
              v-for="sz in [20, 50, 100, 200]"
              :key="'add-' + sz"
              class="flex-grow-1 quick-chip-btn"
              variant="tonal"
              color="primary"
              rounded="pill"
              @click="addPackageSize(sz)"
            >
              +{{ sz }}
            </v-btn>
          </div>

          <div class="d-flex align-center ga-2 mb-5">
            <span class="text-caption text-medium-emphasis flex-shrink-0">{{ t('med.packageSize') }}:</span>
            <v-btn
              v-for="sz in [20, 50, 100, 200]"
              :key="'pkg-' + sz"
              class="flex-grow-1 quick-chip-btn"
              variant="outlined"
              rounded="pill"
              @click="setPackageSize(sz)"
            >
              {{ sz }}
            </v-btn>
          </div>

          <DoseInput v-model="localMed.dose" :label="t('med.dose') + ' *'" />

          <div class="text-subtitle-2 font-weight-bold mb-2 mt-4">{{ t('med.schedule') }}</div>
          <v-btn-toggle
            v-model="scheduleType"
            mandatory
            divided
            color="primary"
            variant="outlined"
            class="mb-3 responsive-btn-toggle"
          >
            <v-btn value="daily">{{ t('med.scheduleDaily') }}</v-btn>
            <v-btn value="weekly">{{ t('med.scheduleWeekly') }}</v-btn>
            <v-btn value="interval">{{ t('med.scheduleInterval') }}</v-btn>
          </v-btn-toggle>

          <!-- Weekly days selector -->
          <div v-if="scheduleType === 'weekly'" class="mb-4">
            <div class="text-caption text-medium-emphasis mb-2">{{ t('med.weeklyDays') }}</div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="day in availableWeekdays"
                :key="day.id"
                :color="weeklyDays.includes(day.id) ? 'primary' : 'default'"
                :variant="weeklyDays.includes(day.id) ? 'flat' : 'outlined'"
                size="default"
                class="cursor-pointer"
                @click="toggleDay(day.id)"
              >
                {{ t(day.labelKey) }}
              </v-chip>
            </div>
          </div>

          <!-- Interval days selector -->
          <div v-if="scheduleType === 'interval'" class="mb-4">
            <v-text-field
              v-model.number="intervalDays"
              :label="t('med.intervalDaysLabel')"
              type="number"
              inputmode="numeric"
              min="1"
              max="365"
              variant="outlined"
              hide-details
            ></v-text-field>
          </div>

          <!-- Compact Collapsible Pill Appearance Card -->
          <v-card class="m3-card mt-4">
            <div
              class="d-flex align-center justify-space-between pa-4 cursor-pointer"
              @click="appearanceExpanded = !appearanceExpanded"
              data-testid="toggle-appearance-btn"
            >
              <div class="d-flex align-center ga-3">
                <PillAvatar
                  :shape="localMed.shape || 'letter'"
                  :pill-size="localMed.pillSize || 'medium'"
                  :color="localMed.color || 'blue'"
                  :name="localMed.name || 'M'"
                  :size="42"
                />
                <div>
                  <div class="text-subtitle-2 font-weight-bold">{{ t('med.appearance') }}</div>
                  <div class="text-caption text-medium-emphasis">{{ t('med.appearanceHint') }}</div>
                </div>
              </div>
              <v-icon>{{ appearanceExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </div>

            <v-expand-transition>
              <div v-if="appearanceExpanded">
                <v-divider></v-divider>
                <div class="pa-4">
                  <div class="text-subtitle-2 font-weight-bold mb-2">{{ t('med.color') }}</div>
                  <div class="d-flex flex-wrap ga-2 mb-4">
                    <v-btn
                      v-for="color in colors"
                      :key="color"
                      :color="color"
                      variant="flat"
                      rounded="circle"
                      class="color-btn"
                      :class="{ 'color-btn--white': color === 'white' }"
                      :aria-label="t('a11y.selectColor', { color: t(`med.colors.${color}`) })"
                      :aria-pressed="localMed.color === color"
                      :title="t(`med.colors.${color}`)"
                      @click="localMed.color = color"
                    >
                      <v-icon
                        v-if="localMed.color === color"
                        :color="color === 'white' ? 'grey-darken-4' : 'white'"
                        size="20"
                      >
                        mdi-check
                      </v-icon>
                    </v-btn>
                  </div>

                  <div class="text-subtitle-2 font-weight-bold mb-2">{{ t('med.pillShape') }}</div>
                  <div class="d-flex flex-wrap ga-2 mb-4">
                    <v-btn
                      v-for="s in availableShapes"
                      :key="s.id"
                      :variant="localMed.shape === s.id ? 'tonal' : 'outlined'"
                      :color="localMed.shape === s.id ? 'primary' : undefined"
                      rounded="lg"
                      class="shape-btn"
                      :title="t(s.labelKey)"
                      :aria-label="t(s.labelKey)"
                      :aria-pressed="localMed.shape === s.id"
                      @click="localMed.shape = s.id"
                    >
                      <PillAvatar
                        :shape="s.id"
                        :pill-size="'medium'"
                        :color="localMed.color || 'blue'"
                        :name="localMed.name || 'M'"
                        :size="28"
                      />
                    </v-btn>
                  </div>

                  <div v-if="localMed.shape && localMed.shape !== 'letter'">
                    <div class="text-subtitle-2 font-weight-bold mb-2">{{ t('med.pillSize') }}</div>
                    <v-btn-toggle
                      v-model="localMed.pillSize"
                      mandatory
                      divided
                      color="primary"
                      variant="outlined"
                      class="responsive-btn-toggle"
                    >
                      <v-btn value="small">{{ t('med.sizeSmall') }}</v-btn>
                      <v-btn value="medium">{{ t('med.sizeMedium') }}</v-btn>
                      <v-btn value="large">{{ t('med.sizeLarge') }}</v-btn>
                    </v-btn-toggle>
                  </div>
                </div>
              </div>
            </v-expand-transition>
          </v-card>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.med-form-container {
  max-width: 600px;
}
.cursor-pointer {
  cursor: pointer;
}
.quick-chip-btn {
  min-height: 40px !important;
  min-width: 0 !important;
  padding: 0 8px !important;
}
.color-btn {
  min-width: 40px !important;
  width: 40px;
  height: 40px !important;
  padding: 0 !important;
}
.color-btn--white {
  border: 1.5px solid #94a3b8 !important;
}
.shape-btn {
  min-width: 44px !important;
  width: 44px;
  height: 44px !important;
  padding: 0 !important;
}
</style>
