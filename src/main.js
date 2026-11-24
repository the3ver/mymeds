import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import './style.css';
import App from './App.vue';
import { messages } from './i18n';
import * as dataService from './modules/common/utils/dataService';
import { applyUiScale } from './modules/common/utils/uiScale';

// Vuetify
import { createAppVuetify } from './plugins/vuetify';
import './styles/icons.css';

async function initializeApp() {
  // Fetch settings asynchronously
  const settings = await dataService.getSettings();

  // Create i18n instance with the loaded locale
  const i18n = createI18n({
    legacy: false,
    locale: settings.locale || 'de', // Set German as default
    fallbackLocale: 'en',
    messages
  });

  // Create Vuetify instance and set the theme
  const vuetify = createAppVuetify(settings.theme);

  // Create and mount the Vue app
  const app = createApp(App);
  app.use(i18n);
  app.use(vuetify);
  app.mount('#app');

  // Apply UI scale after app is mounted
  applyUiScale(settings.uiScale);
}

initializeApp().catch((error) => {
  console.error('Fatal error during app initialization:', error);
  document.body.innerHTML = `<div style="padding: 2rem; text-align: center; font-family: sans-serif;">
    <h1>Application Error</h1>
    <p>Could not start the application. Please try clearing your browser data or contact support.</p>
    <p><em>Error: ${error.message}</em></p>
  </div>`;
});
