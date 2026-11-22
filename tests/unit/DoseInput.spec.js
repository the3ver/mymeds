import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import DoseInput from '../../src/modules/meds/components/DoseInput.vue';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('DoseInput.vue', () => {
  const mountComponent = (props = {}) => {
    return mount(DoseInput, {
      props,
      global: {
        plugins: [vuetify, i18n]
      }
    });
  };

  it('keeps a keyboard with "/" so fractions like 1/2 can be typed on Android', () => {
    const wrapper = mountComponent({ modelValue: '1/2-0-0' });
    const modes = wrapper.findAll('input').map((input) => input.attributes('inputmode'));

    expect(modes).toHaveLength(4);
    modes.forEach((mode) => expect(['decimal', 'numeric']).not.toContain(mode));
  });

  it('should initialize slots from modelValue formatted as 1-0-1', () => {
    const wrapper = mountComponent({ modelValue: '1-0-1' });
    const inputs = wrapper.findAll('input');

    expect(inputs.length).toBe(4);
    expect(inputs[0].element.value).toBe('1');
    expect(inputs[1].element.value).toBe('0');
    expect(inputs[2].element.value).toBe('1');
    expect(inputs[3].element.value).toBe('');
  });

  it('should initialize 4 slots when 4 parts provided (e.g. 1-1-1-1)', () => {
    const wrapper = mountComponent({ modelValue: '1-1-1-1' });
    const inputs = wrapper.findAll('input');

    expect(inputs[0].element.value).toBe('1');
    expect(inputs[1].element.value).toBe('1');
    expect(inputs[2].element.value).toBe('1');
    expect(inputs[3].element.value).toBe('1');
  });

  it('should initialize single value into morning slot and others to 0', () => {
    const wrapper = mountComponent({ modelValue: '2' });
    const inputs = wrapper.findAll('input');

    expect(inputs[0].element.value).toBe('2');
    expect(inputs[1].element.value).toBe('0');
    expect(inputs[2].element.value).toBe('0');
    expect(inputs[3].element.value).toBe('');
  });

  it('should emit updated modelValue when an input changes', async () => {
    const wrapper = mountComponent({ modelValue: '1-0-0' });
    const inputs = wrapper.findAll('input');

    // Change evening dose (index 2) to 1
    await inputs[2].setValue('1');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeDefined();
    expect(emitted[emitted.length - 1]).toEqual(['1-0-1']);
  });

  it('should include night dose in emitted value when night slot is filled', async () => {
    const wrapper = mountComponent({ modelValue: '1-0-1' });
    const inputs = wrapper.findAll('input');

    // Change night dose (index 3) to 0.5
    await inputs[3].setValue('0.5');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted[emitted.length - 1]).toEqual(['1-0-1-0.5']);
  });

  it('should render consistent "0" placeholders and localized aria-labels on all 4 inputs', () => {
    const wrapper = mountComponent({ modelValue: '' });
    const inputs = wrapper.findAll('input');

    expect(inputs.length).toBe(4);
    inputs.forEach((input) => {
      expect(input.attributes('placeholder')).toBe('0');
    });
    expect(inputs[0].attributes('aria-label')).toBe('Dosis Morgens');
    expect(inputs[1].attributes('aria-label')).toBe('Dosis Mittags');
    expect(inputs[2].attributes('aria-label')).toBe('Dosis Abends');
    expect(inputs[3].attributes('aria-label')).toBe('Dosis Nachts');
  });
});
