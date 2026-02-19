<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: Boolean,
  dataContent: String,
  fileName: String
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const saveFile = () => {
  const blob = new Blob([props.dataContent], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = props.fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  close()
}

const shareFile = async () => {
  const file = new File([props.dataContent], props.fileName, { type: 'application/json' })

  if (navigator.canShare && navigator.share) {
    try {
      await navigator.share({
        files: [file],
        title: 'MyMeds Data Export',
        text: 'MyMeds Data Export'
      })
    } catch (error) {
      console.error('Error sharing:', error)
      // Fallback to save if sharing fails/cancelled
      saveFile()
    }
  } else {
    saveFile()
  }
  close()
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" max-width="400px">
    <v-card>
      <v-card-title>{{ t('app.exportTitle') }}</v-card-title>
      <v-card-text>{{ t('app.exportMessage') }}</v-card-text>
      <v-card-actions class="flex-column align-stretch">
        <v-btn color="primary" variant="elevated" class="mb-2" @click="saveFile">
          <v-icon start>mdi-download</v-icon>
          {{ t('app.saveFile') }}
        </v-btn>
        <v-btn color="primary" variant="outlined" class="mb-2" @click="shareFile">
          <v-icon start>mdi-share-variant</v-icon>
          {{ t('app.shareFile') }}
        </v-btn>
        <v-btn color="grey" variant="text" @click="close">
          {{ t('dialog.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>