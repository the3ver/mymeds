<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { parseDose, getStatusColor } from '../utils/medUtils'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])
const { t } = useI18n()

const isExpanded = ref(false)
const displayMode = ref('pills') // 'pills', 'days', 'packages'
const yellowLimit = ref(21)
const redLimit = ref(7)

const updateSettings = () => {
  const savedMode = localStorage.getItem('myMedsDisplayMode')
  if (savedMode) displayMode.value = savedMode

  const savedYellow = localStorage.getItem('myMedsYellowLimit')
  if (savedYellow) yellowLimit.value = parseInt(savedYellow)

  const savedRed = localStorage.getItem('myMedsRedLimit')
  if (savedRed) redLimit.value = parseInt(savedRed)
}

onMounted(() => {
  updateSettings()
  window.addEventListener('storage-display-mode-changed', updateSettings)
  window.addEventListener('storage-limits-changed', updateSettings)
})

onUnmounted(() => {
  window.removeEventListener('storage-display-mode-changed', updateSettings)
  window.removeEventListener('storage-limits-changed', updateSettings)
})

const dailyDoseTotal = computed(() => {
  return parseDose(props.item.dose)
})

const displayPlan = computed(() => {
  const dose = props.item.dose || ''
  if (!dose) return '0-0-0'
  
  if (dose.includes('-')) {
    const parts = dose.split('-')
    while (parts.length < 3) {
      parts.push('0')
    }
    if (parts.length >= 4) {
      const nightDose = parts[3]
      if (nightDose && nightDose !== '0' && nightDose !== '') {
        return parts.slice(0, 4).join('-')
      }
    }
    return parts.slice(0, 3).join('-')
  }
  return `${dose}-0-0`
})

const daysRemaining = computed(() => {
  const dose = dailyDoseTotal.value
  if (!dose || dose <= 0) return null
  return Math.floor(props.item.count / dose)
})

const emptyDate = computed(() => {
  const days = daysRemaining.value
  if (days === null) return null
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString()
})

const packagesRemaining = computed(() => {
  const size = parseFloat(props.item.packageSize)
  if (!size || size <= 0) return 0
  return props.item.count / size
})

const fullPackages = computed(() => {
  return Math.floor(packagesRemaining.value)
})

const hasPartialPackage = computed(() => {
  return packagesRemaining.value > fullPackages.value
})

const statusColor = computed(() => {
  return getStatusColor(daysRemaining.value, yellowLimit.value, redLimit.value)
})
</script>

<template>
  <v-card
    class="mb-4"
    variant="elevated"
    @click="isExpanded = !isExpanded"
    :ripple="true"
  >
    <v-card-item>
      <template v-slot:prepend>
        <v-avatar :color="item.color" class="mr-2">
          <span class="text-h6 text-white">{{ item.name.charAt(0).toUpperCase() }}</span>
        </v-avatar>
      </template>
      
      <v-card-title class="text-wrap" style="line-height: 1.2;">
        <div class="text-h6 font-weight-bold mb-1">{{ item.name }}</div>
        <div class="d-flex flex-wrap align-center gap-2 text-body-2 text-grey">
          <span v-if="item.ingredient">({{ item.ingredient }})</span>
          <span class="text-high-emphasis font-weight-bold ml-1">{{ displayPlan }}</span>
        </div>
      </v-card-title>
      
      <template v-slot:append>
        <div class="d-flex align-center pl-2">
          <div v-if="displayMode === 'packages'" class="d-flex align-center gap-1">
            <template v-if="item.packageSize && item.packageSize > 0">
              <div 
                v-for="n in Math.min(fullPackages, 5)" 
                :key="n"
                class="package-icon-wrapper"
              >
                <v-icon 
                  icon="mdi-package-variant-closed" 
                  color="primary"
                  size="small"
                ></v-icon>
              </div>
              <div 
                v-if="hasPartialPackage && fullPackages < 5" 
                class="package-icon-wrapper"
                style="opacity: 0.7;"
              >
                <v-icon 
                  icon="mdi-package-variant" 
                  color="primary"
                  size="small"
                ></v-icon>
              </div>
              <span v-if="fullPackages >= 5" class="text-caption font-weight-bold ml-1">+{{ Math.floor(packagesRemaining) - 4 }}</span>
            </template>
            <span v-else class="text-caption text-grey">-</span>
          </div>
          
          <v-chip v-else color="primary" variant="tonal" class="mr-2 text-body-1 font-weight-bold">
            <template v-if="displayMode === 'pills'">
              {{ item.count }} {{ t('med.unitPills') }}
            </template>
            <template v-else-if="displayMode === 'days'">
              {{ daysRemaining !== null ? daysRemaining : '-' }} {{ t('med.unitDays') }}
            </template>
          </v-chip>

          <v-icon 
            v-if="statusColor" 
            icon="mdi-alert" 
            :color="statusColor"
            class="ml-1"
          ></v-icon>
        </div>
      </template>
    </v-card-item>

    <v-expand-transition>
      <div v-if="isExpanded">
        <v-divider></v-divider>
        <v-card-text class="text-body-1">
          <div class="d-flex justify-space-between mb-2">
            <span class="text-grey">{{ t('med.packageSize') }}:</span>
            <span class="font-weight-medium">{{ item.packageSize || t('med.na') }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-grey">{{ t('med.dose') }}:</span>
            <span class="font-weight-medium">{{ dailyDoseTotal }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-grey">{{ t('med.daysRemaining') }}:</span>
            <span class="font-weight-medium" :class="statusColor ? `text-${statusColor}` : ''">
              {{ daysRemaining !== null ? daysRemaining : t('med.na') }}
            </span>
          </div>
          <div class="d-flex justify-space-between mb-4">
            <span class="text-grey">{{ t('med.emptyDate') }}:</span>
            <span class="font-weight-medium">{{ emptyDate !== null ? emptyDate : t('med.na') }}</span>
          </div>
          
          <div class="d-flex justify-end gap-2">
            <v-btn
              variant="text"
              color="primary"
              prepend-icon="mdi-pencil"
              @click.stop="emit('edit')"
            >
              {{ t('dialog.edit') }}
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              prepend-icon="mdi-delete"
              @click.stop="emit('delete')"
            >
              {{ t('dialog.delete') }}
            </v-btn>
          </div>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<style scoped>
.text-wrap {
  white-space: normal !important;
}
.gap-2 {
  gap: 8px;
}
.gap-1 {
  gap: 4px;
}
.package-icon-wrapper {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>