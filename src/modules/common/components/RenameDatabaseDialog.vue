<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  modelValue: Boolean,
  currentName: String,
});
const emit = defineEmits(['update:modelValue', 'save']);

const { t } = useI18n();
const newName = ref('');
const error = ref(null);

watch(() => props.modelValue, (val) => {
  if (val) {
    newName.value = props.currentName;
    error.value = null;
  }
});

const close = () => {
  emit('update:modelValue', false);
};

const save = () => {
  if (!newName.value || newName.value.trim().length === 0) {
    error.value = 'Name cannot be empty.';
    return;
  }
  emit('save', newName.value.trim());
  close();
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" max-width="500px" persistent>
    <v-card>
      <v-card-title>Rename Database</v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" density="compact" class="mb-4">{{ error }}</v-alert>
        <v-text-field
          v-model="newName"
          label="New database name"
          variant="outlined"
          autofocus
          @keyup.enter="save"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">Cancel</v-btn>
        <v-btn color="primary" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
