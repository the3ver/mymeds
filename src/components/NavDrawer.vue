<script setup>
import { ref } from 'vue'
import { useTheme } from 'vuetify'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const theme = useTheme()
const aboutDialog = ref(false)

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  localStorage.setItem('myMedsTheme', theme.global.name.value)
}
</script>

<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="val => emit('update:modelValue', val)"
    temporary
  >
    <v-list>
      <v-list-item title="Settings" subtitle="App Preferences"></v-list-item>
      <v-divider></v-divider>
      <v-list-item @click="toggleTheme">
        <template v-slot:prepend>
          <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </template>
        <v-list-item-title>
          {{ theme.global.current.value.dark ? 'Light Mode' : 'Dark Mode' }}
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="aboutDialog = true">
        <template v-slot:prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        <v-list-item-title>About</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- About Dialog -->
  <v-dialog v-model="aboutDialog" max-width="500px">
    <v-card>
      <v-card-title>About MyMeds</v-card-title>
      <v-card-text>
        <p class="mb-4">MyMeds is a simple application to help you track your medication inventory.</p>
        
        <v-list density="compact">
          <v-list-item
            prepend-icon="mdi-github"
            title="GitHub Repository"
            href="https://github.com/the3ver/mymeds"
            target="_blank"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-license"
            title="License"
            href="https://github.com/the3ver/mymeds/blob/main/LICENSE"
            target="_blank"
          ></v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="aboutDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>