import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import WelcomeDialog from '../../src/modules/common/components/WelcomeDialog.vue';
import * as dataService from '../../src/modules/common/utils/dataService';

vi.mock('../../src/modules/common/utils/dataService', () => ({
  saveTheme: vi.fn(),
  saveLocale: vi.fn(),
  saveDisclaimerAccepted: vi.fn(),
}));

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('WelcomeDialog.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });


  const mountComponent = (props = {}) => {
    return mount(WelcomeDialog, {
      props: {
        modelValue: true,
        ...props,
      },
      global: {
        plugins: [vuetify, i18n],
      },
    });
  };

  it('should render language selection, theme selection, and disclaimer points', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const text = document.body.textContent;
    expect(text).toContain('Willkommen bei MyMeds!');
    expect(text).toContain('Wichtiger medizinischer Hinweis & Haftungsausschluss');
    expect(text).toContain('Keine medizinische Beratung');
    expect(text).toContain('Eigenverantwortung');
    expect(text).toContain('Mögliche Softwarefehler');
    expect(text).toContain('Fachliche Rücksprache');
    expect(text).toContain('Notfall');
  });

  it('should disable Get Started button when disclaimer is not accepted', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const getStartedBtn = wrapper.findAllComponents(components.VBtn).find(btn => btn.text().includes('Loslegen') || btn.text().includes('Get Started'));
    expect(getStartedBtn).toBeDefined();
    expect(getStartedBtn.props('disabled')).toBe(true);
  });

  it('should enable Get Started button and save settings when disclaimer is checked and clicked', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const checkbox = wrapper.findComponent(components.VCheckbox);
    expect(checkbox.exists()).toBe(true);

    // Check the disclaimer
    await checkbox.setValue(true);
    await wrapper.vm.$nextTick();

    const getStartedBtn = wrapper.findAllComponents(components.VBtn).find(btn => btn.text().includes('Loslegen') || btn.text().includes('Get Started'));
    expect(getStartedBtn.props('disabled')).toBe(false);

    await getStartedBtn.trigger('click');

    expect(dataService.saveDisclaimerAccepted).toHaveBeenCalledWith(true);
    expect(wrapper.emitted('update:modelValue')).toBeDefined();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
  });

  it('should render adapted title and intro for existing users', async () => {
    const wrapper = mountComponent({ isExistingUser: true });
    await wrapper.vm.$nextTick();

    const text = document.body.textContent;
    expect(text).toContain('Wichtiger Hinweis zur Nutzung');
    expect(text).toContain('Bitte bestätige den aktualisierten medizinischen Hinweis');
    expect(text).not.toContain('Danke, dass du die App installiert hast.');
  });
});
