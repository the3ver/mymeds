// tests/setup.js
import 'fake-indexeddb/auto';
import ResizeObserver from 'resize-observer-polyfill';

// Vuetify styles
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

// Make ResizeObserver globally available for Vuetify 3 components
window.ResizeObserver = ResizeObserver;

// Make visualViewport globally available for Vuetify 3 overlays/dialogs
const mockVisualViewport = {
  width: 1024,
  height: 768,
  offsetLeft: 0,
  offsetTop: 0,
  pageLeft: 0,
  pageTop: 0,
  scale: 1,
  addEventListener: () => {},
  removeEventListener: () => {},
};
window.visualViewport = mockVisualViewport;
globalThis.visualViewport = mockVisualViewport;

