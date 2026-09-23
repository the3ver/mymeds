import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import MedDialog from '../../src/modules/meds/components/MedDialog.vue';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('MedDialog.vue', () => {
  const mountComponent = (props = {}) => {
    return mount(MedDialog, {
      props: {
        modelValue: true,
        ...props,
      },
      global: {
        plugins: [vuetify, i18n],
      },
    });
  };

  it('initializes with daily schedule by default', () => {
    const wrapper = mountComponent({
      med: { name: 'Aspirin', count: 10, dose: '1' }
    });

    expect(document.body.textContent).toContain('Einnahmeturnus');
    expect(document.body.textContent).toContain('Täglich');
    expect(document.body.textContent).toContain('Wöchentlich');
    expect(document.body.textContent).toContain('Alle X Tage');
    expect(wrapper.vm.scheduleType).toBe('daily');
  });

  it('loads existing weekly schedule correctly', () => {
    const wrapper = mountComponent({
      med: {
        name: 'WeeklyMed',
        count: 4,
        dose: '1',
        schedule: { type: 'weekly', days: ['mo', 'fr'] }
      }
    });

    expect(wrapper.vm.scheduleType).toBe('weekly');
    expect(wrapper.vm.weeklyDays).toEqual(['mo', 'fr']);
  });

  it('emits med with weekly schedule on save', async () => {
    const wrapper = mountComponent({
      med: { name: 'NewWeekly', count: 4, dose: '1' }
    });

    wrapper.vm.scheduleType = 'weekly';
    wrapper.vm.weeklyDays = ['mo', 'do'];
    wrapper.vm.save();

    expect(wrapper.emitted('confirm')).toBeDefined();
    const confirmedMed = wrapper.emitted('confirm')[0][0];
    expect(confirmedMed.schedule).toEqual({
      type: 'weekly',
      days: ['mo', 'do']
    });
  });

  it('emits med with interval schedule on save', async () => {
    const wrapper = mountComponent({
      med: { name: 'NewInterval', count: 10, dose: '1' }
    });

    wrapper.vm.scheduleType = 'interval';
    wrapper.vm.intervalDays = 3;
    wrapper.vm.save();

    expect(wrapper.emitted('confirm')).toBeDefined();
    const confirmedMed = wrapper.emitted('confirm')[0][0];
    expect(confirmedMed.schedule).toEqual({
      type: 'interval',
      intervalDays: 3
    });
  });

  it('includes white, amber, and deep-orange in available colors', () => {
    const wrapper = mountComponent({
      med: { name: 'Aspirin', count: 10, dose: '1' }
    });

    expect(wrapper.vm.colors).toContain('white');
    expect(wrapper.vm.colors).toContain('amber');
    expect(wrapper.vm.colors).toContain('deep-orange');
  });

  it('emits selected shape and pillSize on save', async () => {
    const wrapper = mountComponent({
      med: { name: 'CardioASS', count: 30, dose: '1' }
    });

    wrapper.vm.localMed.shape = 'heart';
    wrapper.vm.localMed.pillSize = 'small';
    wrapper.vm.localMed.color = 'deep-orange';
    wrapper.vm.save();

    expect(wrapper.emitted('confirm')).toBeDefined();
    const confirmedMed = wrapper.emitted('confirm')[0][0];
    expect(confirmedMed.shape).toBe('heart');
    expect(confirmedMed.pillSize).toBe('small');
    expect(confirmedMed.color).toBe('deep-orange');
  });
});
