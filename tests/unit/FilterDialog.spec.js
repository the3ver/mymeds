import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import FilterDialog from '../../src/modules/calendar/components/FilterDialog.vue';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('FilterDialog.vue', () => {
  const mountComponent = (props = {}) => {
    return mount(FilterDialog, {
      props: {
        modelValue: true,
        selectedFilters: [],
        ...props,
      },
      global: {
        plugins: [vuetify, i18n],
      },
    });
  };

  it('should include open_referrals in available filter types', () => {
    const wrapper = mountComponent();
    const typeValues = wrapper.vm.availableTypes.map((t) => t.value);
    expect(typeValues).toContain('open_referrals');

    const referralType = wrapper.vm.availableTypes.find((t) => t.value === 'open_referrals');
    expect(referralType.title).toBe('Offene Überweisungen');
    expect(referralType.icon).toBe('mdi-file-alert-outline');
    expect(referralType.color).toBe('amber-darken-3');
  });

  it('should emit update:selectedFilters when localFilters is updated', async () => {
    const wrapper = mountComponent({ selectedFilters: [] });
    wrapper.vm.localFilters = ['open_referrals'];
    expect(wrapper.emitted('update:selectedFilters')).toBeTruthy();
    expect(wrapper.emitted('update:selectedFilters')[0][0]).toEqual(['open_referrals']);
  });
});
