import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import './style.css'
import App from './App.vue'
import { messages } from './i18n'
import * as dataService from './modules/common/utils/dataService'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

async function initializeApp() {
  // Fetch settings asynchronously
  const settings = await dataService.getSettings();

  // Create i18n instance with the loaded locale
  const i18n = createI18n({
    legacy: false,
    locale: settings.locale,
    fallbackLocale: 'en',
    messages,
  });

  // Create Vuetify instance and set the theme
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: settings.theme,
    },
  });

  // Create and mount the Vue app
  const app = createApp(App);
  app.use(i18n);
  app.use(vuetify);
  app.mount('#app');

  // Apply UI scale after app is mounted
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
