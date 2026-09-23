import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import NavDrawer from '../../src/modules/common/components/NavDrawer.vue';
import * as updateService from '../../src/modules/common/utils/updateService';
import * as dataService from '../../src/modules/common/utils/dataService';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

const flushPromises = () => new Promise(setImmediate);

describe('NavDrawer.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(dataService, 'getDatabaseList').mockResolvedValue([]);
  });

  const mountComponent = () => {
    const onWhatsNew = vi.fn();
    const wrapper = mount(
      {
        template: `
          <v-layout>
            <NavDrawer
              :model-value="open"
              @update:model-value="open = $event"
              @open-whats-new="onWhatsNew"
            />
          </v-layout>
        `,
        components: { NavDrawer },
        data: () => ({ open: true }),
        methods: { onWhatsNew }
      },
      {
        global: {
          plugins: [vuetify, i18n],
          stubs: {
            SettingsDialog: {
              name: 'SettingsDialog',
              props: ['modelValue'],
              template: '<div class="settings-dialog-stub"></div>'
            },
            SyncDialog: {
              name: 'SyncDialog',
              props: ['modelValue', 'databases'],
              template: '<div class="sync-dialog-stub"></div>'
            },
            HelpDialog: {
              name: 'HelpDialog',
              props: ['modelValue'],
              template: '<div class="help-dialog-stub"></div>'
            }
          }
        }
      }
    );
    return { wrapper, onWhatsNew, navDrawer: wrapper.findComponent(NavDrawer) };
  };

  it('emits open-whats-new when Whats New list item is clicked', async () => {
    const { wrapper, onWhatsNew, navDrawer } = mountComponent();
    await flushPromises();

    const whatsNewBtn = wrapper.find('[data-testid="nav-whats-new-btn"]');
    expect(whatsNewBtn.exists()).toBe(true);

    await whatsNewBtn.trigger('click');

    expect(onWhatsNew).toHaveBeenCalled();
    expect(navDrawer.emitted('update:modelValue')).toContainEqual([false]);
  });

  it('performs update check and shows success snackbar when up to date', async () => {
    const checkSpy = vi.spyOn(updateService, 'checkForAppUpdates').mockResolvedValue({
      supported: true,
      status: 'up_to_date'
    });

    const { wrapper, navDrawer } = mountComponent();
    await flushPromises();

    const checkBtn = wrapper.find('[data-testid="nav-check-updates-btn"]');
    expect(checkBtn.exists()).toBe(true);

    await checkBtn.trigger('click');
    await new Promise(r => setTimeout(r, 600));
    await flushPromises();

    expect(checkSpy).toHaveBeenCalled();
    const snackbar = navDrawer.findComponent(components.VSnackbar);
    expect(snackbar.exists()).toBe(true);
    expect(snackbar.props('modelValue')).toBe(true);
    expect(snackbar.props('color')).toBe('success');
  });

  it('shows reload button when update is ready', async () => {
    const applySpy = vi.spyOn(updateService, 'applyUpdateAndReload').mockImplementation(() => {});
    const mockRegistration = { waiting: { postMessage: vi.fn() } };
    vi.spyOn(updateService, 'checkForAppUpdates').mockResolvedValue({
      supported: true,
      status: 'update_ready',
      registration: mockRegistration
    });

    const { wrapper, navDrawer } = mountComponent();
    await flushPromises();

    const checkBtn = wrapper.find('[data-testid="nav-check-updates-btn"]');
    await checkBtn.trigger('click');
    await new Promise(r => setTimeout(r, 600));
    await flushPromises();

    const reloadBtn = navDrawer.findAllComponents(components.VBtn).find(btn =>
      btn.text().includes('Jetzt neu laden') || btn.text().includes('Reload Now')
    );
    expect(reloadBtn).toBeDefined();

    await reloadBtn.trigger('click');
    expect(applySpy).toHaveBeenCalledWith(mockRegistration);
  });

  it('opens SettingsDialog when Settings list item is clicked', async () => {
    const { wrapper, navDrawer } = mountComponent();
    await flushPromises();

    const settingsBtn = wrapper.find('[data-testid="nav-settings-btn"]');
    expect(settingsBtn.exists()).toBe(true);

    await settingsBtn.trigger('click');
    await flushPromises();

    const settingsDialog = navDrawer.findComponent({ name: 'SettingsDialog' });
    expect(settingsDialog.exists()).toBe(true);
    expect(settingsDialog.props('modelValue')).toBe(true);
  });

  it('opens SyncDialog when Sync list item is clicked', async () => {
    const { wrapper, navDrawer } = mountComponent();
    await flushPromises();

    const syncBtn = wrapper.find('[data-testid="nav-sync-btn"]');
    expect(syncBtn.exists()).toBe(true);

    await syncBtn.trigger('click');
    await flushPromises();

    const syncDialog = navDrawer.findComponent({ name: 'SyncDialog' });
    expect(syncDialog.exists()).toBe(true);
    expect(syncDialog.props('modelValue')).toBe(true);
  });

  it('opens HelpDialog when Help list item is clicked', async () => {
    const { wrapper, navDrawer } = mountComponent();
    await flushPromises();

    const helpBtn = wrapper.find('[data-testid="nav-help-btn"]');
    expect(helpBtn.exists()).toBe(true);

    await helpBtn.trigger('click');
    await flushPromises();

    const helpDialog = navDrawer.findComponent({ name: 'HelpDialog' });
    expect(helpDialog.exists()).toBe(true);
    expect(helpDialog.props('modelValue')).toBe(true);
  });
});
