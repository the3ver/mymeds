import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import SettingsDialog from '../../src/modules/common/components/SettingsDialog.vue';
import * as dataService from '../../src/modules/common/utils/dataService';
import * as reminderService from '../../src/modules/common/utils/reminderService';

vi.mock('../../src/modules/common/utils/dataService', () => ({
  getSettings: vi.fn(),
  saveLocale: vi.fn(),
  saveTheme: vi.fn(),
  saveUiScale: vi.fn(),
  saveSortMode: vi.fn(),
  saveDisplayMode: vi.fn(),
  saveYellowLimit: vi.fn(),
  saveRedLimit: vi.fn(),
  saveShowOverview: vi.fn(),
  getReminderSettings: vi.fn(),
  saveReminderSettings: vi.fn(),
}));

vi.mock('../../src/modules/common/utils/biometricSessionService', () => ({
  clearAllBiometrics: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/modules/common/utils/reminderService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    isReminderSupported: vi.fn(),
    requestNotificationPermission: vi.fn().mockResolvedValue('granted'),
    registerPeriodicSync: vi.fn().mockResolvedValue(true),
    unregisterPeriodicSync: vi.fn().mockResolvedValue(true),
    sendTestNotification: vi.fn().mockResolvedValue(true),
  };
});

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('SettingsDialog.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    dataService.getSettings.mockResolvedValue({
      locale: 'de',
      theme: 'light',
      uiScale: 'normal',
      sortMode: 'added',
      displayMode: 'pills',
      yellowLimit: 21,
      redLimit: 7,
    });
    dataService.getReminderSettings.mockResolvedValue({
      enabled: false,
      slots: [
        { id: 'morning', labelKey: 'reminders.morning', time: '08:00', enabled: true },
        { id: 'noon', labelKey: 'reminders.noon', time: '12:00', enabled: true },
        { id: 'evening', labelKey: 'reminders.evening', time: '18:00', enabled: true },
        { id: 'night', labelKey: 'reminders.night', time: '22:00', enabled: false },
      ],
      lastNotified: {},
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const mountComponent = (props = {}) => {
    return mount(SettingsDialog, {
      props: {
        modelValue: true,
        ...props,
      },
      global: {
        plugins: [vuetify, i18n],
      },
      attachTo: document.body,
    });
  };

  it('hides the reminders section when isReminderSupported is false', async () => {
    reminderService.isReminderSupported.mockReturnValue(false);

    const wrapper = mountComponent();
    await flushPromises();

    expect(document.body.textContent).not.toContain('Tägliche Erinnerungen');
    expect(document.body.textContent).not.toContain('Erhalte neutrale Einnahme-Erinnerungen');
    wrapper.unmount();
  });

  it('shows the reminders section when isReminderSupported is true', async () => {
    reminderService.isReminderSupported.mockReturnValue(true);

    const wrapper = mountComponent();
    await flushPromises();

    expect(document.body.textContent).toContain('Tägliche Erinnerungen');
    expect(document.body.textContent).toContain('Erhalte neutrale Einnahme-Erinnerungen');
    wrapper.unmount();
  });

  it('displays slots and allows adding a custom slot when reminders are enabled', async () => {
    reminderService.isReminderSupported.mockReturnValue(true);
    dataService.getReminderSettings.mockResolvedValue({
      enabled: true,
      slots: [
        { id: 'morning', labelKey: 'reminders.morning', time: '08:00', enabled: true },
        { id: 'noon', labelKey: 'reminders.noon', time: '12:00', enabled: true },
        { id: 'evening', labelKey: 'reminders.evening', time: '18:00', enabled: true },
        { id: 'night', labelKey: 'reminders.night', time: '22:00', enabled: false },
      ],
      lastNotified: {},
    });

    const wrapper = mountComponent();
    await flushPromises();

    // Standard slots are rendered
    expect(document.body.textContent).toContain('Morgens');
    expect(document.body.textContent).toContain('Mittags');
    expect(document.body.textContent).toContain('Abends');
    expect(document.body.textContent).toContain('Zur Nacht');
    expect(document.body.textContent).toContain('Weitere Uhrzeit hinzufügen');
    expect(document.body.textContent).toContain('Test-Benachrichtigung senden');

    wrapper.unmount();
  });

  it('saves reminder settings when toggling the switch and persists on reopen', async () => {
    reminderService.isReminderSupported.mockReturnValue(true);
    dataService.getReminderSettings.mockResolvedValue({
      enabled: false,
      slots: [
        { id: 'morning', labelKey: 'reminders.morning', time: '08:00', enabled: true },
      ],
      lastNotified: {},
    });

    const wrapper = mountComponent();
    await flushPromises();

    const switchInput = document.body.querySelector('.v-switch input');
    expect(switchInput).not.toBeNull();
    switchInput.click();
    await flushPromises();

    // Verify saveReminderSettings was called with enabled: true
    const calls = dataService.saveReminderSettings.mock.calls;
    const lastCallArg = calls[calls.length - 1][0];
    expect(lastCallArg.enabled).toBe(true);

    // Update mock to return what was saved
    dataService.getReminderSettings.mockResolvedValue(lastCallArg);

    // Close dialog
    await wrapper.setProps({ modelValue: false });
    await flushPromises();

    // Reopen dialog
    await wrapper.setProps({ modelValue: true });
    await flushPromises();

    const switchAfterReopen = document.body.querySelector('.v-switch input');
    expect(switchAfterReopen.checked).toBe(true);

    wrapper.unmount();
  });

  it('keeps switch disabled if notification permission is denied', async () => {
    reminderService.isReminderSupported.mockReturnValue(true);
    reminderService.requestNotificationPermission.mockResolvedValue('denied');
    dataService.getReminderSettings.mockResolvedValue({
      enabled: false,
      slots: [
        { id: 'morning', labelKey: 'reminders.morning', time: '08:00', enabled: true },
      ],
      lastNotified: {},
    });

    const wrapper = mountComponent();
    await flushPromises();

    const switchInput = document.body.querySelector('.v-switch input');
    expect(switchInput).not.toBeNull();
    switchInput.click();
    await flushPromises();

    // Last save call should have enabled: false
    const calls = dataService.saveReminderSettings.mock.calls;
    const lastCallArg = calls[calls.length - 1][0];
    expect(lastCallArg.enabled).toBe(false);

    wrapper.unmount();
  });
});
