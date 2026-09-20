import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import MainPage from '../../src/MainPage.vue';
import { messages } from '../../src/i18n';
import { state as appState } from '../../src/app-state';
import * as shortcutService from '../../src/modules/common/utils/shortcutService';
import * as badgingService from '../../src/modules/common/utils/badgingService';
import * as dataService from '../../src/modules/common/utils/dataService';

vi.mock('../../src/modules/common/utils/shortcutService', () => ({
  consumeShortcutIntent: vi.fn().mockReturnValue({ tab: null, action: null }),
}));

vi.mock('../../src/modules/common/utils/badgingService', () => ({
  updateCriticalMedsBadge: vi.fn().mockResolvedValue(0),
  clearBadge: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/modules/common/utils/dataService', () => ({
  getSettings: vi.fn().mockResolvedValue({ redLimit: 7 }),
}));

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({
  legacy: false,
  locale: 'de',
  messages
});

describe('MainPage.vue', () => {
  beforeEach(() => {
    appState.decryptedData = {
      meds: [{ name: 'Test Med', dose: '1-0-0', count: 10 }],
      calendar: [],
      version: 1
    };
    appState.deductions = {};
  });

  const mountMainPage = () => {
    return mount({
      template: `
        <v-layout>
          <MainPage ref="page" />
        </v-layout>
      `,
      components: { MainPage }
    }, {
      global: {
        plugins: [vuetify, i18n],
        stubs: {
          CalendarPage: { template: '<div class="calendar-stub"></div>' }
        }
      }
    });
  };

  it('renders BMP scan and BMP export buttons in meds tab', async () => {
    const wrapper = mountMainPage();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Arztplan einscannen (BMP)');
    expect(wrapper.text()).toContain('Plan als BMP anzeigen (DataMatrix)');
  });

  it('switches to calendar tab when shortcut tab intent is calendar', async () => {
    shortcutService.consumeShortcutIntent.mockReturnValue({ tab: 'calendar', action: null });

    const wrapper = mountMainPage();
    await wrapper.vm.$nextTick();
    const mainPageVm = wrapper.findComponent(MainPage).vm;

    expect(mainPageVm.activeTab).toBe('calendar');
  });

  it('opens scan dialog when shortcut action intent is scan', async () => {
    shortcutService.consumeShortcutIntent.mockReturnValue({ tab: null, action: 'scan' });

    const wrapper = mountMainPage();
    await wrapper.vm.$nextTick();
    const mainPageVm = wrapper.findComponent(MainPage).vm;

    expect(mainPageVm.bmpScanDialog).toBe(true);
  });

  it('updates critical meds badge on mount', async () => {
    shortcutService.consumeShortcutIntent.mockReturnValue({ tab: null, action: null });

    mountMainPage();
    await new Promise(r => setTimeout(r, 20));

    expect(badgingService.updateCriticalMedsBadge).toHaveBeenCalled();
  });
});
