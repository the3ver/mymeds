# Vue 3, Vuetify 3, and Debounced Auto-Save

The application uses Vue 3 Composition API with Vuetify 3 components and centralized reactive state in `src/app-state.js`. Any mutation to `state.decryptedData` triggers a debounced (500ms) save and encrypt cycle directly to IndexedDB. This removes manual save buttons, prevents data loss, and avoids UI lag during frequent keystrokes.
