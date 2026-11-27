<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as dataService from '../../common/utils/dataService';
import { parseDose, getStatusColor, calculateDaysRemaining } from '../utils/medUtils';
import PillAvatar from './PillAvatar.vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  deduction: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['edit', 'delete', 'refill']);
const { t } = useI18n();

const detailOpen = ref(false);
const displayMode = ref('pills'); // 'pills', 'days', 'packages'
const yellowLimit = ref(21);
const redLimit = ref(7);
const showDeduction = ref(false);

async function updateSettings() {
  const settings = await dataService.getSettings();
  if (settings?.displayMode) displayMode.value = settings.displayMode;
  if (settings?.yellowLimit !== undefined) yellowLimit.value = settings.yellowLimit;
  if (settings?.redLimit !== undefined) redLimit.value = settings.redLimit;
}

onMounted(() => {
  updateSettings();
  window.addEventListener('storage-display-mode-changed', updateSettings);
  window.addEventListener('storage-limits-changed', updateSettings);

  if (props.deduction > 0) {
    showDeduction.value = true;
    setTimeout(() => {
      showDeduction.value = false;
    }, 4000);
  }
});

onUnmounted(() => {
  window.removeEventListener('storage-display-mode-changed', updateSettings);
  window.removeEventListener('storage-limits-changed', updateSettings);
});

const dailyDoseTotal = computed(() => {
  return parseDose(props.item.dose);
});

const displayPlan = computed(() => {
  const dose = props.item.dose || '';
  if (!dose) return '0-0-0';

  if (dose.includes('-')) {
    const parts = dose.split('-');
    while (parts.length < 3) {
      parts.push('0');
    }
    if (parts.length >= 4) {
      const nightDose = parts[3];
      if (nightDose && nightDose !== '0' && nightDose !== '') {
        return parts.slice(0, 4).join('-');
      }
    }
    return parts.slice(0, 3).join('-');
  }
  return `${dose}-0-0`;
});

const daysRemaining = computed(() => {
  return calculateDaysRemaining(props.item);
});

const stockProgress = computed(() => {
  const days = daysRemaining.value;
  if (days === null) return 100;
  const maxRef = Math.max(yellowLimit.value * 1.5, 30);
  return Math.min(100, Math.max(6, Math.round((days / maxRef) * 100)));
});

const scheduleChipText = computed(() => {
  const schedule = props.item.schedule;
  if (!schedule || schedule.type === 'daily') return '';
  if (schedule.type === 'weekly') {
    const days = Array.isArray(schedule.days) ? schedule.days : [];
    const dayLabels = days
      .map((d) => {
        const code = String(d).toLowerCase().slice(0, 2);
        const capitalized = code.charAt(0).toUpperCase() + code.slice(1);
        return t(`med.day${capitalized}`);
      })
      .join(', ');
    return dayLabels || t('med.scheduleWeekly');
  }
  if (schedule.type === 'interval') {
    return t('med.everyXDays', { n: schedule.intervalDays || 1 });
  }
  return '';
});

const emptyDate = computed(() => {
  const days = daysRemaining.value;
  if (days === null) return null;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString();
});

const packagesRemaining = computed(() => {
  const size = parseFloat(props.item.packageSize);
  if (!size || size <= 0) return 0;
  return props.item.count / size;
});

const fullPackages = computed(() => {
  return Math.floor(packagesRemaining.value);
});

const hasPartialPackage = computed(() => {
  return packagesRemaining.value > fullPackages.value;
});

const statusColor = computed(() => {
  return getStatusColor(daysRemaining.value, yellowLimit.value, redLimit.value);
});

const gaugeColor = computed(() => statusColor.value || 'success');

const hasPackageSize = computed(() => {
  const size = parseFloat(props.item.packageSize);
  return Number.isFinite(size) && size > 0;
});

function handleEdit() {
  detailOpen.value = false;
  emit('edit');
}

function handleDelete() {
  detailOpen.value = false;
  emit('delete');
}

