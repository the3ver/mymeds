import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import MainPage from '../../src/MainPage.vue';
import { messages } from '../../src/i18n';
import { state as appState } from '../../src/app-state';
import { snackbarState, triggerSnackbarAction, dismissSnackbar } from '../../src/modules/common/utils/snackbarService';
import * as shortcutService from '../../src/modules/common/utils/shortcutService';
import * as badgingService from '../../src/modules/common/utils/badgingService';
import { getSettings } from '../../src/modules/common/utils/dataService';

const loaded = vi.hoisted(() => ({ scanner: false }));

// Records whether a test pulls in the real scanner (and with it @zxing/library)
vi.mock('../../src/modules/meds/utils/bmpScannerService', async (importOriginal) => {
  loaded.scanner = true;
  return importOriginal();
});

// MainPage loads these dialogs via defineAsyncComponent. Name-based stubs do not
// reach an async wrapper, so the real dialog (qrcode, @zxing) would load and could
// finish after teardown (EnvironmentTeardownError on slower CI runners).
vi.mock('../../src/modules/meds/components/BmpScanDialog.vue', () => ({
  __esModule: true,
  default: { name: 'BmpScanDialog', template: '<div class="bmp-scan-stub"></div>' }
}));
vi.mock('../../src/modules/meds/components/BmpExportDialog.vue', () => ({
  __esModule: true,
  default: { name: 'BmpExportDialog', template: '<div class="bmp-export-stub"></div>' }
}));
vi.mock('../../src/modules/common/components/DataDialog.vue', () => ({
  __esModule: true,
  default: { name: 'DataDialog', template: '<div class="data-dialog-stub"></div>' }
}));

vi.mock('../../src/modules/common/utils/shortcutService', () => ({
  consumeShortcutIntent: vi.fn().mockReturnValue({ tab: null, action: null })
}));

vi.mock('../../src/modules/common/utils/badgingService', () => ({
  updateCriticalMedsBadge: vi.fn().mockResolvedValue(0),
  clearBadge: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../../src/modules/common/utils/dataService', () => ({
  getSettings: vi.fn().mockResolvedValue({ redLimit: 7 })
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
    return mount(
      {
        template: `
        <v-layout>
          <MainPage ref="page" />
        </v-layout>
      `,
        components: { MainPage }
      },
      {
        global: {
          plugins: [vuetify, i18n],
          stubs: {
            CalendarPage: { template: '<div class="calendar-stub"></div>' }
          }
        }
      }
    );
  };

  it('opens M3 FAB speed-dial menu with Add Medication, BMP scan, and BMP export actions in meds tab', async () => {
    const wrapper = mountMainPage();
    await wrapper.vm.$nextTick();

    const fabBtn = wrapper.find('[data-testid="meds-fab-btn"] button, button[data-testid="meds-fab-btn"]');
    expect(fabBtn.exists()).toBe(true);
    await fabBtn.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Arztplan einscannen (BMP)');
    expect(wrapper.text()).toContain('Plan als BMP anzeigen (DataMatrix)');

    const addBtn = wrapper.find('[data-testid="add-med-btn"]');
    expect(addBtn.exists()).toBe(true);
    expect(addBtn.element.tagName).toBe('BUTTON');
  });

  it('supports undo via global snackbar when deleting or refilling a medication', async () => {
    dismissSnackbar();
    appState.decryptedData.meds = [{ name: 'Ibuprofen', dose: '1-0-1', count: 10, packageSize: 20 }];
    const wrapper = mountMainPage();
    await wrapper.vm.$nextTick();

    const medList = wrapper.findComponent({ name: 'MedList' });
    medList.vm.$emit('refill', 0);
    await wrapper.vm.$nextTick();
    expect(appState.decryptedData.meds[0].count).toBe(30);
    expect(snackbarState.open).toBe(true);
    expect(snackbarState.actionText).toBe('Rückgängig');

    triggerSnackbarAction();
    expect(appState.decryptedData.meds[0].count).toBe(10);

    medList.vm.$emit('delete', 0);
    await wrapper.vm.$nextTick();
    expect(appState.decryptedData.meds.length).toBe(0);
    expect(snackbarState.actionText).toBe('Rückgängig');

    triggerSnackbarAction();
    expect(appState.decryptedData.meds.length).toBe(1);
    expect(appState.decryptedData.meds[0].name).toBe('Ibuprofen');
  });

  it('updates the meds tab badge when the red limit changes in settings', async () => {
    // 10 pills at 1 per day = 10 days left: not critical at limit 7, critical at limit 14
    appState.decryptedData.meds = [{ name: 'Ibuprofen', dose: '1-0-0', count: 10 }];
    const wrapper = mountMainPage();
    await flushPromises();
    // Vuetify drops an inactive badge, but a leave transition can keep it in the DOM with content 0
    const badgeCount = () => {
      const badge = wrapper.find('[data-testid="nav-tab-meds"] .v-badge__badge');
      return badge.exists() ? badge.text() : '0';
    };
    expect(badgeCount()).toBe('0');

    getSettings.mockResolvedValue({ redLimit: 14 });
    window.dispatchEvent(new Event('storage-limits-changed'));
    await flushPromises();

    expect(badgeCount()).toBe('1');
    getSettings.mockResolvedValue({ redLimit: 7 });
    wrapper.unmount();
  });

  it('renders 3-tab Material 3 bottom navigation including More tab', async () => {
    const wrapper = mountMainPage();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="nav-tab-meds"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="nav-tab-calendar"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="nav-tab-more"]').exists()).toBe(true);
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

  it('does not load the real scanner dialog when the scan dialog opens', async () => {
    shortcutService.consumeShortcutIntent.mockReturnValue({ tab: null, action: 'scan' });

    mountMainPage();
    // Give a lazy import time to resolve; it would otherwise finish after teardown
    await new Promise((r) => setTimeout(r, 1000));

    expect(loaded.scanner).toBe(false);
  });

  it('updates critical meds badge on mount', async () => {
    shortcutService.consumeShortcutIntent.mockReturnValue({ tab: null, action: null });

    mountMainPage();
    await new Promise((r) => setTimeout(r, 20));

    expect(badgingService.updateCriticalMedsBadge).toHaveBeenCalled();
  });

  it('gives the calendar add FAB button an accessible name', async () => {
    shortcutService.consumeShortcutIntent.mockReturnValue({ tab: 'calendar', action: null });
    const wrapper = mountMainPage();
    await wrapper.vm.$nextTick();

    // aria-label on <v-fab> lands on the wrapper div; the <button> itself needs the name
    const fabBtn = wrapper.find('.v-fab button');
    expect(fabBtn.exists()).toBe(true);
    const name = fabBtn.attributes('aria-label') || fabBtn.text().trim();
    expect(name).toBe('Eintrag hinzufügen');
  });
});
