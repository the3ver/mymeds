<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'select']);
const { t } = useI18n();

const types = [
  { value: 'doctor', icon: 'mdi-doctor', color: 'primary' },
  { value: 'vaccination', icon: 'mdi-needle', color: 'tertiary' },
  { value: 'illness', icon: 'mdi-emoticon-sick', color: 'warning' },
  { value: 'note', icon: 'mdi-note-text', color: 'secondary' }
];

const select = (type) => {
  emit('select', type);
  emit('update:modelValue', false);
};

const close = () => {
  emit('update:modelValue', false);
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="close"
    class="m3-sheet-dialog"
    transition="dialog-bottom-transition"
  >
    <v-card class="pa-2">
      <div class="m3-sheet-handle"></div>
      <v-card-title class="text-h6 font-weight-bold px-5 pt-2">{{ t('calendar.selectType') }}</v-card-title>
      <v-card-text class="px-4 pb-5">
        <div class="d-flex flex-column ga-2">
          <v-card
            v-for="type in types"
            :key="type.value"
            variant="tonal"
            :color="type.color"
            rounded="xl"
            class="cursor-pointer pa-3 d-flex align-center ga-3"
            @click="select(type.value)"
          >
            <v-avatar :color="type.color" size="42" rounded="lg">
              <v-icon color="white" size="22">{{ type.icon }}</v-icon>
            </v-avatar>
            <span class="text-subtitle-1 font-weight-medium">{{ t(`calendar.types.${type.value}`) }}</span>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
