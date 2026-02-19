<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'select'])
const { t } = useI18n()

const types = [
  { value: 'doctor', icon: 'mdi-doctor', color: 'primary' },
  { value: 'vaccination', icon: 'mdi-needle', color: 'teal' },
  { value: 'illness', icon: 'mdi-emoticon-sick', color: 'orange' },
  { value: 'note', icon: 'mdi-note-text', color: 'blue-grey' }
]

const select = (type) => {
  emit('select', type)
  emit('update:modelValue', false)
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" max-width="400px">
    <v-card>
      <v-card-title>{{ t('calendar.selectType') }}</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="type in types"
            :key="type.value"
            :prepend-icon="type.icon"
            :title="t(`calendar.types.${type.value}`)"
            @click="select(type.value)"
            :color="type.color"
            rounded="lg"
            class="mb-2"
            variant="tonal"
          >
            <template v-slot:prepend>
              <v-avatar :color="type.color" class="mr-2">
                <v-icon color="white">{{ type.icon }}</v-icon>
              </v-avatar>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="close">{{ t('dialog.cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>