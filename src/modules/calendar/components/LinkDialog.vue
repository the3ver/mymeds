<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'add'])
const { t } = useI18n()

const linkUrl = ref('')
const linkLabel = ref('')

// Reset when dialog opens
watch(() => props.modelValue, (val) => {
  if (val) {
    linkUrl.value = ''
    linkLabel.value = ''
  }
})

const add = () => {
  if (linkUrl.value) {
    emit('add', { url: linkUrl.value, label: linkLabel.value })
    close()
  }
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" max-width="400px">
    <v-card>
      <v-card-title>{{ t('calendar.addLink.title') }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="linkUrl"
          :label="t('calendar.addLink.url')"
          variant="underlined"
          autofocus
          @keyup.enter="add"
        ></v-text-field>
        <v-text-field
          v-model="linkLabel"
          :label="t('calendar.addLink.label')"
          :placeholder="t('calendar.addLink.labelPlaceholder')"
          variant="underlined"
          @keyup.enter="add"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">{{ t('dialog.cancel') }}</v-btn>
        <v-btn color="primary" text @click="add">{{ t('calendar.addLink.add') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
