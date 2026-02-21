import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import i18n from './i18n'
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

  // Create Vuetify instance and set the theme
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: settings.theme,
    },
  });

  // Set the i18n locale
  i18n.global.locale.value = settings.locale;

  // Create and mount the Vue app
  const app = createApp(App);
  app.use(vuetify);
  app.use(i18n);
  app.mount('#app');

  // Apply UI scale
  const root = document.documentElement;
  if (settings.uiScale === 'small') root.style.fontSize = '14px';
  else if (settings.uiScale === 'large') root.style.fontSize = '18px';
  else root.style.fontSize = '16px';
}

initializeApp();
