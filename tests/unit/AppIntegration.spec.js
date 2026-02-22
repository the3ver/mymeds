import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import { messages } from '../../src/i18n';
import { state as appState, lock } from '../../src/app-state';
import App from '../../src/App.vue';
import * as components from 'vuetify/components';
import * as dataService from '../../src/modules/common/utils/dataService';

// Mock the dataService
vi.mock('../../src/modules/common/utils/dataService');

// Create instances of the plugins
const vuetify = createVuetify({ components });
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});

describe('App Integration Tests', () => {
  let wrapper;

  // Reset state and provide mock implementations before each test
  beforeEach(() => {
    lock(); // Ensure app is in a locked state

    // Provide default mock implementations for dataService functions
    dataService.getSettings.mockResolvedValue({
      locale: 'en',
      theme: 'light',
      uiScale: 'normal',
      sortMode: 'added',
      displayMode: 'pills',
      yellowLimit: 21,
      redLimit: 7,
      showOverview: true,
    });
    dataService.getDatabaseList.mockResolvedValue([]); // <-- ADD THIS LINE

    if (wrapper) {
      wrapper.unmount();
    }
    wrapper = mount(App, {
      global: {
        plugins: [vuetify, i18n],
      },
    });
  });

  it('displays the calendar filter button only when a database is unlocked and the calendar tab is active', async () => {
    // 1. Initially, app is locked, button should not exist
    expect(wrapper.find('[data-testid="calendar-filter-btn"]').exists()).toBe(false);

    // 2. Unlock the app (simulated)
    appState.isLocked = false;
    await wrapper.vm.$nextTick();

    // 3. In unlocked state, default tab is 'meds', button should not exist
    expect(wrapper.find('[data-testid="calendar-filter-btn"]').exists()).toBe(false);

    // 4. Simulate clicking the calendar tab button
    const calendarNavButton = wrapper.find('[data-testid="nav-calendar-btn"]');
    await calendarNavButton.trigger('click');
    await wrapper.vm.$nextTick();

    // 5. Now, on the calendar tab, the button should exist
    expect(wrapper.find('[data-testid="calendar-filter-btn"]').exists()).toBe(true);

    // 6. Switch back to meds tab, button should disappear
    const medsNavButton = wrapper.find('[data-testid="nav-meds-btn"]');
    await medsNavButton.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="calendar-filter-btn"]').exists()).toBe(false);
  });

  it('displays the Data Management menu item only when a database is unlocked', async () => {
    // 1. Initially, app is locked, open drawer and check for item
    await wrapper.find('[data-testid="nav-drawer-toggle"]').trigger('click');
    let navDrawer = wrapper.findComponent({ name: 'NavDrawer' });
    expect(navDrawer.text()).not.toContain('Data Management');

    // 2. Unlock the app
    appState.isLocked = false;
    await wrapper.vm.$nextTick();

    // 3. Re-open drawer and check for item
    await wrapper.find('[data-testid="nav-drawer-toggle"]').trigger('click');
    navDrawer = wrapper.findComponent({ name: 'NavDrawer' });
    expect(navDrawer.text()).toContain('Data Management');
  });
});
