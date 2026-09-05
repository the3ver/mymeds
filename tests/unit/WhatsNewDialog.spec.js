import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import WhatsNewDialog from '../../src/modules/common/components/WhatsNewDialog.vue';
import * as dataService from '../../src/modules/common/utils/dataService';
import { getLatestChangelog } from '../../src/modules/common/utils/changelog';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('WhatsNewDialog.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mountComponent = (props = {}) => {
    return mount(WhatsNewDialog, {
      props: {
        modelValue: true,
        autoSaveVersion: true,
        ...props
      },
      global: {
        plugins: [vuetify, i18n]
      }
    });
  };

  it('renders the dialog with latest changelog highlights', async () => {
    const latest = getLatestChangelog();
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const text = document.body.textContent;
    expect(text).toContain('Was gibt’s Neues in MyMeds?');
    expect(text).toContain(latest.version);
    expect(text).toContain('Verstanden');
  });

  it('toggles older versions when button is clicked', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const toggleBtn = wrapper.findAllComponents(components.VBtn).find(btn =>
      btn.text().includes('Ältere Versionen anzeigen')
    );
    expect(toggleBtn).toBeDefined();

    await toggleBtn.trigger('click');
    await wrapper.vm.$nextTick();

    const text = document.body.textContent;
    expect(text).toContain('1.4.2');
    expect(text).toContain('1.4.1');
  });

  it('saves last seen version and emits close when close button is clicked', async () => {
    const saveSpy = vi.spyOn(dataService, 'saveLastSeenChangelogVersion').mockResolvedValue(true);
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const closeBtn = wrapper.findAllComponents(components.VBtn).find(btn =>
      btn.text().includes('Verstanden') || btn.text().includes('Got it')
    );
    expect(closeBtn).toBeDefined();

    await closeBtn.trigger('click');
    await wrapper.vm.$nextTick();

    expect(saveSpy).toHaveBeenCalledWith(getLatestChangelog().version);
    expect(wrapper.emitted('update:modelValue')).toBeDefined();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    expect(wrapper.emitted('close')).toBeDefined();
  });
});
