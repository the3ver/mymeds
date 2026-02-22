// tests/setup.js
import 'fake-indexeddb/auto';
import ResizeObserver from 'resize-observer-polyfill';

// Vuetify styles
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

// Make ResizeObserver globally available for Vuetify 3 components
window.ResizeObserver = ResizeObserver;
