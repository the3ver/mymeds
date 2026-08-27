import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import HelpDialog from '../../src/modules/common/components/HelpDialog.vue';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('HelpDialog.vue', () => {
  const mountComponent = (props = {}) => {
    return mount(HelpDialog, {
      props: {
        modelValue: true,
        ...props,
      },
      global: {
        plugins: [vuetify, i18n],
      },
    });
  };

  it('should render all 9 user manual sections', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const bodyText = document.body.textContent;
    expect(bodyText).toContain('Benutzerhandbuch');
    expect(bodyText).toContain('Verschlüsselung & Datensicherheit');
    expect(bodyText).toContain('Grundlagen & Offline-Nutzung');
    expect(bodyText).toContain('Medikamente erfassen & verwalten');
    expect(bodyText).toContain('Dosis, Einnahmepläne & Bruchteile');
    expect(bodyText).toContain('Anzeige- & Sortiermodi');
    expect(bodyText).toContain('Automatischer Tagesabzug');
    expect(bodyText).toContain('Warnschwellen & Vorrats-Banner');
    expect(bodyText).toContain('Gesundheitskalender & ICS-Export');
    expect(bodyText).toContain('Datensicherung & Import/Export');
  });

  it('should emit update:modelValue with false when close button is clicked', async () => {
    const wrapper = mountComponent();

    const closeBtn = wrapper.findAllComponents(components.VBtn).find(btn => btn.props('icon') === 'mdi-close');
    expect(closeBtn).toBeDefined();

    await closeBtn.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeDefined();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
  });
});
