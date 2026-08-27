import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import { messages } from '../../src/i18n';
import App from '../../src/App.vue';
import * as components from 'vuetify/components';
import { state as appState } from '../../src/app-state';
import * as dataService from '../../src/modules/common/utils/dataService';


// Minimal DOM mocks
if (typeof global.window === 'undefined') global.window = {};
if (typeof global.document === 'undefined') {
  global.document = {
    body: { setAttribute: () => {}, removeAttribute: () => {} },
    querySelector: () => {},
    getElementById: () => null,
    createElement: () => ({ style: {}, appendChild: () => {}, getBoundingClientRect: () => ({}) }),
  };
}
global.visualViewport = { addEventListener: () => {}, removeEventListener: () => {} };

const vuetify = createVuetify({ components });
const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages });

const flushPromises = () => new Promise(setImmediate);

describe('App.vue', () => {

  beforeEach(() => {
    // Reset state before each test
    appState.isLocked = true;
    appState.decryptedData = null;
  });

  const mountApp = () => {
    return mount(App, {
      global: {
        plugins: [vuetify, i18n],
        stubs: {
          // Stub child components to isolate App.vue's logic
          DatabaseListPage: {
            template: '<div data-testid="db-list-page"></div>',
          },
          MainPage: {
            template: '<div data-testid="main-page"></div>',
          },
          NavDrawer: true, // Stub the nav drawer completely
        },
      },
    });
  };

  it('should display DatabaseListPage when state is locked', async () => {
    // 1. Arrange
    appState.isLocked = true;
    const wrapper = mountApp();
    await flushPromises();

    // 2. Assert
    expect(wrapper.find('[data-testid="db-list-page"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="main-page"]').exists()).toBe(false);
  });

  it('should display MainPage when state is unlocked', async () => {
    // 1. Arrange
    appState.isLocked = false;
    // Provide minimal data to prevent errors in MainPage rendering
    appState.decryptedData = { meds: [], calendar: [], version: 1 };
    
    const wrapper = mountApp();
    await flushPromises();

    // 2. Assert
    expect(wrapper.find('[data-testid="db-list-page"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="main-page"]').exists()).toBe(true);
  });

  it('should show WelcomeDialog with isExistingUser=false when no databases exist and disclaimer not accepted', async () => {
    vi.spyOn(dataService, 'getSettings').mockResolvedValue({ disclaimerAccepted: false });
    vi.spyOn(dataService, 'getDatabaseList').mockResolvedValue([]);
    const wrapper = mountApp();
    await flushPromises();

    const welcomeComponent = wrapper.findComponent({ name: 'WelcomeDialog' });
    expect(welcomeComponent.exists()).toBe(true);
    expect(welcomeComponent.props('modelValue')).toBe(true);
    expect(welcomeComponent.props('isExistingUser')).toBe(false);
  });

  it('should show WelcomeDialog with isExistingUser=true when existing databases exist and disclaimer not accepted', async () => {
    vi.spyOn(dataService, 'getSettings').mockResolvedValue({ disclaimerAccepted: false });
    vi.spyOn(dataService, 'getDatabaseList').mockResolvedValue([{ id: 1, name: 'Mein Tresor' }]);
    const wrapper = mountApp();
    await flushPromises();

    const welcomeComponent = wrapper.findComponent({ name: 'WelcomeDialog' });
    expect(welcomeComponent.exists()).toBe(true);
    expect(welcomeComponent.props('modelValue')).toBe(true);
    expect(welcomeComponent.props('isExistingUser')).toBe(true);
  });
});
