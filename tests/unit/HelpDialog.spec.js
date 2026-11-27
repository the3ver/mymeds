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
        ...props
      },
      global: {
        plugins: [vuetify, i18n]
      }
    });
  };

  it('should render all 14 user manual sections', async () => {
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
    expect(bodyText).toContain('Tresore, Sperren & Biometrie');
    expect(bodyText).toContain('Einnahme-Erinnerungen');
    expect(bodyText).toContain('Geräte-Synchronisation (Tresor übertragen)');
    expect(bodyText).toContain('Medikationsplan (BMP / DataMatrix)');
    expect(bodyText).toContain('Rezeptbedarf bis zum nächsten Termin');
  });

  it('has the same help sections in German and English', () => {
    expect(Object.keys(messages.de.help.sections)).toEqual(Object.keys(messages.en.help.sections));
  });

  it('finds the sync section when searching for the sync code', async () => {
    document.body.innerHTML = '';
    const wrapper = mountComponent();
    wrapper.vm.searchQuery = '6-stellig';
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).toContain('Geräte-Synchronisation (Tresor übertragen)');
    expect(document.body.textContent).not.toContain('Gesundheitskalender & ICS-Export');
  });

  it('should include referral tracking details in the calendar section', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const titles = wrapper.findAllComponents(components.VExpansionPanelTitle);
    const calendarTitle = titles.find((t) => t.text().includes('Gesundheitskalender'));
    expect(calendarTitle).toBeDefined();

    await calendarTitle.trigger('click');
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).toContain('Überweisungstracking');
    expect(messages.en.help.sections.calendar.content).toContain('Referral Tracking');
  });

  it('should emit update:modelValue with false when close button is clicked', async () => {
    const wrapper = mountComponent();

    const closeBtn = wrapper.findAllComponents(components.VBtn).find((btn) => btn.props('icon') === 'mdi-close');
    expect(closeBtn).toBeDefined();

    await closeBtn.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeDefined();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
  });

  it('filters manual sections live via search input', async () => {
    document.body.innerHTML = '';
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    const searchInput = document.body.querySelector('[data-testid="help-search-input"] input');
    expect(searchInput).not.toBeNull();
    searchInput.value = 'ICS-Export';
    searchInput.dispatchEvent(new Event('input'));
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).toContain('Gesundheitskalender & ICS-Export');
    expect(document.body.textContent).not.toContain('Verschlüsselung & Datensicherheit');
  });

  it('shows all sections again when the clearable search resets the query to null', async () => {
    document.body.innerHTML = '';
    const wrapper = mountComponent();
    wrapper.vm.searchQuery = 'ICS';
    await wrapper.vm.$nextTick();
    wrapper.vm.searchQuery = null;
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).toContain('Verschlüsselung & Datensicherheit');
    expect(document.body.textContent).toContain('Gesundheitskalender & ICS-Export');
  });
});
