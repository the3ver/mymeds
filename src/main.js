import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import './style.css'
import App from './App.vue'
import { messages } from './i18n'
import * as dataService from './modules/common/utils/dataService'
import { unlock } from './app-state'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

async function initializeApp() {
  console.log('[main.js] 🚀 Initializing app...');
  
  // Attempt to recover session first
  const recoveryState = dataService.getRecoveryState();
  if (recoveryState) {
    console.log('[main.js]  Found recovery state, attempting to auto-unlock...');
    const result = await dataService.unlockDatabase(recoveryState.id, recoveryState.password);
    if (result.success) {
      console.log('[main.js] ✅ Auto-unlock successful.');
      unlock(recoveryState.id, recoveryState.password, result.data);
    } else {
      console.warn('[main.js] ⚠️ Auto-unlock failed.');
    }
    dataService.clearRecoveryState(); // Always clear after attempting
  }
  
  // 1. Fetch settings asynchronously
  const settings = await dataService.getSettings();
  console.log('[main.js] ✅ Settings loaded:', settings);

  // 2. Create i18n instance with the loaded locale
  const i18n = createI18n({
    legacy: false,
    locale: settings.locale,
    fallbackLocale: 'en',
    messages,
  });

  // 3. Create Vuetify instance and set the theme
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: settings.theme,
    },
  });

  // 4. Create and mount the Vue app
  console.log('[main.js]  mounting Vue app...');
  const app = createApp(App);
  app.use(i18n);
  app.use(vuetify);
  app.mount('#app');
  console.log('[main.js] ✅ App mounted.');

  // 5. Apply UI scale after app is mounted
  const root = document.documentElement;
  if (settings.uiScale === 'small') root.style.fontSize = '14px';
  else if (settings.uiScale === 'large') root.style.fontSize = '18px';
  else root.style.fontSize = '16px';
}

initializeApp().catch(error => {
  console.error("Fatal error during app initialization:", error);
  document.body.innerHTML = `<div style="padding: 2rem; text-align: center; font-family: sans-serif;">
    <h1>Application Error</h1>
    <p>Could not start the application. Please try clearing your browser data or contact support.</p>
    <p><em>Error: ${error.message}</em></p>
  </div>`;
});
