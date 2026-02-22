// tests/setup.js
import 'fake-indexeddb/auto';
import ResizeObserver from 'resize-observer-polyfill';

// Make ResizeObserver globally available for Vuetify 3 components
window.ResizeObserver = ResizeObserver;
