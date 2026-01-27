<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div v-if="items.length > 0">
    <v-card
      v-for="(item, index) in items"
      :key="index"
      class="mb-4"
      variant="elevated"
    >
      <v-card-item>
        <template v-slot:prepend>
          <v-avatar :color="item.color" class="mr-2">
            <span class="text-h6 text-white">{{ item.name.charAt(0).toUpperCase() }}</span>
          </v-avatar>
        </template>
        <v-card-title>{{ item.name }}</v-card-title>
        <v-card-subtitle>Daily Dose: {{ item.dose }}</v-card-subtitle>
        <template v-slot:append>
          <div class="d-flex align-center">
            <v-chip size="small" color="primary" variant="tonal" class="mr-2">
              {{ item.count }}
            </v-chip>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  density="comfortable"
                  v-bind="props"
                ></v-btn>
              </template>
              <v-list>
                <v-list-item @click="emit('edit', index)">
                  <v-list-item-title>Edit</v-list-item-title>
                </v-list-item>
                <v-list-item @click="emit('delete', index)">
                  <v-list-item-title class="text-red">Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-card-item>
    </v-card>
  </div>
  <div v-else class="text-center mt-10 text-grey">
    No meds added yet
  </div>
</template>

<style scoped>
</style>