<script setup>
import { useTheme } from 'vuetify'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const theme = useTheme()

const setTheme = (mode) => {
  theme.global.name.value = mode
  localStorage.setItem('myMedsTheme', mode)
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="400px" persistent>
    <v-card>
      <v-card-title class="text-h5 text-center pt-4">Welcome to MyMeds!</v-card-title>
      <v-card-text class="text-center">
        <p class="mb-4">Thank you for installing the app.</p>
        <p class="mb-6">Please choose your preferred theme:</p>
        
        <div class="d-flex justify-center gap-4 mb-2">
          <v-card
            variant="outlined"
            class="pa-4 cursor-pointer d-flex flex-column align-center"
            :color="theme.global.name.value === 'light' ? 'primary' : ''"
            @click="setTheme('light')"
            width="120"
          >
            <v-icon size="large" class="mb-2">mdi-weather-sunny</v-icon>
            <span>Light</span>
          </v-card>
          
          <v-card
            variant="outlined"
            class="pa-4 cursor-pointer d-flex flex-column align-center"
            :color="theme.global.name.value === 'dark' ? 'primary' : ''"
            @click="setTheme('dark')"
            width="120"
          >
            <v-icon size="large" class="mb-2">mdi-weather-night</v-icon>
            <span>Dark</span>
          </v-card>
        </div>
      </v-card-text>
      <v-card-actions class="justify-center pb-4">
        <v-btn 
          color="primary" 
          variant="elevated" 
          size="large"
          @click="close"
          class="px-8"
        >
          Get Started
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.gap-4 {
  gap: 16px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>