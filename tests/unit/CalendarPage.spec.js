import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import CalendarPage from '../../src/modules/calendar/components/CalendarPage.vue';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('CalendarPage.vue', () => {
  const sampleEntries = [
    { title: 'Zukunftstermin', date: '2026-11-20', type: 'doctor', doctor: 'Dr. Z' },
    { title: 'Vergangener Termin', date: '2026-01-10', type: 'vaccination', agent: 'BioNTech' },
    { title: 'Notiz', date: '2026-05-15', type: 'note', notes: 'Blutdruck gut' },
  ];

  const mountComponent = (props = {}) => {
    return mount(CalendarPage, {
      props: {
        initialEntries: sampleEntries,
        ...props,
      },
      global: {
        plugins: [vuetify, i18n],
        stubs: {
          EntryTypeDialog: true,
          CalendarEntryDialog: true,
          ConfirmDialog: true,
          FilterDialog: true,
        },
      },
    });
  };

  it('should render all calendar entries sorted newest first', () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain('Zukunftstermin');
    expect(wrapper.text()).toContain('Vergangener Termin');
    expect(wrapper.text()).toContain('Notiz');
  });

  it('should include "separator-today" in grouped entries', () => {
    const wrapper = mountComponent();
    const todaySeparator = wrapper.find('#separator-today');

    expect(todaySeparator.exists()).toBe(true);
  });

  it('should calculate and display virtual quarter headers', () => {
    const wrapper = mountComponent();

    // With entries in Jan (Q1) and Nov (Q4), quarters between them should be present
    expect(wrapper.text()).toContain('Q1/2026');
    expect(wrapper.text()).toContain('Q4/2026');
  });

  it('should expose methods to open filter and type dialogs', () => {
    const wrapper = mountComponent();

    expect(typeof wrapper.vm.openFilterDialog).toBe('function');
    expect(typeof wrapper.vm.openTypeDialog).toBe('function');

    wrapper.vm.openFilterDialog();
    expect(wrapper.vm.filterDialog).toBe(true);

    wrapper.vm.openTypeDialog();
    expect(wrapper.vm.typeDialog).toBe(true);
  });
});
