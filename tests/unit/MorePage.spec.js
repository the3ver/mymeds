import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import MorePage from '../../src/modules/common/components/MorePage.vue';
import * as dataService from '../../src/modules/common/utils/dataService';
import * as updateService from '../../src/modules/common/utils/updateService';
import { snackbarState, dismissSnackbar } from '../../src/modules/common/utils/snackbarService';
import packageJson from '../../package.json';

vi.mock('../../src/modules/common/utils/dataService', () => ({
  saveTheme: vi.fn().mockResolvedValue(undefined),
  getDatabaseList: vi.fn().mockResolvedValue([{ id: 1, name: 'Tresor' }])
}));

vi.mock('../../src/modules/common/utils/updateService', () => ({
  checkForAppUpdates: vi.fn().mockResolvedValue({ status: 'up_to_date' }),
  applyUpdateAndReload: vi.fn()
}));

// MorePage loads these via defineAsyncComponent; name-based stubs do not reach the async wrapper
vi.mock('../../src/modules/common/components/SettingsDialog.vue', () => ({
  __esModule: true,
  default: { name: 'SettingsDialog', template: '<div data-testid="settings-stub"></div>' }
}));
vi.mock('../../src/modules/common/components/SyncDialog.vue', () => ({
  __esModule: true,
  default: { name: 'SyncDialog', props: ['databases'], template: '<div data-testid="sync-stub"></div>' }
}));
vi.mock('../../src/modules/common/components/HelpDialog.vue', () => ({
  __esModule: true,
  default: { name: 'HelpDialog', template: '<div data-testid="help-stub"></div>' }
}));

const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('MorePage.vue', () => {
  let vuetify;

  beforeEach(() => {
    vi.clearAllMocks();
    dismissSnackbar();
    vuetify = createVuetify({ components, directives, theme: { defaultTheme: 'light' } });
  });

  const mountPage = () => mount(MorePage, { global: { plugins: [vuetify, i18n], stubs: { AboutDialog: true } } });

  it('toggles the theme from the appearance row and stores it', async () => {
    const wrapper = mountPage();

    await wrapper.find('[data-testid="more-theme-toggle"]').trigger('click');

    expect(vuetify.theme.global.name.value).toBe('dark');
    expect(dataService.saveTheme).toHaveBeenCalledWith('dark');
  });

  it('mounts help, settings and sync dialogs only once they are opened', async () => {
    const wrapper = mountPage();
    await flushPromises();
    expect(wrapper.find('[data-testid="help-stub"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="settings-stub"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="sync-stub"]').exists()).toBe(false);

    await wrapper.find('[data-testid="more-help-btn"]').trigger('click');
    await wrapper.find('[data-testid="more-settings-btn"]').trigger('click');
    await wrapper.find('[data-testid="more-sync-btn"]').trigger('click');
    await flushPromises();

    expect(wrapper.find('[data-testid="help-stub"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="settings-stub"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'SyncDialog' }).props('databases')).toEqual([{ id: 1, name: 'Tresor' }]);
  });

  it('forwards data, BMP and whats-new rows to the parent', async () => {
    const wrapper = mountPage();

    await wrapper.find('[data-testid="more-data-btn"]').trigger('click');
    await wrapper.find('[data-testid="more-bmp-scan-btn"]').trigger('click');
    await wrapper.find('[data-testid="more-bmp-export-btn"]').trigger('click');
    await wrapper.find('[data-testid="more-whats-new-btn"]').trigger('click');

    expect(wrapper.emitted('open-data')).toHaveLength(1);
    expect(wrapper.emitted('open-bmp-scan')).toHaveLength(1);
    expect(wrapper.emitted('open-bmp-export')).toHaveLength(1);
    expect(wrapper.emitted('open-whats-new')).toHaveLength(1);
  });

  it('reports the update check result in the global snackbar', async () => {
    vi.useFakeTimers();
    const wrapper = mountPage();

    await wrapper.find('[data-testid="more-check-updates-btn"]').trigger('click');
    await vi.advanceTimersByTimeAsync(500);
    vi.useRealTimers();
    await flushPromises();

    expect(updateService.checkForAppUpdates).toHaveBeenCalledTimes(1);
    expect(snackbarState.open).toBe(true);
    expect(snackbarState.text).toContain(packageJson.version);
  });
});
