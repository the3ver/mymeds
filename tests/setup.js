// tests/setup.js
import 'fake-indexeddb/auto';
import ResizeObserver from 'resize-observer-polyfill';

// Vuetify styles
import 'vuetify/styles';
import '../src/styles/icons.css';

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
  removeEventListener: () => {}
};
window.visualViewport = mockVisualViewport;
globalThis.visualViewport = mockVisualViewport;

// Unmount every mounted wrapper after each test. A component left mounted keeps
// its timers alive; they can fire after jsdom teardown ("window is not defined").
import { afterEach } from 'vitest';
import { enableAutoUnmount } from '@vue/test-utils';
enableAutoUnmount(afterEach);