function handleRefill() {
  detailOpen.value = false;
  emit('refill');
}
</script>

<template>
  <v-card class="m3-card med-card mb-3 cursor-pointer" @click="detailOpen = !detailOpen">
    <v-card-item class="pb-2">
      <template v-slot:prepend>
        <div class="mr-3 d-flex align-center justify-center">
          <PillAvatar
            :shape="item.shape || 'letter'"
            :pill-size="item.pillSize || 'medium'"
            :color="item.color || 'blue'"
            :name="item.name"
            :size="44"
          />
        </div>
      </template>

      <v-card-title class="text-wrap" style="line-height: 1.25">
        <div class="text-subtitle-1 font-weight-bold mb-1">{{ item.name }}</div>
        <div class="d-flex flex-wrap align-center ga-1 text-body-2 text-medium-emphasis">
          <span v-if="item.ingredient">({{ item.ingredient }})</span>
          <span class="dose-pill font-weight-bold">{{ displayPlan }}</span>
          <v-chip v-if="scheduleChipText" size="x-small" color="tertiary" variant="tonal">
            {{ scheduleChipText }}
          </v-chip>
        </div>
      </v-card-title>

      <template v-slot:append>
        <div class="d-flex flex-column align-end pl-2 position-relative">
          <!-- Deduction Animation -->
          <transition name="float-up">
            <div v-if="showDeduction" class="deduction-badge text-error font-weight-bold">-{{ deduction }}</div>
          </transition>

          <div class="d-flex align-center">
            <div v-if="displayMode === 'packages'" class="d-flex align-center ga-1">
              <template v-if="hasPackageSize">
                <div v-for="n in Math.min(fullPackages, 5)" :key="n" class="package-icon-wrapper">
                  <v-icon icon="mdi-package-variant-closed" color="primary" size="small"></v-icon>
                </div>
                <div v-if="hasPartialPackage && fullPackages < 5" class="package-icon-wrapper" style="opacity: 0.7">
                  <v-icon icon="mdi-package-variant" color="primary" size="small"></v-icon>
                </div>
                <span v-if="fullPackages >= 5" class="text-caption font-weight-bold ml-1">
                  +{{ Math.floor(packagesRemaining) - 4 }}
                </span>
              </template>
              <span v-else class="text-caption text-medium-emphasis">-</span>
            </div>

            <v-chip
              v-else
              :color="statusColor || 'primary'"
              variant="tonal"
              size="small"
              class="text-body-2 font-weight-bold"
            >
              <template v-if="displayMode === 'pills'"> {{ item.count }} {{ t('med.unitPills') }} </template>
              <template v-else-if="displayMode === 'days'">
                {{ daysRemaining !== null ? daysRemaining : '-' }} {{ t('med.unitDays') }}
              </template>
            </v-chip>

            <v-icon v-if="statusColor" icon="mdi-alert" :color="statusColor" size="20" class="ml-1"></v-icon>
          </div>
        </div>
      </template>
    </v-card-item>

    <!-- Subtle Material 3 Stock Gauge -->
    <div class="px-4 pb-3">
      <v-progress-linear
        :model-value="stockProgress"
        :color="gaugeColor"
        bg-color="surface-variant"
        bg-opacity="1"
        height="6"
        rounded
      ></v-progress-linear>
    </div>

    <!-- M3 Detail Bottom Sheet -->
    <v-dialog v-model="detailOpen" class="m3-sheet-dialog" transition="dialog-bottom-transition">
      <v-card class="pa-2">
        <div class="m3-sheet-handle"></div>
        <v-card-item class="pt-2 pb-1">
          <template v-slot:prepend>
            <PillAvatar
              :shape="item.shape || 'letter'"
              :pill-size="item.pillSize || 'medium'"
              :color="item.color || 'blue'"
              :name="item.name"
              :size="48"
              class="mr-3"
            />
          </template>
          <v-card-title class="text-h6 font-weight-bold text-wrap">{{ item.name }}</v-card-title>
          <v-card-subtitle v-if="item.ingredient">{{ item.ingredient }}</v-card-subtitle>
          <template v-slot:append>
            <span class="dose-pill font-weight-bold">{{ displayPlan }}</span>
          </template>
        </v-card-item>

        <v-card-text class="pt-3 pb-4">
          <div class="stat-grid mb-4">
            <div class="stat-tile py-2 px-1 rounded-xl text-center">
              <div class="text-h6 font-weight-bold">{{ item.count }}</div>
              <div class="stat-tile-label text-medium-emphasis">{{ t('app.showPills') }}</div>
            </div>
            <div class="stat-tile py-2 px-1 rounded-xl text-center">
              <div class="text-h6 font-weight-bold" :class="statusColor ? `text-${statusColor}` : ''">
                {{ daysRemaining !== null ? daysRemaining : t('med.na') }}
              </div>
              <div class="stat-tile-label text-medium-emphasis">{{ t('med.daysRemaining') }}</div>
            </div>
            <div class="stat-tile py-2 px-1 rounded-xl text-center">
              <div class="text-h6 font-weight-bold">{{ item.packageSize || t('med.na') }}</div>
              <div class="stat-tile-label text-medium-emphasis">{{ t('med.packageSize') }}</div>
            </div>
          </div>

          <div class="d-flex justify-space-between mb-2 text-body-2">
            <span class="text-medium-emphasis">{{ t('med.dose') }}:</span>
            <span class="font-weight-medium">{{ dailyDoseTotal }}</span>
          </div>
          <div v-if="scheduleChipText" class="d-flex justify-space-between mb-2 text-body-2">
            <span class="text-medium-emphasis">{{ t('med.schedule') }}:</span>
            <span class="font-weight-medium">{{ scheduleChipText }}</span>
          </div>
          <div class="d-flex justify-space-between mb-4 text-body-2">
            <span class="text-medium-emphasis">{{ t('med.emptyDate') }}:</span>
            <span class="font-weight-medium">{{ emptyDate !== null ? emptyDate : t('med.na') }}</span>
          </div>

          <!-- 1-Tap Quick Refill (Zero schema change) -->
          <v-btn
            v-if="hasPackageSize"
            block
            color="primary"
            variant="tonal"
            size="large"
            rounded="pill"
            prepend-icon="mdi-plus"
            class="mb-3 btn-wrap"
            @click.stop="handleRefill"
            data-testid="med-quick-refill-btn"
          >
            {{ t('med.quickRefill', { size: item.packageSize }) }}
          </v-btn>

          <div class="d-flex flex-wrap ga-2">
            <v-btn
              class="flex-grow-1"
              variant="tonal"
              color="secondary"
              size="large"
              rounded="pill"
              prepend-icon="mdi-pencil"
              @click.stop="handleEdit"
            >
              {{ t('dialog.edit') }}
            </v-btn>
            <v-btn
              class="flex-grow-1"
              variant="tonal"
              color="error"
              size="large"
              rounded="pill"
              prepend-icon="mdi-delete"
              @click.stop="handleDelete"
            >
              {{ t('dialog.delete') }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.text-wrap {
  white-space: normal !important;
}
.dose-pill {
  background-color: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface));
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.8125rem;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.stat-tile {
  background-color: rgb(var(--v-theme-surface-light));
  min-width: 0;
}
.stat-tile-label {
  font-size: 0.75rem;
  line-height: 1.25;
  overflow-wrap: break-word;
  hyphens: auto;
}
.package-icon-wrapper {
  background-color: rgba(var(--v-theme-primary), 0.12);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.position-relative {
  position: relative;
}
.deduction-badge {
  position: absolute;
  top: -18px;
  right: 0;
  background-color: rgb(var(--v-theme-surface));
  padding: 2px 6px;
  border-radius: 6px;
  z-index: 10;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.14);
}
.float-up-enter-active,
.float-up-leave-active {
  transition: all 4s ease-out;
}
.float-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.float-up-enter-to,
.float-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.float-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
